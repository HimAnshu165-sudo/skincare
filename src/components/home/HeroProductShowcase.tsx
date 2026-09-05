'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, Check, ShieldCheck, Sparkles, Droplets, Sun, Wind } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface HeroProductShowcaseProps {
  product?: Product;
}

export function HeroProductShowcase({ product }: HeroProductShowcaseProps) {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<'benefits' | 'filters' | 'ritual'>('benefits');

  const defaultProduct: Product = product || {
    id: 'prod_sunscreen_01',
    name: 'Silk-Air Fluid Sunscreen SPF 50+ PA++++',
    slug: 'silk-air-fluid-sunscreen-spf50',
    tagline: 'Weightless broad-spectrum protection crafted for Indian humidity.',
    description: 'An ultra-refined, invisible fluid sunscreen engineered with next-generation UV filters. Dissolves instantaneously into skin with zero white cast, greasy residue, or eye stinging.',
    price: 899.0,
    mrp: 1099.0,
    inStock: true,
    stockQuantity: 250,
    sku: 'VEL-SUN-50ML',
    volume: '50 ml / 1.69 fl. oz.',
    spfRating: 'SPF 50+ • PA++++',
    finish: 'Invisible Velvet Dew',
    skinType: 'All Skin Types • Acne-Safe',
    images: ['/products/sunscreen-hero.webp', '/products/sunscreen-texture.webp'],
    benefits: [
      'Broad Spectrum UVA + UVB + Blue Light Shield',
      'Zero White Cast on all Indian Fitzpatrick skin tones',
      'Sweat & Humidity Resistant without clogging pores',
      'Calms sun-induced erythema with Centella Asiatica'
    ],
    keyIngredients: [
      { name: 'Tinosorb S & Uvinul A Plus', benefit: 'Photostable UV filters.' },
      { name: '2% Niacinamide', benefit: 'Sebum control and tone clarity.' }
    ],
    fullIngredients: 'Aqua, Uvinul A Plus, Tinosorb S, Niacinamide, Centella Asiatica Leaf Extract...',
    howToUse: 'Smooth 2 finger-lengths evenly on face and neck 15 minutes prior to sun exposure.',
    isFeatured: true,
    isUpcoming: false,
    category: 'Sunscreens'
  };

  return (
    <section className="py-24 bg-surface-base border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold block mb-2">
              Featured Innovation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal">
              Silk-Air Fluid Sunscreen
            </h2>
          </div>
          <Link
            href={`/products/${defaultProduct.slug}`}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-brand-charcoal hover:text-brand-amber transition-colors"
          >
            <span>View Complete Clinical Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dual Grid Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Asset */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] lg:aspect-[5/6] bg-surface-muted rounded-2xl overflow-hidden border border-border-subtle p-8 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src="/products/sunscreen-texture.webp"
                alt="VELYRA Sunscreen texture"
                fill
                className="object-contain"
              />
            </div>

            {/* Bottom floating badge */}
            <div className="absolute bottom-6 inset-x-6 bg-surface-elevated/95 backdrop-blur-md p-4 rounded-sm border border-border-subtle flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-brand-mineral block font-medium">Texture Experience</span>
                <span className="font-serif text-sm font-semibold text-brand-charcoal">Featherlight Silk Emulsion</span>
              </div>
              <span className="text-xs font-semibold text-brand-olive bg-brand-olive/10 px-2.5 py-1 rounded-xs">
                Zero Heavy Residue
              </span>
            </div>
          </div>

          {/* Right Product Specs & Purchase */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-serif text-3xl font-semibold text-brand-charcoal">
                  {formatPrice(defaultProduct.price)}
                </span>
                <span className="text-sm text-brand-mineral line-through">
                  MRP {formatPrice(defaultProduct.mrp)}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-xs">
                  Save 18%
                </span>
              </div>
              <p className="text-sm text-brand-mineral leading-relaxed">
                Formulated to solve the 3 biggest problems with Indian sunscreens: white cast, oily shine, and midday sweat breakdown. Formulated with photostable modern European filters.
              </p>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="space-y-4">
              <div className="flex border-b border-border-subtle gap-6 text-xs uppercase tracking-wider font-semibold">
                <button
                  onClick={() => setActiveTab('benefits')}
                  className={`pb-2.5 transition-colors ${
                    activeTab === 'benefits'
                      ? 'border-b-2 border-brand-charcoal text-brand-charcoal'
                      : 'text-brand-mineral hover:text-brand-charcoal'
                  }`}
                >
                  Core Pillars
                </button>
                <button
                  onClick={() => setActiveTab('filters')}
                  className={`pb-2.5 transition-colors ${
                    activeTab === 'filters'
                      ? 'border-b-2 border-brand-charcoal text-brand-charcoal'
                      : 'text-brand-mineral hover:text-brand-charcoal'
                  }`}
                >
                  UV Filter Matrix
                </button>
                <button
                  onClick={() => setActiveTab('ritual')}
                  className={`pb-2.5 transition-colors ${
                    activeTab === 'ritual'
                      ? 'border-b-2 border-brand-charcoal text-brand-charcoal'
                      : 'text-brand-mineral hover:text-brand-charcoal'
                  }`}
                >
                  How to Apply
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[140px] text-xs text-brand-mineral leading-relaxed pt-2">
                {activeTab === 'benefits' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                    <div className="flex items-start gap-3 bg-surface-muted p-3.5 rounded-sm">
                      <Sun className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-brand-charcoal block mb-0.5 font-semibold">Broad Spectrum SPF 50+</strong>
                        High-efficiency photoprotection against UVA aging rays and UVB sunburn.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-surface-muted p-3.5 rounded-sm">
                      <Wind className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-brand-charcoal block mb-0.5 font-semibold">Humidity-Resistant</strong>
                        Holds firm against Indian heat without running into eyes or melting off.
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'filters' && (
                  <div className="space-y-2 animate-fade-in bg-surface-muted p-4 rounded-sm border border-border-subtle">
                    <div className="font-semibold text-brand-charcoal">Tinosorb S + Uvinul A Plus</div>
                    <p className="text-[11px]">
                      Advanced organic filters known globally for supreme photostability. Unlike older chemical filters (like Oxybenzone or Avobenzone), they do not degrade in UV light or cause stinging.
                    </p>
                  </div>
                )}

                {activeTab === 'ritual' && (
                  <div className="space-y-2 animate-fade-in bg-surface-muted p-4 rounded-sm border border-border-subtle">
                    <div className="font-semibold text-brand-charcoal">The Two-Finger Method</div>
                    <p className="text-[11px]">
                      Pump two generous lengths onto your index and middle fingers. Gently press and glide across face, neck, and behind the ears every morning.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => addItem(defaultProduct, 1)}
                className="flex-1 bg-brand-charcoal text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-brand-mineral transition-colors rounded-sm shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag • {formatPrice(defaultProduct.price)}</span>
              </button>
              <Link
                href={`/products/${defaultProduct.slug}`}
                className="border border-border-strong px-6 py-4 text-xs uppercase tracking-widest font-semibold text-brand-charcoal hover:bg-surface-muted transition-colors rounded-sm text-center"
              >
                Explore Details
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
