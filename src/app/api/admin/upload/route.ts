import { NextResponse } from 'next/server';
import { uploadToBlob } from '@/lib/blob';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit';

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
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

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
      return jsonError('No image file provided.', 400);
    }

    // MIME type check
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return jsonError(
        `Invalid file type: ${file.type}. Allowed formats: JPEG, PNG, WebP, AVIF, SVG.`,
        400
      );
    }

    // Size check
    if (file.size > MAX_FILE_SIZE) {
      return jsonError('File size exceeds maximum allowed limit of 12MB.', 400);
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

    await logAdminAction({
      adminUserId: auth.user.id,
      action: 'MEDIA_UPLOADED',
      resourceType: 'MEDIA',
      resourceId: result.pathname,
      metadata: { url: result.url, size: file.size, type: file.type },
      request,
    });

    return jsonSuccess({
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType,
      image: result.imageRecord,
    }, 201);
  } catch (error: any) {
    console.error('Error in /api/admin/upload:', error);
    if (error?.code === 'BLOB_NOT_CONFIGURED') {
      return jsonError(
        'Vercel Blob storage is not configured. Please define BLOB_READ_WRITE_TOKEN in .env to upload assets to the velyra-media store.',
        503,
        { code: 'BLOB_NOT_CONFIGURED' }
      );
    }
    return jsonError(
      error.message || 'Server error uploading image to Vercel Blob store.',
      500,
      { code: 'BLOB_UPLOAD_FAILED' }
    );
  }
}
