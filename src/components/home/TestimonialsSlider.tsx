'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { VELYRA_TESTIMONIALS } from '@/lib/sunscreenData';

export function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = VELYRA_TESTIMONIALS.length;
  const current = VELYRA_TESTIMONIALS[currentIndex];

  // Automatic slider transition every 3.5 seconds (pauses strictly when hovering directly over the quote)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex, total]);

  return (
    <section className="py-24 sm:py-32 bg-surface-base border-b border-border-subtle relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-amber font-semibold">
            Verified Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            Voices of Velyra
          </h2>
        </div>

        {/* Minimal Luxury Quote Box (Automatic Slider) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative min-h-[320px] flex flex-col justify-between cursor-default"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 text-center my-auto"
            >
              {/* Rating Stars */}
              <div className="flex items-center justify-center gap-1 text-brand-amber">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-amber" />
                ))}
              </div>

              {/* Large Editorial Quote */}
              <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-charcoal font-normal leading-[1.3] max-w-3xl mx-auto">
                &ldquo;{current.quote}&rdquo;
              </blockquote>

              {/* Customer Credential */}
              <div className="space-y-1">
                <div className="font-serif text-lg font-medium text-brand-charcoal">
                  {current.author}
                </div>
                <div className="text-xs text-brand-mineral">
                  {current.descriptor} • {current.location}
                </div>
                <div className="pt-2 text-[11px] font-mono uppercase tracking-wider text-brand-amber font-semibold">
                  Used: {current.product} • {current.skinType}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
