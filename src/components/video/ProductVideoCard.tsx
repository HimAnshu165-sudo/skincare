'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { VelyraSunscreen } from '@/lib/sunscreenData';
import { CinematicVideoModal } from './CinematicVideoModal';

interface ProductVideoCardProps {
  product?: any;
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  statement?: string;
  aspectClass?: string;
  className?: string;
}

export function ProductVideoCard({
  product,
  videoSrc = '/Hero.mp4',
  posterSrc = '/models/model-apply.jpg',
  title = 'The Velyra Application Ritual',
  statement = 'Light on the skin. Strong on everyday protection.',
  aspectClass = 'aspect-[4/3]',
  className = '',
}: ProductVideoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const effectiveVideo = product?.video || videoSrc;
  const effectivePoster = product?.videoPoster || posterSrc;
  const effectiveTitle = product?.videoTitle || title;
  const effectiveStatement = product?.videoDescription || statement;

  const spfDisplay = product?.spf || product?.spfRating || '';
  const finishDisplay = product?.finish || '';

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-xl border border-border-subtle bg-black cursor-pointer select-none shadow-sm ${aspectClass} ${className}`}
        onClick={() => setModalOpen(true)}
        role="region"
        aria-label={`Video presentation: ${effectiveTitle}`}
      >
        {/* Poster Image with restrained hover scaling (1.00 -> 1.03 per Section 20 Requirement) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src={effectivePoster}
            alt={`Application poster for ${effectiveTitle}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        {/* Subtle Dark Bottom Gradient (Section 3 Requirement) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/15 transition-opacity duration-300 pointer-events-none" />

        {/* Centered Play Button with smooth hover growth (Section 3 & 20 Requirement) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <button
            ref={buttonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 group-hover:border-white/50 transition-all duration-300 shadow-2xl pointer-events-auto focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label={`Watch application video: ${effectiveTitle}`}
          >
            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white translate-x-0.5" />
          </button>
        </div>

        {/* Bottom Poster State Labels (Section 3 Requirement) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1 transform transition-transform duration-300 group-hover:-translate-y-1 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest text-amber-200 rounded-full border border-white/15">
            <span>Watch Application</span>
          </div>

          <div className="font-serif text-base sm:text-lg text-white font-medium leading-snug drop-shadow-sm">
            {effectiveTitle}
          </div>

          {product && (spfDisplay || finishDisplay) && (
            <div className="text-[11px] text-stone-300 font-sans tracking-wide">
              {spfDisplay} {finishDisplay ? `• ${finishDisplay}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Cinematic Modal (Only loads video element when opened to protect performance & LCP) */}
      {modalOpen && (
        <CinematicVideoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={product}
          videoSrc={effectiveVideo}
          posterSrc={effectivePoster}
          title={effectiveTitle}
          statement={effectiveStatement}
          triggerRef={buttonRef}
        />
      )}
    </>
  );
}
