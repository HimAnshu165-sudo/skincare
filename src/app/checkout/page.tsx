'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-surface-base min-h-[70vh] flex items-center justify-center py-20">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-surface-muted mx-auto flex items-center justify-center font-serif text-2xl text-brand-mineral">
            0
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
              Your Bag is Empty
            </h1>
            <p className="text-sm text-brand-mineral">
              Please add your desired formulations before proceeding to checkout.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-block bg-brand-charcoal text-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-brand-mineral transition-colors"
          >
            Explore Formulations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-base min-h-screen py-10 sm:py-16 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-brand-mineral hover:text-brand-charcoal mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Bag</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
              Express Delivery & Checkout
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-olive bg-surface-muted px-4 py-2 rounded-full border border-border-subtle">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium">100% Verified Indian D2C Gateway</span>
          </div>
        </div>

        {/* 2-Column Responsive Checkout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Form */}
          <div className="lg:col-span-7">
            <CheckoutForm />
          </div>

          {/* Right Sticky Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <OrderSummary />
          </div>
        </div>

      </div>
    </div>
  );
}
