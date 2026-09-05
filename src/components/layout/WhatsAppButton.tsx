'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
  const defaultMessage = encodeURIComponent(
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hello VELYRA, I would like skincare consultation.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end flex-col gap-2">
      {/* Subtle Concierge Popover */}
      {showTooltip && (
        <div className="bg-surface-elevated text-brand-charcoal p-3.5 rounded-sm shadow-xl border border-border-subtle text-xs max-w-xs animate-fade-in relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-1.5 right-1.5 text-brand-mineral hover:text-brand-charcoal"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="font-semibold text-brand-charcoal mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            VELYRA Skin Concierge
          </div>
          <p className="text-brand-mineral text-[11px] leading-relaxed">
            Need advice on UV filters, skin suitability, or order assistance? Chat directly with our skincare specialists.
          </p>
        </div>
      )}

      {/* Button */}
      <a
        href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="group bg-brand-charcoal text-white hover:bg-emerald-700 transition-all duration-300 p-3.5 rounded-full shadow-lg hover:shadow-xl flex items-center gap-2 border border-white/10"
        aria-label="Chat with VELYRA Concierge on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
        <span className="hidden sm:inline-block text-xs font-medium tracking-wider uppercase pr-1">
          Skincare Concierge
        </span>
      </a>
    </div>
  );
}
