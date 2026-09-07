'use client';

import React from 'react';
import { useProcessing } from '@/context/ProcessingContext';
import { Sparkles, ShieldCheck } from 'lucide-react';

export function ProcessingOverlay() {
  const { isProcessing, message, subtitle } = useProcessing();

  if (!isProcessing) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#11100F]/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in select-none"
      style={{ pointerEvents: 'all' }}
    >
      <div className="relative max-w-sm w-full bg-[#1A1918]/95 border border-[#3A3835] rounded-sm p-8 text-center space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-fade-up">
        {/* Ambient Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Custom Luxury Spinner */}
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          
          {/* Inner pulsating ring */}
          <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-lg animate-pulse">
            V
          </div>

          {/* Sparkle badge */}
          <div className="absolute -bottom-1 -right-1 p-1 bg-[#201F1D] border border-amber-500/30 rounded-full text-amber-400 shadow-xs">
            <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-serif text-lg text-[#FAF8F5] tracking-wide font-normal">
            {message}
          </h3>
          <p className="text-xs text-[#A8A196] leading-relaxed max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Brand guarantee footer */}
        <div className="pt-2 border-t border-[#262422] flex items-center justify-center gap-1.5 text-[10px] text-[#7D776E] uppercase tracking-widest font-mono">
          <ShieldCheck className="w-3 h-3 text-amber-400/80" />
          <span>VELYRA Secure Operations</span>
        </div>
      </div>
    </div>
  );
}
