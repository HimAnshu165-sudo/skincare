import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Droplets, Sun } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story & Philosophy | VELYRA Skincare',
  description: 'Learn why VELYRA was founded: to create invisible, photostable, dermatologist-tested sun protection and barrier care specifically for Indian climates.',
};

export default function AboutPage() {
  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Our Story & Ethos
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-brand-charcoal font-normal leading-tight">
            Elevating everyday photoprotection for Indian skin.
          </h1>
          <p className="text-base text-brand-mineral leading-relaxed">
            We believe skincare should be an act of calm confidence, not a compromise between sticky textures, chalky white casts, and burning eyes.
          </p>
        </div>

        {/* Feature Visual Grid */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-surface-muted rounded-2xl overflow-hidden border border-border-subtle p-8 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src="/products/sunscreen-lifestyle.webp"
              alt="VELYRA Laboratory formulation"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Section 1: The Problem with Indian Sunscreens */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 space-y-3">
            <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
              The Indian Context
            </span>
            <h2 className="font-serif text-3xl text-brand-charcoal font-normal">
              High UV Index. Extreme Humidity. Melanin-Rich Skin.
            </h2>
          </div>
          <div className="md:col-span-7 space-y-4 text-sm text-brand-mineral leading-relaxed">
            <p>
              India experiences elevated UV indices year-round, making broad-spectrum UVA/UVB defense vital for preventing premature photo-aging, hyperpigmentation, and cellular DNA damage.
            </p>
            <p>
              Yet, conventional mineral sunscreens leave an unacceptable chalky white film on Fitzpatrick skin types III to VI, while traditional chemical filters break down quickly in heat and sweat, stinging the eyes and causing breakouts.
            </p>
          </div>
        </div>

        {/* Section 2: The VELYRA Formulation Standard */}
        <div className="bg-surface-muted p-8 sm:p-12 rounded-2xl border border-border-subtle space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
              The Scientific Standard
            </span>
            <h3 className="font-serif text-3xl text-brand-charcoal font-normal">
              Our 4 Formulation Non-Negotiables
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-brand-mineral">
            <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle space-y-2">
              <Sun className="w-5 h-5 text-brand-amber" />
              <h4 className="font-serif text-base text-brand-charcoal font-medium">1. Photostable Modern Filters</h4>
              <p className="leading-relaxed">
                We use European photostable filters (Tinosorb S, Uvinul A Plus) that do not degrade or generate free radicals in intense midday sunlight.
              </p>
            </div>

            <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle space-y-2">
              <Droplets className="w-5 h-5 text-brand-amber" />
              <h4 className="font-serif text-base text-brand-charcoal font-medium">2. Zero White Cast Guarantee</h4>
              <p className="leading-relaxed">
                Tested and verified on diverse Indian skin tones to ensure 100% invisible melt-in within 10 seconds of application.
              </p>
            </div>

            <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle space-y-2">
              <ShieldCheck className="w-5 h-5 text-brand-olive" />
              <h4 className="font-serif text-base text-brand-charcoal font-medium">3. Non-Comedogenic & Clean</h4>
              <p className="leading-relaxed">
                Zero pore-clogging waxes, zero artificial fragrance, and zero drying denatured alcohol. Safe for acne-prone skin.
              </p>
            </div>

            <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle space-y-2">
              <Sparkles className="w-5 h-5 text-brand-amber" />
              <h4 className="font-serif text-base text-brand-charcoal font-medium">4. Barrier-First Botanical Actives</h4>
              <p className="leading-relaxed">
                Infused with Indian Centella Asiatica, Niacinamide, and Hyaluronic Acid to calm sun-induced heat inflammation.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 pt-6">
          <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
            Ready to experience elevated daily protection?
          </h3>
          <Link
            href="/products/silk-air-fluid-sunscreen-spf50"
            className="inline-flex items-center gap-2 bg-brand-charcoal text-white px-8 py-4 text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-brand-mineral transition-colors shadow-md"
          >
            <span>Discover Silk-Air Sunscreen SPF 50+</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
