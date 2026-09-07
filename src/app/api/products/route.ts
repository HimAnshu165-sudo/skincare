import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: any = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        price: true,
        mrp: true,
        inStock: true,
        stockQuantity: true,
        sku: true,
        volume: true,
        spfRating: true,
        finish: true,
        skinType: true,
        images: true,
        benefits: true,
        keyIngredients: true,
        isFeatured: true,
        isUpcoming: true,
        category: true,
        createdAt: true,
        productImages: {
          select: { url: true, alt: true, isPrimary: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const parsed = products.map((p) => {
      // Prioritize dynamic productImages from Vercel Blob / DB
      const blobImageUrls = p.productImages && p.productImages.length > 0
        ? p.productImages.map(img => img.url)
        : null;

      const fallbackImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;

      return {
        ...p,
        images: blobImageUrls || fallbackImages,
        benefits: typeof p.benefits === 'string' ? JSON.parse(p.benefits) : p.benefits,
        keyIngredients: typeof p.keyIngredients === 'string' ? JSON.parse(p.keyIngredients) : p.keyIngredients,
      };
    });

    return NextResponse.json({ success: true, products: parsed });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
