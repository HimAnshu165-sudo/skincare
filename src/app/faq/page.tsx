'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, Truck, ShieldCheck, RefreshCw, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<'sunscreen' | 'shipping' | 'payment' | 'routine'>('sunscreen');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const categories = [
    { id: 'sunscreen', label: 'Sunscreen & Ingredients' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'payment', label: 'Payments & COD' },
    { id: 'routine', label: 'Routine & Suitability' },
  ];

  const faqData = {
    sunscreen: [
      {
        q: 'What UV filters are used in the Silk-Air Sunscreen SPF 50+?',
        a: 'We formulate exclusively with advanced, photostable European organic filters: Tinosorb S (Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine) and Uvinul A Plus (Diethylamino Hydroxybenzoyl Hexyl Benzoate). These filters offer supreme broad-spectrum coverage against both UVA (aging) and UVB (burning) rays without degrading in sunlight or stinging the eyes.',
      },
      {
        q: 'Will this leave a white cast or greyish film on deeper Indian skin tones?',
        a: 'No. The formula is 100% transparent upon application across all Indian skin tones (Fitzpatrick phototypes III through VI). It contains zero inorganic white pigments (such as Titanium Dioxide or Zinc Oxide).',
      },
      {
        q: 'What is the PA rating of the Silk-Air Sunscreen?',
        a: 'It offers a validated PA++++ rating (Persistent Pigment Darkening > 16), which is the highest international standard for UVA and blue light protection.',
      },
      {
        q: 'Is it water and sweat resistant?',
        a: 'Yes, it provides water and humidity resistance for up to 80 minutes, making it ideal for tropical Indian summers and workout sessions.',
      },
    ],
    shipping: [
      {
        q: 'How long will delivery take to my city?',
        a: 'Orders are dispatched within 24 hours from our centralized fulfillment facility. Deliveries to major metros (Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune) typically take 2-3 business days. Tier 2 and Tier 3 cities take 3-5 business days.',
      },
      {
        q: 'What is the shipping charge?',
        a: 'We offer Complimentary Express Shipping on all orders above ₹999 across India. For orders below ₹999, a nominal standard express shipping fee of ₹70 applies.',
      },
      {
        q: 'Which courier services do you use?',
        a: 'We partner exclusively with premium express air logistics networks including Delhivery Express, Bluedart, and DTDC.',
      },
    ],
    payment: [
      {
        q: 'Is Cash on Delivery (COD) available?',
        a: 'Yes, Cash on Delivery is available across 98% of Indian postal codes. You can pay with cash or via UPI QR code directly to the delivery courier.',
      },
      {
        q: 'What online payment methods are accepted?',
        a: 'We support all major Indian payment methods through our secure 256-bit encrypted Razorpay gateway: UPI (Google Pay, PhonePe, Paytm, CRED), Credit/Debit Cards (Visa, Mastercard, RuPay), NetBanking (all major banks), and Wallets.',
      },
    ],
    routine: [
      {
        q: 'Where does the Silk-Air Sunscreen fit into my daily routine?',
        a: 'Sunscreen should always be the final step of your morning skincare routine, applied after your cleanser, toner/serum, and moisturizer. It also doubles as a smooth, velvet-dew primer underneath makeup.',
      },
      {
        q: 'Is it safe for pregnant or lactating mothers?',
        a: 'While our formulation uses ultra-safe, modern filters and is free from endocrine-disrupting chemicals (like Oxybenzone or Octinoxate), we always recommend consulting your obstetrician or dermatologist prior to starting any new active skincare product during pregnancy.',
      },
      {
        q: 'Is it suitable for acne-prone or sensitive skin?',
        a: 'Yes. It is non-comedogenic, oil-free, fragrance-free, and enriched with 2% Niacinamide and Indian Centella Asiatica to calm redness and inflammation.',
      },
    ],
  };

  const currentFaqs = faqData[activeCategory];

  // Schema.org FAQPage JSON-LD
  const allFaqs = [
    ...faqData.sunscreen,
    ...faqData.shipping,
    ...faqData.payment,
    ...faqData.routine,
  ];
  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': allFaqs.map((f) => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a,
      },
    })),
  };

  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Help Center & Science
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-charcoal font-normal">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-brand-mineral max-w-md mx-auto leading-relaxed">
            Everything you need to know regarding our clinical testing, photostable UV filters, and shipping policies across India.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex justify-center gap-2 sm:gap-3 flex-wrap border-b border-border-subtle pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setOpenIdx(0);
              }}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all ${
                activeCategory === cat.id
                  ? 'bg-brand-charcoal text-white shadow-sm'
                  : 'bg-surface-muted text-brand-mineral hover:text-brand-charcoal'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-surface-elevated rounded-sm border border-border-subtle shadow-sm divide-y divide-border-subtle p-6 sm:p-8">
          {currentFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 group"
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

        {/* Support Callout */}
        <div className="bg-surface-muted p-8 rounded-sm border border-border-subtle text-center space-y-3">
          <HelpCircle className="w-5 h-5 text-brand-amber mx-auto" />
          <h3 className="font-serif text-lg text-brand-charcoal">Have a specific question about your skin type?</h3>
          <p className="text-xs text-brand-mineral max-w-sm mx-auto">
            Our skincare specialists are available on WhatsApp from 10 AM to 7 PM IST, Monday to Saturday.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/919876543210?text=Hello%20VELYRA%20I%20have%20a%20question%20regarding%20my%20skin%20routine."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-charcoal text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-brand-mineral transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
