'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const validImages = images && images.length > 0 ? images : ['/products/sunscreen-hero.webp'];
  const currentImage = validImages[selectedIndex] || validImages[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails (Desktop side list, mobile horizontal row) */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
        {validImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`relative w-16 h-20 sm:w-20 sm:h-24 bg-surface-muted rounded-sm flex-shrink-0 overflow-hidden border-2 transition-all ${
              selectedIndex === idx
                ? 'border-brand-charcoal shadow-sm'
                : 'border-transparent hover:border-border-strong opacity-75 hover:opacity-100'
            }`}
            aria-label={`View image ${idx + 1}`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${idx + 1}`}
              fill
              className="object-contain p-1.5"
            />
          </button>
        ))}
      </div>

      {/* Main Showcase Image */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 aspect-[4/5] bg-surface-muted rounded-sm overflow-hidden border border-border-subtle group select-none"
      >
        <div
          className={`relative w-full h-full p-6 sm:p-8 transition-transform duration-500 ease-out cursor-zoom-in ${
            isZoomed ? 'scale-125' : 'scale-100'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={currentImage}
            alt={`${productName} view ${selectedIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain select-none"
          />
        </div>

        {/* Zoom Hint */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-surface-elevated/90 backdrop-blur-sm w-9 h-9 flex items-center justify-center rounded-full text-brand-charcoal hover:bg-surface-elevated shadow-sm transition-all"
          aria-label="Toggle zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Mobile Next / Prev Arrows */}
        {validImages.length > 1 && (
          <div className="lg:hidden absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
            <button
              onClick={handlePrev}
              className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-surface-elevated/85 backdrop-blur-sm rounded-full text-brand-charcoal shadow-md active:scale-95 transition-transform"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-surface-elevated/85 backdrop-blur-sm rounded-full text-brand-charcoal shadow-md active:scale-95 transition-transform"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
