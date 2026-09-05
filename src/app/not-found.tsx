import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-border-subtle text-xs tracking-wider uppercase text-brand-charcoal/70">
          <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
          <span>Page Not Found</span>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-light text-brand-charcoal tracking-tight">
          404
        </h1>

        <p className="text-foreground/70 text-sm md:text-base font-light leading-relaxed">
          The formulation or page you are looking for has been relocated or is no longer part of our current catalogue.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors"
          >
            <span>Return Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-border-strong text-foreground rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-surface-elevated transition-colors"
          >
            Explore Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
