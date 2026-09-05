'use client';

import React from 'react';
import Link from 'next/link';
import { X, ArrowRight, ShieldCheck, HelpCircle, Phone } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ label: string; href: string }>;
}

export function MobileNav({ isOpen, onClose, links }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-surface-base shadow-2xl flex flex-col justify-between p-6 z-10 animate-fade-in border-r border-border-subtle">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
            <span className="font-serif text-2xl tracking-[0.2em] font-medium text-brand-charcoal uppercase">
              VELYRA
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-brand-mineral hover:text-brand-charcoal transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="mt-8 flex flex-col gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between text-base uppercase tracking-wider font-medium text-brand-charcoal hover:text-brand-amber transition-colors group"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-amber" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-border-subtle space-y-4">
          <div className="bg-surface-muted p-3.5 rounded-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-olive flex-shrink-0" />
            <div className="text-[12px] text-brand-charcoal font-medium">
              Dermatologist Formulated • 100% Indian Fitzpatrick Safe
            </div>
          </div>
          <div className="text-xs text-brand-mineral flex items-center justify-between">
            <span>Concierge Support:</span>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-charcoal font-semibold hover:underline"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
