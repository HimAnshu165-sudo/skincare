import { put, del, list, head } from '@vercel/blob';
import { prisma } from './prisma';

export interface UploadOptions {
  pathname: string;
  file: File | Blob | Buffer;
  contentType?: string;
  productId?: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  width?: number;
  height?: number;
}

/**
 * Validates whether the upload token is available.
 */
export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Securely uploads an asset to Vercel Blob and records it in the PostgreSQL / SQLite database.
 */
export async function uploadToBlob({
  pathname,
  file,
  contentType,
  productId,
  alt = '',
  isPrimary = false,
  sortOrder = 0,
  width,
  height,
}: UploadOptions) {
  // Ensure sanitized pathname
  const cleanPathname = pathname.replace(/^\/+/, '');

  let blobResult;

  if (isBlobConfigured()) {
    // Official Vercel Blob upload with public access
    blobResult = await put(cleanPathname, file, {
      access: 'public',
      contentType,
      addRandomSuffix: false, // Maintain structured pathnames
    });
  } else {
    // Graceful fallback for local development before Vercel token is attached
    console.warn('BLOB_READ_WRITE_TOKEN not set. Simulating upload path.');
    blobResult = {
      url: `/${cleanPathname}`,
      pathname: cleanPathname,
      contentType: contentType || 'image/webp',
      contentDisposition: 'inline',
    };
  }

  // If primary image is being set, reset any existing primary for this product
  if (isPrimary && productId) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
  }

  // Save image record in Database
  const imageRecord = await prisma.productImage.create({
    data: {
      productId: productId || null,
      url: blobResult.url,
      pathname: blobResult.pathname,
      alt: alt || `${cleanPathname.split('/').pop()?.split('.')[0] || 'VELYRA asset'}`,
      sortOrder,
      isPrimary,
      width: width || null,
      height: height || null,
      contentType: blobResult.contentType || contentType || 'image/webp',
      size: file instanceof Blob || file instanceof File ? file.size : Buffer.isBuffer(file) ? file.length : null,
    },
  });

  return {
    success: true,
    url: blobResult.url,
    pathname: blobResult.pathname,
    contentType: blobResult.contentType || contentType,
    imageRecord,
  };
}

/**
 * Deletes an asset from Vercel Blob and removes its database record.
 */
export async function deleteFromBlob(idOrUrl: string) {
  // Find record in DB
  const record = await prisma.productImage.findFirst({
    where: {
      OR: [{ id: idOrUrl }, { url: idOrUrl }, { pathname: idOrUrl }],
    },
  });

  if (record) {
    if (isBlobConfigured() && record.url.startsWith('http')) {
      try {
        await del(record.url);
      } catch (err) {
        console.error('Error deleting from Vercel Blob store:', err);
      }
    }

    await prisma.productImage.delete({
      where: { id: record.id },
    });

    return { success: true, deleted: record };
  }

  // If no DB record but is a direct Blob URL
  if (isBlobConfigured() && idOrUrl.startsWith('http')) {
    await del(idOrUrl);
    return { success: true };
  }

  return { success: false, message: 'Asset not found' };
}
