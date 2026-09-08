'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Pause, Play } from 'lucide-react';
import { VELYRA_INGREDIENTS, IngredientFeature } from '@/lib/sunscreenData';

export function IngredientExplorer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const total = VELYRA_INGREDIENTS.length;
  const currentItem: IngredientFeature = VELYRA_INGREDIENTS[currentIndex] || VELYRA_INGREDIENTS[0];

  const goToSlide = useCallback((index: number, newDirection?: 1 | -1) => {
    const targetDir = newDirection ?? (index >= currentIndex ? 1 : -1);
    setDirection(targetDir);
    setCurrentIndex(index);
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play timer: advances smoothly every 3 seconds, pauses strictly when hovering directly over the card
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex, total]);

  // Keyboard navigation when focusing the section
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  }, [nextSlide, prevSlide]);

  // Touch drag end handler
  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -400) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 400) {
      prevSlide();
    }
  };

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="The Velyra Formula Actives Slider"
      className="py-20 sm:py-28 lg:py-32 bg-surface-muted/30 border-b border-border-subtle relative overflow-hidden focus:outline-none"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-amber/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface-muted border border-border-subtle rounded-full text-[11px] font-medium tracking-[0.2em] uppercase text-brand-charcoal">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
            <span>The Velyra Formula</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal tracking-tight">
            The Science Behind the Feel.
          </h2>

          <p className="text-sm sm:text-base text-brand-mineral font-normal leading-relaxed max-w-lg mx-auto">
            Carefully selected actives and modern UV filters, brought together for an effortless daily ritual.
          </p>
        </div>

        {/* Coordinated Editorial Slider Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Ingredient Navigation (Desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 order-2 lg:order-1">
            <div className="space-y-1">
              <div className="text-[11px] font-mono tracking-widest text-brand-mineral uppercase mb-4 px-1">
                Formulation Matrix — 0{total} Actives
              </div>

              <div className="space-y-2">
                {VELYRA_INGREDIENTS.map((item, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      className={`w-full text-left py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-surface-elevated/90 border border-border-subtle shadow-sm'
                          : 'hover:bg-surface-elevated/40 text-brand-mineral border border-transparent'
                      }`}
                      aria-current={isActive ? 'true' : undefined}
                      aria-label={`View ingredient ${idx + 1}: ${item.name}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span
                          className={`font-mono text-xs tracking-wider transition-colors duration-200 ${
                            isActive ? 'text-brand-amber font-semibold' : 'text-brand-mineral/60 group-hover:text-brand-charcoal'
                          }`}
                        >
                          0{idx + 1}
                        </span>
                        
                        <div className="min-w-0">
                          <div
                            className={`font-serif text-base sm:text-lg transition-colors duration-200 truncate ${
                              isActive ? 'text-brand-charcoal font-medium' : 'text-brand-mineral group-hover:text-brand-charcoal'
                            }`}
                          >
                            {item.name}
                          </div>
                          <div
                            className={`text-xs truncate transition-opacity duration-200 ${
                              isActive ? 'text-brand-amber font-medium opacity-100' : 'text-brand-mineral/60 opacity-0 group-hover:opacity-80'
                            }`}
                          >
                            {item.role}
                          </div>
                        </div>
                      </div>

                      {/* Active Indicator Accent Line */}
                      <div className="flex items-center pl-2 shrink-0">
                        {isActive ? (
                          <motion.span
                            layoutId="active-nav-indicator"
                            className="w-5 h-[2px] bg-brand-amber rounded-full"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-border-strong/50 group-hover:bg-brand-charcoal/40 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Large Image-First Visual & Benefit Card */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="bg-surface-elevated rounded-2xl border border-border-subtle overflow-hidden shadow-md cursor-grab active:cursor-grabbing select-none"
            >
              {/* Visual Container (70% Visual Storytelling) */}
              <div className="relative aspect-[16/10] sm:aspect-[16/10] w-full bg-surface-muted overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {!imgErrorMap[currentItem.id] ? (
                      <Image
                        src={currentItem.image}
                        alt={currentItem.name}
                        fill
                        priority={currentIndex === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 700px"
                        className="object-cover object-center"
                        onError={() => setImgErrorMap((prev) => ({ ...prev, [currentItem.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-surface-muted text-brand-mineral p-6 text-center">
                        <Sparkles className="w-10 h-10 text-brand-amber mb-2" />
                        <span className="font-serif text-lg text-brand-charcoal">{currentItem.name}</span>
                        <span className="text-xs text-brand-mineral mt-1">{currentItem.role}</span>
                      </div>
                    )}

                    {/* Gradient Vignette for Editorial Depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

                    {/* Active Pill Badge Overlay */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-[11px] font-mono font-medium text-brand-charcoal shadow-sm">
                        {currentItem.badge}
                      </span>
                    </div>

                    {/* Quick Swipe Hint (Mobile) */}
                    <div className="absolute bottom-4 right-4 sm:hidden z-10 text-[10px] font-mono text-white/80 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      Swipe ↔
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Concise Information Content (20% Information, 10% Interaction) */}
              <div className="p-6 sm:p-8 lg:p-10 space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Header Info */}
                    <div className="space-y-1">
                      <div className="text-xs font-mono uppercase tracking-wider text-brand-amber font-semibold">
                        {currentItem.role}
                      </div>
                      <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium">
                        {currentItem.name}
                      </h3>
                      <p className="text-sm sm:text-base text-brand-mineral leading-relaxed pt-1">
                        {currentItem.tagline}
                      </p>
                    </div>

                    {/* 2–3 Concise Key Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {currentItem.benefits.map((benefit, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-start gap-2.5 bg-surface-muted/60 border border-border-subtle p-3 rounded-xl text-xs font-medium text-brand-charcoal"
                        >
                          <Check className="w-3.5 h-3.5 text-brand-olive shrink-0 mt-0.5" />
                          <span className="leading-snug">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Metadata & EU Standard */}
                    <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-[11px] text-brand-mineral">
                      <span className="font-medium text-brand-charcoal">
                        ✓ 100% Phthalate &amp; Paraben Free
                      </span>
                      <span>Formulated in accordance with EU SCCS Standards</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}
