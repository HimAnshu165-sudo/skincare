import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | VELYRA Skincare',
  description: 'VELYRA Skincare Terms of Service and Purchase Agreements.',
};

export default function TermsPage() {
  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-brand-mineral leading-relaxed">
        <div className="space-y-2 border-b border-border-subtle pb-6">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Legal & Compliance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            Terms & Conditions
          </h1>
          <p className="text-xs text-brand-mineral">Effective Date: September 2026</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">1. Overview</h2>
          <p>
            This website is operated by VELYRA Skincare Essentials LLP. Throughout the site, the terms &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to VELYRA. By visiting our site and/or purchasing from us, you engage in our &ldquo;Service&rdquo; and agree to be bound by the following terms and conditions.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">2. Products & Pricing</h2>
          <p>
            Prices for our skincare products are quoted in Indian Rupees (INR) and are subject to change without prior notice. All prices are inclusive of applicable GST. We reserve the right to limit the sales quantities of any product to any person or geographic region.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">3. Accuracy of Billing & Account Information</h2>
          <p>
            You agree to provide current, complete, and accurate purchase and contact details for all purchases made at our store. You agree to promptly update your mobile number and shipping address so that we can complete your transactions and contact you as needed.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">4. Governing Law</h2>
          <p>
            These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of India, subject to the jurisdiction of courts in Bangalore, Karnataka.
          </p>
        </div>
      </div>
    </div>
  );
}
