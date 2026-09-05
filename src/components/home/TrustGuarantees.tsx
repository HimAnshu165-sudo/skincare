import React from 'react';
import { ShieldCheck, Truck, RefreshCw, CreditCard, Sparkles, Award } from 'lucide-react';

export function TrustGuarantees() {
  const guarantees = [
    {
      icon: ShieldCheck,
      title: 'Dermatologically Tested',
      desc: 'Formulated with certified non-comedogenic, cruelty-free, and photostable ingredients.',
    },
    {
      icon: Truck,
      title: 'Free Express Delivery',
      desc: 'Dispatched via premium air couriers (Bluedart, Delhivery) across 26,000+ Indian PIN codes.',
    },
    {
      icon: RefreshCw,
      title: 'Cash on Delivery (COD)',
      desc: 'Pay easily upon receiving your package at your doorstep anywhere in India.',
    },
    {
      icon: CreditCard,
      title: '100% Encrypted Payments',
      desc: 'Seamless UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and NetBanking.',
    },
  ];

  return (
    <section className="py-20 bg-surface-base border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {guarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-6 bg-surface-muted rounded-sm border border-border-subtle"
              >
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-brand-amber flex-shrink-0 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-brand-charcoal">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-brand-mineral leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
