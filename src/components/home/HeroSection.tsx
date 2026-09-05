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
      {/* Background Cinematic Video Layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Full-bleed HTML5 Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/products/sunscreen-lifestyle.webp"
          className="w-full h-full object-cover object-[center_35%] sm:object-center motion-reduce:hidden"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/Hero.mp4" type="video/mp4" />
        </video>

        {/* Fallback Static Visual for prefers-reduced-motion */}
        <div className="hidden motion-reduce:block w-full h-full relative">
          <Image
            src="/products/sunscreen-lifestyle.webp"
            alt=""
            fill
            priority
            className="object-cover object-center"
            aria-hidden="true"
          />
        </div>

        {/* Editorial Protective Gradient & Tint Overlay for Readability */}
        <div className="absolute inset-0 bg-surface-base/70 sm:bg-gradient-to-r sm:from-surface-base/92 sm:via-surface-base/65 sm:to-surface-base/25" />
        <div className="absolute inset-0 bg-brand-charcoal/[0.02] mix-blend-multiply" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
        <div className="max-w-2xl space-y-6 sm:space-y-8 text-left">
          {/* Top Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted/90 backdrop-blur-sm border border-border-subtle rounded-full text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-amber animate-pulse"></span>
            <span>The Inaugural Formulation</span>
          </div>

          {/* Main Editorial Headline */}
          <div className="space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-brand-charcoal font-normal tracking-tight leading-[1.08]">
              Everyday protection, <span className="italic text-brand-charcoal font-normal">elevated.</span>
            </h1>
            <p className="text-base sm:text-lg text-brand-mineral font-normal max-w-xl leading-relaxed">
              Engineered specifically for Indian UV indices and humidity. A weightless, invisible photoprotection fluid that dissolves seamlessly into bare skin or beneath makeup.
            </p>
          </div>

          {/* Spec Highlights Micro Grid */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-y border-border-subtle/80 py-4 max-w-lg text-left bg-surface-base/40 backdrop-blur-[2px] rounded-sm px-2">
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
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href="/products/silk-air-fluid-sunscreen-spf50"
              className="w-full sm:w-auto bg-brand-charcoal text-white px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-brand-mineral transition-all rounded-sm shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Discover Silk-Air Sunscreen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto bg-surface-base/80 backdrop-blur-sm border border-border-strong px-7 py-4 text-xs uppercase tracking-widest font-semibold text-brand-charcoal hover:bg-surface-muted transition-colors rounded-sm text-center shadow-sm"
            >
              Our Formulation Ethos
            </Link>
          </div>

          <div className="text-[11px] text-brand-mineral flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-olive" />
            <span>Tested on Indian skin phototypes • Non-comedogenic • Free express shipping</span>
          </div>
        </div>
      </div>
    </section>
  );
}
