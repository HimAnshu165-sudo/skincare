'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Bell, Sparkles } from 'lucide-react';
import { Product } from '@/types';

interface FutureEcosystemProps {
  products: Product[];
}

export function FutureEcosystem({ products }: FutureEcosystemProps) {
  const upcoming = products.filter((p) => p.isUpcoming);

  return (
    <section className="py-24 bg-surface-muted border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold block mb-1">
              Future Formulations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
              The Expanding VELYRA Ritual
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-mineral max-w-md">
            Our upcoming additions to complete your barrier restoration and non-stripping cleansing routine.
          </p>
        </div>

        {/* Upcoming Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {upcoming.map((prod) => {
            const images = Array.isArray(prod.images)
              ? prod.images
              : typeof prod.images === 'string'
              ? JSON.parse(prod.images)
              : ['/products/moisturizer-hero.webp'];
            const img = images[0] || '/products/moisturizer-hero.webp';

            return (
              <div
                key={prod.id}
                className="bg-surface-elevated rounded-sm border border-border-subtle p-8 flex flex-col sm:flex-row gap-6 items-center shadow-sm"
              >
                <div className="relative w-36 h-44 bg-surface-muted rounded-sm flex-shrink-0 p-3 overflow-hidden border border-border-subtle">
                  <Image
                    src={img}
                    alt={prod.name}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-brand-charcoal text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-xs">
                    In Development
                  </div>
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-brand-mineral font-semibold">
                      {prod.category} • {prod.volume}
                    </span>
                    <h3 className="font-serif text-xl text-brand-charcoal font-medium mt-0.5">
                      {prod.name}
                    </h3>
                  </div>

                  <p className="text-xs text-brand-mineral leading-relaxed">
                    {prod.tagline}
                  </p>

                  <div className="pt-2">
                    <Link
                      href={`/products/${prod.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-brand-charcoal hover:text-brand-amber transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5 text-brand-amber" />
                      <span>Preview & Join Waitlist</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
