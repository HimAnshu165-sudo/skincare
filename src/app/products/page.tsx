import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import { Metadata } from 'next';
import { Sparkles, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Formulations | VELYRA Skincare',
  description: 'Explore the complete collection of VELYRA dermatologist-formulated photoprotection, barrier repair, and gentle cleansing rituals.',
};

import { getStaticFallbackProducts } from '@/lib/sunscreenData';

export const revalidate = 60;

export default async function ProductsPage() {
  let products: Product[] = [];
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
      products = raw.map((p: any) => {
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

  if (products.length === 0) {
    products = getStaticFallbackProducts();
  }

  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-20 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Formulation Catalog
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-charcoal font-normal">
            Skincare for Modern Indian Living
          </h1>
          <p className="text-sm text-brand-mineral leading-relaxed">
            Dermatologically validated active ingredients calibrated for Indian climate resilience. Free from artificial fragrance, harsh drying alcohols, and heavy comedogenic waxes.
          </p>
        </div>

        {/* Category Count Bar */}
        <div className="flex items-center justify-between py-4 border-y border-border-subtle text-xs text-brand-mineral">
          <div className="flex items-center gap-2 font-medium text-brand-charcoal">
            <Filter className="w-4 h-4 text-brand-amber" />
            <span>Showing {products.length} Formulations</span>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-brand-mineral">
            All Pincodes Serviced • COD Available
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Catalog Note */}
        <div className="bg-surface-muted p-8 rounded-sm border border-border-subtle text-center space-y-2 max-w-xl mx-auto">
          <Sparkles className="w-5 h-5 text-brand-amber mx-auto" />
          <h3 className="font-serif text-lg text-brand-charcoal">Small-Batch Integrity</h3>
          <p className="text-xs text-brand-mineral leading-relaxed">
            We formulate in fresh, limited batches to guarantee maximum photostability of our active UV filters and antioxidant botanical extracts.
          </p>
        </div>

      </div>
    </div>
  );
}
