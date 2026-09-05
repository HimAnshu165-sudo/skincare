import React from 'react';

export function BrandStatement() {
  return (
    <section className="bg-surface-muted py-20 sm:py-28 border-b border-border-subtle relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs uppercase tracking-[0.25em] text-brand-amber font-semibold">
          The VELYRA Philosophy
        </span>
        <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-charcoal leading-[1.3] font-normal">
          &ldquo;True photoprotection shouldn&rsquo;t feel like a chore or a compromise. We formulate for humid heat, tropical sun, and Indian skin tones—delivering invisible, barrier-first skincare that feels effortless from sunrise to dusk.&rdquo;
        </blockquote>
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-brand-charcoal/20"></span>
          <span className="text-xs tracking-widest uppercase font-semibold text-brand-mineral">
            Formulated in India • Backed by Clinical Science
          </span>
          <span className="h-px w-8 bg-brand-charcoal/20"></span>
        </div>
      </div>
    </section>
  );
}
