import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

const getCachedProductBySlug = unstable_cache(
  async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) return null;

    const blobImageUrls =
      product.productImages && product.productImages.length > 0
        ? product.productImages.map((img) => img.url)
        : null;

    const fallbackImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;

    return {
      ...product,
      images: blobImageUrls || fallbackImages,
      benefits: typeof product.benefits === 'string' ? JSON.parse(product.benefits) : product.benefits,
      keyIngredients: typeof product.keyIngredients === 'string' ? JSON.parse(product.keyIngredients) : product.keyIngredients,
    };
  },
  ['product-detail-slug'],
  { tags: ['products'], revalidate: 300 }
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getCachedProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, product },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching product by slug:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
