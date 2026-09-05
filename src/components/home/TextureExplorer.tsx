'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, CheckCircle2, Droplets } from 'lucide-react';

export function TextureExplorer() {
  const [activeTexture, setActiveTexture] = useState<'sunscreen' | 'cream' | 'cleanser'>('sunscreen');

  const textures = {
    sunscreen: {
      title: 'Silk-Air Fluid Sunscreen',
      type: 'Featherlight Milk Fluid',
      image: '/products/sunscreen-texture.webp',
      feel: 'Instantly breaks into water on contact with skin. Dries down to an invisible, velvet dewy finish with zero greasy shine or stickiness.',
      specs: ['Zero White Cast', 'Invisible Under Makeup', 'Non-Pore-Clogging', 'Eye-Safe'],
    },
    cream: {
      title: 'Ceramide Barrier Cushion Cream',
      type: 'Whipped Soufflé Emulsion (Coming Soon)',
      image: '/products/moisturizer-texture.webp',
      feel: 'Deep lipid restoration without heavy occlusion. Calms irritated skin barriers and seals in continuous moisture for 24 hours.',
      specs: ['5 Essential Ceramides', 'Squalane Rich', 'Fast-Absorbing', 'Fragrance-Free'],
    },
    cleanser: {
      title: 'Amino Jelly Balancing Cleanser',
      type: 'Low-pH Hydrating Jelly (Coming Soon)',
      image: '/products/cleanser-texture.webp',
      feel: 'Gentle micellar jelly that lifts away sun filters, pollution, and excess sebum without stripping the delicate acid mantle.',
      specs: ['Apple Amino Acids', 'pH 5.5 Balanced', 'Zero Tightness', 'Sulfate-Free'],
    },
  };

  const current = textures[activeTexture];

  return (
    <section className="py-24 bg-surface-base border-b border-border-subtle overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Sensory Experience
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal">
            Textures engineered to feel like nothing on your skin.
          </h2>
          <p className="text-xs sm:text-sm text-brand-mineral leading-relaxed">
            Every VELYRA formulation is benchmarked for instant skin absorption and sensorial luxury in humid climates.
          </p>
        </div>

        {/* Texture Selector Pills */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-12 flex-wrap">
          <button
            onClick={() => setActiveTexture('sunscreen')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTexture === 'sunscreen'
                ? 'bg-brand-charcoal text-white shadow-md'
                : 'bg-surface-muted text-brand-charcoal hover:bg-border-strong'
            }`}
          >
            Silk-Air Sunscreen Fluid
          </button>
          <button
            onClick={() => setActiveTexture('cream')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTexture === 'cream'
                ? 'bg-brand-charcoal text-white shadow-md'
                : 'bg-surface-muted text-brand-charcoal hover:bg-border-strong'
            }`}
          >
            Ceramide Cream
          </button>
          <button
            onClick={() => setActiveTexture('cleanser')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTexture === 'cleanser'
                ? 'bg-brand-charcoal text-white shadow-md'
                : 'bg-surface-muted text-brand-charcoal hover:bg-border-strong'
            }`}
          >
            Amino Jelly Cleanser
          </button>
        </div>

        {/* Interactive Texture Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-muted rounded-2xl p-6 sm:p-12 border border-border-subtle">
          {/* Left Texture Macro View */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-surface-elevated border border-border-subtle p-6 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={current.image}
                alt={current.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute top-4 left-4 bg-brand-charcoal/80 backdrop-blur-sm text-white text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full">
              Macro Swatch View
            </div>
          </div>

          {/* Right Sensory Description */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
                {current.type}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium mt-1">
                {current.title}
              </h3>
            </div>

            <p className="text-sm text-brand-mineral leading-relaxed">
              {current.feel}
            </p>

            {/* Micro specs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {current.specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-brand-charcoal bg-surface-elevated p-3 rounded-sm border border-border-subtle">
                  <CheckCircle2 className="w-4 h-4 text-brand-olive flex-shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
