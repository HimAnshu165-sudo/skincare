import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return jsonSuccess({ images });
  } catch (error: any) {
    console.error('Error fetching product images:', error);
    return jsonError('Failed to fetch product images.', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { id: productId } = await params;
    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    const { imageId, isPrimary, alt, sortOrder, reorderedIds } = body || {};

    // Handle full reordering array if provided
    if (Array.isArray(reorderedIds)) {
      for (let i = 0; i < reorderedIds.length; i++) {
        await prisma.productImage.update({
          where: { id: reorderedIds[i] },
          data: { sortOrder: i },
        });
      }
      const updatedList = await prisma.productImage.findMany({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
      });
      return jsonSuccess({ images: updatedList });
    }

    if (!imageId) {
      return jsonError('imageId is required.', 400);
    }

    // If marking as primary, unset others for this product
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        ...(isPrimary !== undefined && { isPrimary }),
        ...(alt !== undefined && { alt }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return jsonSuccess({ image: updated });
  } catch (error: any) {
    console.error('Error updating product image:', error);
    return jsonError('Failed to update image details.', 500);
  }
}
