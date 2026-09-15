'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Filter } from 'lucide-react';
import { VELYRA_SUNSCREENS, VelyraSunscreen } from '@/lib/sunscreenData';
import { SunscreenCard } from './SunscreenCard';
import { ProductDetailModal } from './ProductDetailModal';

export function SunscreenCollection() {
  const [selectedProduct, setSelectedProduct] = useState<VelyraSunscreen | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'fluid' | 'mineral' | 'sport' | 'active'>('all');

  const filteredProducts = VELYRA_SUNSCREENS.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'fluid') return p.code === 'VEL-01' || p.code === 'VEL-03' || p.code === 'VEL-08';
    if (activeFilter === 'mineral') return p.code === 'VEL-02' || p.code === 'VEL-07';
    if (activeFilter === 'sport') return p.code === 'VEL-06' || p.code === 'VEL-10';
    if (activeFilter === 'active') return p.code === 'VEL-04' || p.code === 'VEL-05' || p.code === 'VEL-09';
    return true;
  });

  return (
    <section id="collection" className="py-24 sm:py-32 bg-surface-muted/40 border-b border-border-subtle relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-amber font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-amber animate-pulse" />
              <span>Velyra Sunscreen Collection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal tracking-tight">
              Meet Your Daily Shield
            </h2>
            <p className="text-base sm:text-lg text-brand-mineral font-normal leading-relaxed">
              Everyday protection, designed for modern skin. Ten bespoke formulations engineered for specific skin phototypes, climates, and daily routines.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-brand-charcoal text-white shadow-xs'
                  : 'bg-surface-elevated text-brand-mineral hover:text-brand-charcoal border border-border-subtle'
              }`}
            >
              All 10 Formulations
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('fluid')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'fluid'
                  ? 'bg-brand-charcoal text-white shadow-xs'
                  : 'bg-surface-elevated text-brand-mineral hover:text-brand-charcoal border border-border-subtle'
              }`}
            >
              Ultralight Fluids
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('mineral')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'mineral'
                  ? 'bg-brand-charcoal text-white shadow-xs'
                  : 'bg-surface-elevated text-brand-mineral hover:text-brand-charcoal border border-border-subtle'
              }`}
            >
              100% Mineral
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('sport')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'sport'
                  ? 'bg-brand-charcoal text-white shadow-xs'
                  : 'bg-surface-elevated text-brand-mineral hover:text-brand-charcoal border border-border-subtle'
              }`}
            >
              Sport &amp; Stick
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeFilter === 'active'
                  ? 'bg-brand-charcoal text-white shadow-xs'
                  : 'bg-surface-elevated text-brand-mineral hover:text-brand-charcoal border border-border-subtle'
              }`}
            >
              Barrier &amp; Glow
            </button>
          </div>
        </div>

        {/* Asymmetric Editorial Gallery Grid (Section 6 Requirement) */}
        {/* Product 1 is featured with a larger visual presence, followed by rhythmically varied cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, idx) => {
            // Apply varied visual rhythm: First item on 'all' view is larger, or varied aspect ratios
            const isFirst = idx === 0 && activeFilter === 'all';
            const aspectClass = isFirst
              ? 'aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5]'
              : idx % 2 === 0
              ? 'aspect-[3/4]'
              : 'aspect-[4/5]';

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: Math.min(idx * 0.08, 0.4) }}
              >
                <SunscreenCard
                  product={product}
                  onExplore={(p) => setSelectedProduct(p)}
                  aspectClass={aspectClass}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Editorial Callout */}
        <div className="mt-16 pt-10 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-mineral">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-olive" />
            <span>All 10 formulations dermatologist validated on Indian Fitzpatrick skin phototypes III–VI.</span>
          </div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-brand-charcoal">
            Cruelty-Free • Reef-Conscious • Ophthalmologist Tested
          </div>
        </div>

      </div>

      {/* Cinematic Split Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
