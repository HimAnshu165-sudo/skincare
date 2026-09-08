import React from 'react';
import dynamic from 'next/dynamic';
import { prisma } from '@/lib/prisma';
import { HeroSection } from '@/components/home/HeroSection';
import { BrandIntroduction } from '@/components/home/BrandIntroduction';
import { SunscreenCollection } from '@/components/home/SunscreenCollection';
import { FormulationStory } from '@/components/home/FormulationStory';
import { TextureLab } from '@/components/home/TextureLab';
import { ModelApplicationVideo } from '@/components/home/ModelApplicationVideo';
import { SunscreenQuiz } from '@/components/home/SunscreenQuiz';
import { RoutineBuilder } from '@/components/home/RoutineBuilder';
import { StoriesSlider } from '@/components/home/StoriesSlider';
import { TestimonialsSlider } from '@/components/home/TestimonialsSlider';
import { FAQPreview } from '@/components/home/FAQPreview';
import { PremiumCTA } from '@/components/home/PremiumCTA';

import { Product } from '@/types';
import { getStaticFallbackProducts } from '@/lib/sunscreenData';

export const revalidate = 60; // ISR revalidation

export default async function HomePage() {
  let products: Product[] = [];
  try {
    // 3.5-second timeout protection for serverless database cold boot
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
    // Graceful offline fallback: log a warning to keep Next.js dev server running cleanly
    console.warn('Neon database serverless cold boot/unavailable; serving resilient catalog fallback.');
  }

  // Ensure products is never empty if database is waking up
  if (products.length === 0) {
    products = getStaticFallbackProducts();
  }

  // Preserve existing hero product logic with guaranteed fallback
  const heroProduct =
    products.find((p) => p.slug === 'silk-air-fluid-sunscreen-spf50') ||
    products[0] ||
    getStaticFallbackProducts()[0];

  return (
    <div className="flex flex-col">
      {/* 1. Existing Hero Section — 100% PRESERVED VISUALLY & STRUCTURALLY */}
      <HeroSection heroProduct={heroProduct} />

      {/* 2. Brand Introduction ("Protection, Reimagined.") */}
      <BrandIntroduction />

      {/* 3. Velyra Sunscreen Collection — 10 Products with Masked Hover Reveal */}
      <SunscreenCollection />

      {/* 4. The Velyra Formula Story (4 Pillars: Protection, Texture, Daily Wear, Skin Feel) */}
      <FormulationStory />

      {/* 5. Sensory Texture Lab (Texture → Application → Finish) */}
      <TextureLab />

      {/* 6. Model Application Video Section ("Light on the skin. Strong on everyday protection.") */}
      <ModelApplicationVideo />

      {/* 9. Find Your Velyra Diagnostic Quiz */}
      <SunscreenQuiz />

      {/* 10. Build Your Sunscreen Routine (5-Step Protocol) */}
      <RoutineBuilder />

      {/* 11. Velyra Stories Horizontal Slider ("Velyra, Everywhere.") */}
      <StoriesSlider />

      {/* 12. Minimal Luxury Testimonials Slider */}
      <TestimonialsSlider />


      {/* 14. Frequently Asked Questions Preview */}
      <FAQPreview />

      {/* 15. Premium Final Campaign CTA */}
      <PremiumCTA />
    </div>
  );
}
