import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromBlob } from '@/lib/blob';

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

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    console.error('Error fetching product images:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product images.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { imageId, isPrimary, alt, sortOrder, reorderedIds } = body;

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
      return NextResponse.json({ success: true, images: updatedList });
    }

    if (!imageId) {
      return NextResponse.json(
        { success: false, message: 'imageId is required.' },
        { status: 400 }
      );
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

    return NextResponse.json({ success: true, image: updated });
  } catch (error: any) {
    console.error('Error updating product image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update image details.' },
      { status: 500 }
    );
  }
}
