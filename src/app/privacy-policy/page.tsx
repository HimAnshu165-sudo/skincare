import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | VELYRA Skincare',
  description: 'VELYRA Skincare Privacy & Data Protection Policy.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-brand-mineral leading-relaxed">
        <div className="space-y-2 border-b border-border-subtle pb-6">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Legal & Compliance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            Privacy Policy
          </h1>
          <p className="text-xs text-brand-mineral">Last updated: September 2026</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">1. Information We Collect</h2>
          <p>
            When you visit or place an order on VELYRA (https://velyra.in), we collect essential information required to fulfill your purchase, including your name, delivery address, phone number, and email address. We do not store sensitive credit/debit card numbers or UPI PINs on our servers; all payment transactions are handled directly through RBI-compliant, 256-bit encrypted payment gateways (Razorpay).
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">2. How We Use Your Data</h2>
          <p>
            Your information is used strictly to process orders, deliver parcels via our verified logistics partners, communicate real-time shipment updates via SMS/WhatsApp, and respond to skincare concierge inquiries.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">3. Third-Party Disclosures</h2>
          <p>
            We do not sell, rent, or trade your personal information. Relevant customer contact details are shared strictly with certified delivery couriers (e.g. Delhivery, Bluedart) solely for the purpose of doorstep order delivery.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">4. Contact & Inquiries</h2>
          <p>
            For any questions regarding your personal information or data deletion requests, please contact our data grievance officer at <strong>privacy@velyra.in</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
