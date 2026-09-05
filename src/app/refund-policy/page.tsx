import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Return Policy | VELYRA Skincare',
  description: 'VELYRA Skincare Replacement and Refund Guidelines.',
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-brand-mineral leading-relaxed">
        <div className="space-y-2 border-b border-border-subtle pb-6">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Quality Assurance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            Refund & Replacement Policy
          </h1>
          <p className="text-xs text-brand-mineral">Consumer Protection Standards</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">1. Hygiene & Skincare Safety</h2>
          <p>
            Due to the sterile nature of cosmetic and personal photoprotection products, we cannot accept returns of products that have been opened, tested, or unsealed once delivered.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">2. Damaged or Defective Deliveries</h2>
          <p>
            If your order arrives damaged in transit, defective, or with a missing item, please notify our client concierge team within <strong>48 hours of delivery</strong> along with photographs of the outer shipping box and inner packaging.
          </p>
          <p>
            Upon quick verification, we will immediately dispatch a <strong>complimentary replacement</strong> at zero extra charge, or issue a 100% full refund back to your original payment method.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">3. Refund Processing Timelines</h2>
          <p>
            Approved refunds for online payments (UPI, Cards, Netbanking) are credited back to your original source within <strong>3 to 5 business days</strong>. For Cash on Delivery orders, refunds will be processed via direct bank NEFT or UPI transfer to your provided account.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">4. Contact Concierge</h2>
          <p>
            To initiate a replacement or inquiry, reach out on WhatsApp at <strong>+91 98765 43210</strong> or email <strong>concierge@velyra.in</strong> with your Order Reference ID.
          </p>
        </div>
      </div>
    </div>
  );
}
