'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';

export function FAQPreview() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Will the Silk-Air Sunscreen leave a white cast or look chalky on dusky skin?',
      a: 'Absolutely not. The Silk-Air Sunscreen is specifically tested on Indian Fitzpatrick phototypes III through VI. It utilizes next-generation soluble organic filters (Tinosorb S & Uvinul A Plus) in an ultra-fine micro-emulsion that dissolves 100% transparently within seconds.',
    },
    {
      q: 'Is it suitable for acne-prone, sensitive, or oily skin in humid summers?',
      a: 'Yes. It is rigorously formulated without heavy pore-clogging waxes, mineral oils, or drying alcohols. It contains 2% Niacinamide to balance excess sebum and Centella Asiatica to reduce heat redness and calm active breakouts.',
    },
    {
      q: 'Does it cause stinging around the eyes when sweating?',
      a: 'No. Unlike older generation UV filters (such as Avobenzone or Oxybenzone) which migrate easily with perspiration and cause eye burn, our modern filter matrix is photostable, sweat-resistant, and ophthalmic-friendly.',
    },
    {
      q: 'How long does shipping take across India?',
      a: 'All orders are dispatched from our fulfillment hub within 24 hours. Metro deliveries (Mumbai, Delhi NCR, Bangalore, Chennai, Hyderabad, Kolkata) typically arrive in 2-3 business days. Tier 2/3 cities arrive within 3-5 business days.',
    },
    {
      q: 'Is Cash on Delivery (COD) supported?',
      a: 'Yes! We offer Cash on Delivery across 98% of serviceable Indian PIN codes without any hidden processing surcharges.',
    },
  ];

  return (
    <section className="py-24 bg-surface-base border-b border-border-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Common Questions
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            Everything you need to know about our formulations.
          </h2>
        </div>

        {/* Accordion List */}
        <div className="border-t border-border-subtle divide-y divide-border-subtle">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-5">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left group gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base sm:text-lg text-brand-charcoal font-medium group-hover:text-brand-amber transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-brand-mineral flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-brand-mineral leading-relaxed animate-fade-in pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="text-center pt-10">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-brand-charcoal hover:text-brand-amber transition-colors"
          >
            <span>View All Skincare, Shipping & COD FAQs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
