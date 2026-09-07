import React from 'react';
import { prisma } from '@/lib/prisma';
import { HeroSection } from '@/components/home/HeroSection';
import { BrandStatement } from '@/components/home/BrandStatement';
import { HeroProductShowcase } from '@/components/home/HeroProductShowcase';
import { WhyVelyra } from '@/components/home/WhyVelyra';
import { TextureExplorer } from '@/components/home/TextureExplorer';
import { BrandStory } from '@/components/home/BrandStory';
import { FutureEcosystem } from '@/components/home/FutureEcosystem';
import { TrustGuarantees } from '@/components/home/TrustGuarantees';
import { FAQPreview } from '@/components/home/FAQPreview';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { ProductCard } from '@/components/product/ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products: Product[] = [];
  try {
    const raw = await prisma.product.findMany({
      include: {
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    products = raw.map((p) => {
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
    }) as Product[];
  } catch (e) {
    console.error('Error loading products for homepage:', e);
  }

  const heroProduct = products.find((p) => p.slug === 'silk-air-fluid-sunscreen-spf50') || products[0];

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection heroProduct={heroProduct} />

      {/* 2. Brand Statement */}
      <BrandStatement />

      {/* 3. Hero Product Showcase Spotlight */}
      <HeroProductShowcase product={heroProduct} />

      {/* 4. Why VELYRA (Indian Climate Formulation) */}
      <WhyVelyra />

      {/* 5. Sensory Texture Explorer */}
      <TextureExplorer />

      {/* 6. Product Grid Catalog Preview */}
      {products.length > 0 && (
        <section className="py-24 bg-surface-base border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold block mb-1">
                  The Complete Collection
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
                  Dermatologist Formulations
                </h2>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-brand-charcoal hover:text-brand-amber transition-colors"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Brand Genesis & Story */}
      <BrandStory />

      {/* 8. Future Formulation Roadmap */}
      <FutureEcosystem products={products} />

      {/* 9. Trust, Delivery & Verified Guarantees */}
      <TrustGuarantees />

      {/* 10. Frequently Asked Questions Preview */}
      <FAQPreview />

      {/* 11. The Editorial Newsletter */}
      <NewsletterSection />
    </div>
  );
}
