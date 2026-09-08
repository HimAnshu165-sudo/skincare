'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Sparkles, Truck, Award } from 'lucide-react';

export function ShopHeader() {
  return (
    <div className="border-b border-border-subtle bg-surface-base pt-8 pb-10 sm:pt-12 sm:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Editorial Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-brand-mineral">
          <Link href="/" className="hover:text-brand-charcoal transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-border-strong" />
          <span className="text-brand-charcoal font-medium" aria-current="page">
            Shop All
          </span>
        </nav>

        {/* Header Content */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted text-[11px] uppercase tracking-[0.2em] text-brand-amber font-semibold rounded-xs border border-border-subtle">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
            <span>The Velyra Collection</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal tracking-tight">
            Skincare for Modern Indian Living
          </h1>

          <p className="text-sm sm:text-base text-brand-mineral font-normal leading-relaxed max-w-2xl">
            Daily sunscreen and barrier rituals engineered for Indian UV indices, heat, and humidity.
            Clean, weightless formulas that dissolve transparently into bare skin or beneath makeup.
          </p>
        </div>

        {/* Micro Credibility Rail */}
        <div className="pt-4 border-t border-border-subtle/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-brand-mineral">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-amber shrink-0" />
            <span>100% Photostable Filters</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-amber shrink-0" />
            <span>Zero White Cast Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-amber shrink-0" />
            <span>Dermatologically Tested</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-amber shrink-0" />
            <span>COD & Express Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
