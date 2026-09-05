import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromBlob } from '@/lib/blob';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const productId = searchParams.get('productId');

    const where: any = {};
    if (folder) {
      where.pathname = { startsWith: folder };
    }
    if (productId) {
      where.productId = productId;
    }

    const images = await prisma.productImage.findMany({
      where,
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

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    console.error('Error in GET /api/admin/media:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch media assets.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const url = searchParams.get('url');

    const target = id || url;
    if (!target) {
      return NextResponse.json(
        { success: false, message: 'Image ID or URL is required for deletion.' },
        { status: 400 }
      );
    }

    const result = await deleteFromBlob(target);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/media:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete image.' },
      { status: 500 }
    );
  }
}
