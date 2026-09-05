'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

interface HeroSectionProps {
  heroProduct?: Product;
}

export function HeroSection({ heroProduct }: HeroSectionProps) {
  const { addItem } = useCart();

  return (
    <section className="relative min-h-[90vh] flex items-center bg-surface-base border-b border-border-subtle overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-surface-muted/60 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Editorial Narrative */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Top Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted border border-border-subtle rounded-full text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-amber animate-pulse"></span>
              <span>The Inaugural Formulation</span>
            </div>

            {/* Main Editorial Headline */}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-brand-charcoal font-normal tracking-tight leading-[1.08]">
                Everyday protection, <span className="italic text-brand-charcoal font-normal">elevated.</span>
              </h1>
              <p className="text-base sm:text-lg text-brand-mineral font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Engineered specifically for Indian UV indices and humidity. A weightless, invisible photoprotection fluid that dissolves seamlessly into bare skin or beneath makeup.
              </p>
            </div>

            {/* Spec Highlights Micro Grid */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-y border-border-subtle/80 py-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <div className="text-xs uppercase tracking-wider text-brand-mineral">Protection</div>
                <div className="font-serif text-lg text-brand-charcoal font-semibold">SPF 50+ PA++++</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-brand-mineral">Finish</div>
                <div className="font-serif text-lg text-brand-charcoal font-semibold">Invisible Dew</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-brand-mineral">Cast</div>
                <div className="font-serif text-lg text-brand-charcoal font-semibold">Zero White Cast</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/products/silk-air-fluid-sunscreen-spf50"
                className="w-full sm:w-auto bg-brand-charcoal text-white px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-brand-mineral transition-all rounded-sm shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Discover Silk-Air Sunscreen</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto border border-border-strong px-7 py-4 text-xs uppercase tracking-widest font-semibold text-brand-charcoal hover:bg-surface-muted transition-colors rounded-sm text-center"
              >
                Our Formulation Ethos
              </Link>
            </div>

            <div className="text-[11px] text-brand-mineral flex items-center justify-center lg:justify-start gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-olive" />
              <span>Tested on Indian skin phototypes • Non-comedogenic • Free express shipping</span>
            </div>
          </div>

          {/* Right Product Hero Showcase */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] bg-surface-muted rounded-2xl overflow-hidden shadow-2xl border border-border-subtle p-8 flex items-center justify-center group">
              {/* Product Visual */}
              <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
                <Image
                  src="/products/sunscreen-hero.webp"
                  alt="VELYRA Silk-Air Fluid Sunscreen SPF 50+"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* Floating Feature Card (Bottom Left) */}
              <div className="absolute bottom-6 left-6 bg-surface-elevated/95 backdrop-blur-sm p-3.5 rounded-sm border border-border-subtle shadow-lg max-w-[210px] text-left hidden sm:block">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-charcoal mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
                  <span>Photostable Matrix</span>
                </div>
                <p className="text-[11px] text-brand-mineral leading-tight">
                  Tinosorb S & Uvinul A Plus filters for zero midday degradation.
                </p>
              </div>

              {/* Floating Price Pill (Top Right) */}
              <div className="absolute top-6 right-6 bg-brand-charcoal text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                ₹899 <span className="line-through text-stone-400 text-[10px] font-normal">₹1,099</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
