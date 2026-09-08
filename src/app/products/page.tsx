import React from 'react';
import { prisma } from '@/lib/prisma';
import { Product } from '@/types';
import { Metadata } from 'next';
import { getAllCatalogProducts } from '@/lib/sunscreenData';
import { ShopAllView } from '@/components/shop/ShopAllView';

export const metadata: Metadata = {
  title: 'Shop All Formulations | VELYRA Skincare',
  description: 'Explore the complete 10-formulation collection of VELYRA dermatologist-engineered photoprotection, barrier repair, and gentle cleansing rituals.',
};

export const revalidate = 60;

export default async function ProductsPage() {
  let dbProducts: Product[] = [];
  try {
    const dbPromise = prisma.product.findMany({
      include: {
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Neon serverless connection timeout')), 3500)
    );

    const raw = (await Promise.race([dbPromise, timeoutPromise])) as any;

    if (raw && Array.isArray(raw) && raw.length > 0) {
      dbProducts = raw.map((p: any) => {
        const blobImageUrls =
          p.productImages && p.productImages.length > 0
            ? p.productImages.map((img: any) => img.url)
            : null;
        const fallbackImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;

        return {
          ...p,
          images: blobImageUrls || fallbackImages,
          benefits: typeof p.benefits === 'string' ? JSON.parse(p.benefits) : p.benefits,
          keyIngredients:
            typeof p.keyIngredients === 'string' ? JSON.parse(p.keyIngredients) : p.keyIngredients,
        };
      }) as Product[];
    }
  } catch (e: any) {
    console.warn('Neon database serverless cold boot/unavailable; serving resilient catalog fallback for /products.');
  }

  // Unified catalog: Guarantees ALL 10 Velyra sunscreens are present, plus any DB products
  const products = getAllCatalogProducts(dbProducts);

  return <ShopAllView initialProducts={products} />;
}
