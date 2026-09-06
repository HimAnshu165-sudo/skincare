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

export interface MediaListItem {
  id: string;
  url: string;
  pathname: string;
  alt: string;
  isPrimary: boolean;
  size?: number | null;
  contentType?: string | null;
  isBlobCdn: boolean;
  createdAt: string | Date;
  product?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Validates whether the Vercel Blob upload token is available.
 */
export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Securely uploads an asset to Vercel Blob and records it in the PostgreSQL database.
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
    // Graceful fallback for local development when Vercel token is not yet in .env
    console.warn('BLOB_READ_WRITE_TOKEN not configured in .env. Falling back to local URL path.');
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
    isBlobCdn: isBlobConfigured(),
  };
}

/**
 * Lists media items from Vercel Blob and PostgreSQL.
 */
export async function listBlobMedia(folder?: string, productId?: string) {
  const isConfigured = isBlobConfigured();

  // 1. Fetch DB records
  const dbWhere: any = {};
  if (folder) {
    dbWhere.pathname = { startsWith: folder };
  }
  if (productId) {
    dbWhere.productId = productId;
  }

  const dbImages = await prisma.productImage.findMany({
    where: dbWhere,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // If Blob is not configured, return DB records with local flag
  if (!isConfigured) {
    return {
      isBlobConfigured: false,
      storeName: 'local-fallback',
      images: dbImages.map((img) => ({
        id: img.id,
        url: img.url,
        pathname: img.pathname,
        alt: img.alt,
        isPrimary: img.isPrimary,
        size: img.size,
        contentType: img.contentType,
        isBlobCdn: img.url.includes('blob.vercel-storage.com'),
        createdAt: img.createdAt,
        product: img.product,
      })),
    };
  }

  // 2. Fetch live blobs from Vercel Blob store
  try {
    const blobList = await list({
      prefix: folder ? (folder.endsWith('/') ? folder : `${folder}/`) : undefined,
    });

    const dbMapByPath = new Map<string, typeof dbImages[0]>();
    const dbMapByUrl = new Map<string, typeof dbImages[0]>();
    dbImages.forEach((img) => {
      dbMapByPath.set(img.pathname, img);
      dbMapByUrl.set(img.url, img);
    });

    const mergedImages: MediaListItem[] = [];
    const matchedDbIds = new Set<string>();

    for (const b of blobList.blobs) {
      const dbMatch = dbMapByPath.get(b.pathname) || dbMapByUrl.get(b.url);
      if (dbMatch) {
        matchedDbIds.add(dbMatch.id);
        mergedImages.push({
          id: dbMatch.id,
          url: b.url,
          pathname: b.pathname,
          alt: dbMatch.alt,
          isPrimary: dbMatch.isPrimary,
          size: b.size,
          contentType: dbMatch.contentType || 'image/webp',
          isBlobCdn: true,
          createdAt: b.uploadedAt || dbMatch.createdAt,
          product: dbMatch.product,
        });
      } else {
        mergedImages.push({
          id: `blob_${b.pathname}`,
          url: b.url,
          pathname: b.pathname,
          alt: b.pathname.split('/').pop()?.split('.')[0] || 'Vercel Blob Object',
          isPrimary: false,
          size: b.size,
          contentType: 'image/webp',
          isBlobCdn: true,
          createdAt: b.uploadedAt,
          product: null,
        });
      }
    }

    // Append any DB records that might not have been returned in the prefix filter
    for (const img of dbImages) {
      if (!matchedDbIds.has(img.id)) {
        mergedImages.push({
          id: img.id,
          url: img.url,
          pathname: img.pathname,
          alt: img.alt,
          isPrimary: img.isPrimary,
          size: img.size,
          contentType: img.contentType,
          isBlobCdn: img.url.includes('blob.vercel-storage.com'),
          createdAt: img.createdAt,
          product: img.product,
        });
      }
    }

    return {
      isBlobConfigured: true,
      storeName: 'velyra-media',
      images: mergedImages,
    };
  } catch (err: any) {
    console.error('Error querying @vercel/blob list():', err);
    return {
      isBlobConfigured: true,
      storeName: 'velyra-media',
      error: err.message,
      images: dbImages.map((img) => ({
        id: img.id,
        url: img.url,
        pathname: img.pathname,
        alt: img.alt,
        isPrimary: img.isPrimary,
        size: img.size,
        contentType: img.contentType,
        isBlobCdn: img.url.includes('blob.vercel-storage.com'),
        createdAt: img.createdAt,
        product: img.product,
      })),
    };
  }
}

/**
 * Deletes an asset from Vercel Blob and removes its database record.
 */
export async function deleteFromBlob(idOrUrl: string) {
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

  if (isBlobConfigured() && idOrUrl.startsWith('http')) {
    await del(idOrUrl);
    return { success: true };
  }

  return { success: false, message: 'Asset not found' };
}
