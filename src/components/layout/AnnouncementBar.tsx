'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside aria-label="Announcement" className="bg-brand-charcoal text-brand-linen text-[11px] md:text-xs tracking-wider uppercase py-2 px-4 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-center flex items-center justify-center gap-2 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-amber animate-pulse"></span>
          <span>Complimentary Express Shipping Across India on orders over ₹999</span>
          <span className="hidden md:inline text-white/40">•</span>
          <span className="hidden md:inline text-brand-sand">Use code <strong className="text-brand-amber font-semibold">VELYRA10</strong> for 10% off</span>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="text-brand-sand/60 hover:text-white transition-colors p-1"
          aria-label="Close banner"
          suppressHydrationWarning
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
