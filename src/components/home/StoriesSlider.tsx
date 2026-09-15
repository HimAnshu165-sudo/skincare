'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { VELYRA_STORIES } from '@/lib/sunscreenData';

export function StoriesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = VELYRA_STORIES.length;
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  // Automatic slider transition every 3.5 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section className="py-16 sm:py-24 bg-surface-muted/40 border-b border-border-subtle relative overflow-hidden">
      {/* Section Header (Centered Content Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mb-8 sm:mb-12">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-amber font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lifestyle Campaign</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal tracking-tight">
            Velyra, Everywhere.
          </h2>
          <p className="text-base text-brand-mineral font-normal leading-relaxed">
            From morning urban traffic to high-altitude flights and coastal sun—photoprotection that moves with your life.
          </p>
        </div>
      </div>

      {/* 100% Full-Width Stories Horizontal Slider Viewport */}
      <div
        ref={sliderRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full relative overflow-hidden border-y border-border-subtle shadow-xl bg-black group select-none"
      >
        <motion.div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {VELYRA_STORIES.map((slide) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0"
            >
              <div className="relative w-full h-[340px] sm:h-[460px] lg:h-[520px] overflow-hidden bg-black">
                <Image
                  src={slide.image}
                  alt={slide.headline}
                  fill
                  sizes="100vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                
                {/* Subtle Gradient Veil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 pointer-events-none" />

                {/* Slide Content Overlay (Aligned to site's max-w-7xl grid for typography harmony) */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-full flex flex-col justify-between py-6 sm:py-10 lg:py-12">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest rounded-full border border-white/20 shrink-0">
                        {slide.category}
                      </span>
                      <span className="text-[11px] text-stone-300 font-serif italic truncate max-w-[160px] sm:max-w-none">
                        Paired with {slide.sunscreenUsed}
                      </span>
                    </div>

                    <div className="max-w-2xl space-y-2">
                      <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight drop-shadow-md">
                        {slide.headline}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg drop-shadow-sm line-clamp-3 sm:line-clamp-none">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Previous Slide Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2.5 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all duration-300 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 z-20 pointer-events-auto shadow-xl hover:scale-105"
          aria-label="Previous story"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Next Slide Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-2.5 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all duration-300 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 z-20 pointer-events-auto shadow-xl hover:scale-105"
          aria-label="Next story"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Slide Navigation Dots */}
      <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
        {VELYRA_STORIES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-8 bg-brand-charcoal'
                : 'w-2 bg-brand-charcoal/25 hover:bg-brand-charcoal/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
