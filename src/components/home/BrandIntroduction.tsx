'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';

export function BrandIntroduction() {
  return (
    <section className="relative py-24 sm:py-32 bg-surface-base border-b border-border-subtle overflow-hidden">
      {/* Editorial Decorative Background Elements */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-40" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-brand-sand/30 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Editorial Statement */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted border border-border-subtle rounded-full text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal">
              <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
              <span>The VELYRA Manifesto</span>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-brand-charcoal font-normal tracking-tight leading-[1.08]">
                Protection, <span className="italic font-normal">reimagined.</span>
              </h2>
              <p className="text-lg sm:text-xl text-brand-mineral font-normal leading-relaxed max-w-xl">
                Velyra is designed around the idea that daily sun protection should feel effortless, lightweight, and beautiful enough to become part of every routine.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-border-subtle max-w-xl">
              <div>
                <div className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium">100%</div>
                <div className="text-[11px] uppercase tracking-wider text-brand-mineral mt-1">Zero White Cast</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium">SPF 50+</div>
                <div className="text-[11px] uppercase tracking-wider text-brand-mineral mt-1">European Filters</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium">&lt; 10s</div>
                <div className="text-[11px] uppercase tracking-wider text-brand-mineral mt-1">Skin Absorption</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-brand-mineral pt-2">
              <ShieldCheck className="w-4 h-4 text-brand-olive flex-shrink-0" />
              <span>Engineered specifically for humid tropical climates & melanin-rich phototypes.</span>
            </div>
          </motion.div>

          {/* Right: Strong Editorial Campaign Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-border-subtle bg-surface-muted">
              <Image
                src="/products/sunscreen-collection/01-silk-air.jpg"
                alt="VELYRA Silk-Air Sunscreen Campaign Visual"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 inset-x-6 bg-surface-base/90 backdrop-blur-md p-4 rounded-sm border border-border-subtle">
                <span className="text-[10px] uppercase tracking-widest text-brand-amber font-bold block mb-0.5">
                  Formula No. 01
                </span>
                <div className="font-serif text-base text-brand-charcoal font-medium">
                  Silk-Air Photoprotection Fluid
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
