'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export function PremiumCTA() {
  return (
    <section className="relative py-28 sm:py-36 bg-surface-dark text-white overflow-hidden border-t border-white/10">
      {/* Cinematic Background Image Layer */}
      <div className="absolute inset-0 w-full h-full opacity-45 pointer-events-none">
        <Image
          src="/products/sunscreen-collection/01-silk-air.jpg"
          alt="VELYRA Luxury Finish Campaign"
          fill
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/80 to-surface-dark/40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-amber border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Daily Ritual</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight leading-[1.08]">
            Make SPF your everyday essential.
          </h2>

          <p className="font-serif text-xl sm:text-2xl text-stone-300 italic font-normal">
            Meet the Velyra finish.
          </p>

          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed pt-2">
            Weightless, photostable, zero white cast photoprotection engineered for Indian skin and humidity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#collection"
            className="w-full sm:w-auto bg-white text-brand-charcoal px-9 py-4 text-xs uppercase tracking-widest font-semibold hover:bg-brand-sand transition-all rounded-sm shadow-xl flex items-center justify-center gap-2 group text-center"
          >
            <span>Shop Velyra</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#quiz"
            className="w-full sm:w-auto border border-white/30 backdrop-blur-md px-8 py-4 text-xs uppercase tracking-widest font-semibold text-white hover:bg-white/10 transition-colors rounded-sm text-center"
          >
            Take the Skin Diagnostic
          </a>
        </motion.div>

        <div className="pt-6 flex items-center justify-center gap-6 text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-amber" />
            <span>Dermatologist Approved</span>
          </div>
          <span>•</span>
          <div>Free Express Pan-India Shipping</div>
          <span>•</span>
          <div>COD Available</div>
        </div>

      </div>
    </section>
  );
}
