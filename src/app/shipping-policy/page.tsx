import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | VELYRA Skincare',
  description: 'VELYRA Skincare Domestic Shipping & Delivery Timelines across India.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-surface-base min-h-screen py-16 sm:py-24 border-b border-border-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs sm:text-sm text-brand-mineral leading-relaxed">
        <div className="space-y-2 border-b border-border-subtle pb-6">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Domestic Delivery Guidelines
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            Shipping Policy
          </h1>
          <p className="text-xs text-brand-mineral">Dispatched with care from Bangalore, India</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">1. Processing & Dispatch Timelines</h2>
          <p>
            All confirmed orders (both Online Payment and Cash on Delivery) are dispatched from our fulfillment facility within <strong>24 business hours</strong> (excluding Sundays and national gazetted holidays).
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">2. Shipping Charges</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Orders above ₹999:</strong> Complimentary Express Delivery across India.</li>
            <li><strong>Orders below ₹999:</strong> Standard express shipping fee of ₹70.</li>
            <li><strong>Cash on Delivery (COD):</strong> Available at no additional surcharge across 98% of Indian postal codes.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">3. Estimated Transit Times</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Tier 1 Metros</strong> (Mumbai, Delhi NCR, Bangalore, Chennai, Hyderabad, Kolkata, Pune): 2 to 3 business days.</li>
            <li><strong>Tier 2 & 3 Cities:</strong> 3 to 5 business days.</li>
            <li><strong>Remote North-East & Island Territories:</strong> 5 to 7 business days.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium">4. Real-Time Order Tracking</h2>
          <p>
            Once your package is handed over to our courier partners (Delhivery, Bluedart), you will receive a tracking link via SMS and WhatsApp. You can also track your live shipment directly on our <a href="/track-order" className="text-brand-charcoal font-semibold underline">Track Order Portal</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
