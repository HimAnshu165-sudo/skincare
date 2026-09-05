import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const blobImageUrls = product.productImages && product.productImages.length > 0
      ? product.productImages.map(img => img.url)
      : null;

    const fallbackImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;

    const parsed = {
      ...product,
      images: blobImageUrls || fallbackImages,
      benefits: typeof product.benefits === 'string' ? JSON.parse(product.benefits) : product.benefits,
      keyIngredients: typeof product.keyIngredients === 'string' ? JSON.parse(product.keyIngredients) : product.keyIngredients,
    };

    return NextResponse.json({ success: true, product: parsed });
  } catch (error: any) {
    console.error('Error fetching product by slug:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
