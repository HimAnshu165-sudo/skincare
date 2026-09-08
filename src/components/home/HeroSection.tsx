'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';

interface HeroSectionProps {
  heroProduct?: Product;
}

export function HeroSection({ heroProduct }: HeroSectionProps) {
  return (
    <section className="relative min-h-[92vh] sm:min-h-[88vh] lg:min-h-[92vh] flex items-center bg-surface-base border-b border-border-subtle overflow-hidden">
      {/* 1. Background Cinematic Video & Poster Layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Full-bleed HTML5 Video with Responsive Object Framing */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/products/sunscreen-lifestyle.webp"
          className="w-full h-full object-cover object-[center_15%] sm:object-[65%_center] lg:object-[72%_30%] xl:object-[76%_32%] motion-reduce:hidden"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/Hero.mp4" type="video/mp4" />
        </video>

        {/* Static Visual for prefers-reduced-motion */}
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

        {/* 2. Responsive Multi-Stop Warm Editorial Scrim / Gradient Rail */}
        {/* Mobile Scrim (Vertical gradient from clear visual zone to readable bottom text zone) */}
        <div 
          className="absolute inset-0 sm:hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(250,248,245,0.08) 0%, rgba(250,248,245,0.2) 20%, rgba(250,248,245,0.65) 36%, rgba(250,248,245,0.92) 50%, rgba(250,248,245,0.99) 70%, rgba(250,248,245,1) 100%)'
          }}
          aria-hidden="true"
        />

        {/* Tablet Scrim (Diagonal blend for medium viewports) */}
        <div 
          className="hidden sm:block lg:hidden absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, rgba(250,248,245,0.98) 0%, rgba(250,248,245,0.92) 36%, rgba(250,248,245,0.72) 54%, rgba(250,248,245,0.3) 72%, rgba(250,248,245,0) 86%)'
          }}
          aria-hidden="true"
        />

        {/* Desktop Scrim (Seamless horizontal ivory gradient rail occupying the left 45% then softly fading) */}
        <div 
          className="hidden lg:block absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(250,248,245,0.98) 0%, rgba(250,248,245,0.95) 28%, rgba(250,248,245,0.85) 38%, rgba(250,248,245,0.52) 50%, rgba(250,248,245,0.20) 64%, rgba(250,248,245,0) 78%)'
          }}
          aria-hidden="true"
        />

        {/* Subtle tonal unification */}
        <div className="absolute inset-0 bg-[#1A1918]/[0.015] mix-blend-multiply pointer-events-none" aria-hidden="true" />
      </div>

      {/* 3. Hero Editorial Content (Positioned in the left 40-45% rail) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-[600px] xl:max-w-[640px] space-y-6 sm:space-y-7 lg:space-y-8 text-left">
          
          {/* Eyebrow Label */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted/95 border border-border-subtle rounded-full text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-amber animate-pulse"></span>
              <span>The Inaugural Formulation</span>
            </div>
          </div>

          {/* Large Editorial Headline */}
          <div className="space-y-3">
            <h1 className="font-serif text-[2.1rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] text-brand-charcoal font-normal tracking-tight leading-[1.08]">
              Everyday protection, <span className="italic font-normal">elevated.</span>
            </h1>
            <p className="text-base sm:text-lg text-brand-mineral font-normal max-w-lg leading-relaxed">
              Engineered specifically for Indian UV indices and humidity. A weightless, invisible photoprotection fluid that dissolves seamlessly into bare skin or beneath makeup.
            </p>
          </div>

          {/* Spec Highlights Micro Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 pb-3 border-y border-border-subtle/80 max-w-lg">
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-brand-mineral">Protection</div>
              <div className="font-serif text-sm sm:text-base md:text-lg text-brand-charcoal font-medium mt-0.5 whitespace-nowrap">SPF 50+ PA++++</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-brand-mineral">Finish</div>
              <div className="font-serif text-sm sm:text-base md:text-lg text-brand-charcoal font-medium mt-0.5 whitespace-nowrap">Invisible Dew</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-brand-mineral">Cast</div>
              <div className="font-serif text-sm sm:text-base md:text-lg text-brand-charcoal font-medium mt-0.5 whitespace-nowrap">Zero White Cast</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
            <Link
              href="/products/silk-air-fluid-sunscreen-spf50"
              className="bg-brand-charcoal text-white px-8 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-brand-mineral transition-all rounded-sm shadow-sm flex items-center justify-center gap-2 group text-center"
            >
              <span>Discover Silk-Air Sunscreen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="border border-border-strong bg-surface-base/60 backdrop-blur-xs px-7 py-4 text-xs uppercase tracking-widest font-semibold text-brand-charcoal hover:bg-surface-muted transition-colors rounded-sm text-center"
            >
              Our Formulation Ethos
            </Link>
          </div>

          {/* Trust Support Line */}
          <div className="text-[11px] text-brand-mineral flex items-center gap-2 pt-1">
            <ShieldCheck className="w-4 h-4 text-brand-olive shrink-0" />
            <span>Tested on Indian skin phototypes • Non-comedogenic • Free express shipping</span>
          </div>

        </div>
      </div>
    </section>
  );
}
