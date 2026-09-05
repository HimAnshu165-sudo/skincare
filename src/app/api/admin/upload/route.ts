import { NextResponse } from 'next/server';
import { uploadToBlob } from '@/lib/blob';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB limit

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';
    const productSlug = (formData.get('productSlug') as string) || '';
    const productId = (formData.get('productId') as string) || '';
    const alt = (formData.get('alt') as string) || '';
    const isPrimary = formData.get('isPrimary') === 'true';
    const sortOrder = parseInt((formData.get('sortOrder') as string) || '0', 10);
    const customFilename = (formData.get('filename') as string) || '';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided.' },
        { status: 400 }
      );
    }

    // MIME type check
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file type: ${file.type}. Allowed formats: JPEG, PNG, WebP, AVIF, SVG.`,
        },
        { status: 400 }
      );
    }

    // Size check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds maximum allowed limit of 12MB.' },
        { status: 400 }
      );
    }

    // Clean filename
    const origName = customFilename || file.name;
    const sanitizedName = origName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');

    // Build structured logical pathname
    let targetPathname = '';
    if (folder === 'products' && productSlug) {
      targetPathname = `products/${productSlug}/${sanitizedName}`;
    } else if (folder === 'products' && !productSlug) {
      targetPathname = `products/general/${sanitizedName}`;
    } else {
      targetPathname = `${folder}/${sanitizedName}`;
    }

    // Convert to buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Vercel Blob and save to Database
    const result = await uploadToBlob({
      pathname: targetPathname,
      file: buffer,
      contentType: file.type,
      productId: productId || undefined,
      alt: alt || `${sanitizedName.split('.')[0].replace(/-/g, ' ')}`,
      isPrimary,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType,
      image: result.imageRecord,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/upload:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error uploading image to Vercel Blob.' },
      { status: 500 }
    );
  }
}
