'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="py-24 bg-surface-muted border-b border-border-subtle text-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
          The VELYRA Circle
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
          Join for private access & thoughtful skincare insights.
        </h2>
        <p className="text-xs sm:text-sm text-brand-mineral leading-relaxed">
          Receive priority notification on new small-batch launches, dermatologist formulation deep-dives, and an instant 10% privilege code on your first order.
        </p>

        {submitted ? (
          <div className="bg-surface-elevated p-6 rounded-sm border border-brand-sand inline-flex items-center gap-3 text-emerald-800 text-xs font-medium animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Welcome to VELYRA. Your exclusive invitation and 10% code <strong>VELYRA10</strong> is active!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-surface-elevated border border-border-subtle px-4 py-3.5 text-xs text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-sm"
            />
            <button
              type="submit"
              className="bg-brand-charcoal text-white px-6 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-brand-mineral transition-colors rounded-sm shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <p className="text-[11px] text-brand-mineral">
          We honor your inbox. Zero spam, unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
