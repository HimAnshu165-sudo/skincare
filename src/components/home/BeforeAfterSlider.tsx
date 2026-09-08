'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  aspectClass?: string;
}

export function BeforeAfterSlider({
  beforeImage = '/models/before-skin.jpg',
  afterImage = '/models/after-skin.jpg',
  beforeLabel = 'Bare Skin',
  afterLabel = 'Velyra Finish',
  className = '',
  aspectClass = 'aspect-square sm:aspect-[4/3]',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize container width on mount, resize, and orientation shift
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', updateWidth);
    window.addEventListener('orientationchange', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('orientationchange', updateWidth);
    };
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl border border-border-subtle bg-surface-muted cursor-ew-resize touch-none ${aspectClass} ${className}`}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }
      }}
      role="slider"
      aria-label="Before and after skin finish slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setSliderPosition((p) => Math.max(0, p - 5));
        if (e.key === 'ArrowRight') setSliderPosition((p) => Math.min(100, p + 5));
      }}
    >
      {/* Background Image: AFTER (Velyra Finish) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={afterImage}
          alt="After Velyra Sunscreen Application"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center pointer-events-none"
          priority={false}
        />
        <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 bg-brand-charcoal/80 text-white backdrop-blur-md text-[10px] uppercase tracking-widest font-semibold rounded-xs shadow-xs pointer-events-none">
          {afterLabel}
        </div>
      </div>

      {/* Foreground Image: BEFORE (Bare Skin) clipped by sliderPosition */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full min-w-[100%]">
          {/* We must set container of image to full container width to avoid shrinking */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              width: containerWidth ? `${containerWidth}px` : (containerRef.current ? `${containerRef.current.clientWidth}px` : '100%'),
              height: '100%',
            }}
          >
            <Image
              src={beforeImage}
              alt="Before Application - Bare Skin"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center pointer-events-none"
              priority={false}
            />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 bg-surface-base/90 text-brand-charcoal backdrop-blur-md text-[10px] uppercase tracking-widest font-semibold rounded-xs shadow-xs border border-border-subtle pointer-events-none">
          {beforeLabel}
        </div>
      </div>

      {/* Vertical Divider Line with handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-surface-base border-2 border-brand-charcoal shadow-xl flex items-center justify-center text-brand-charcoal text-xs font-bold">
          <span>⇄</span>
        </div>
      </div>

      {/* Subtle Drag Prompt Overlay */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-surface-base/80 backdrop-blur-xs rounded-full border border-border-subtle text-[10px] uppercase tracking-widest text-brand-charcoal pointer-events-none opacity-80">
        Drag to Compare
      </div>
    </div>
  );
}
