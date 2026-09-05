'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Lock, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface-dark text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-14 border-b border-white/10 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Truck className="w-5 h-5 text-brand-amber" />
            <span className="text-xs uppercase tracking-wider font-semibold text-white">Express Delivery</span>
            <span className="text-xs text-stone-400">Shipped within 24 hours across India</span>
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-amber" />
            <span className="text-xs uppercase tracking-wider font-semibold text-white">Clean Formulations</span>
            <span className="text-xs text-stone-400">Zero white cast, fragrance-free & gentle</span>
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2">
            <RefreshCw className="w-5 h-5 text-brand-amber" />
            <span className="text-xs uppercase tracking-wider font-semibold text-white">Cash on Delivery</span>
            <span className="text-xs text-stone-400">Available on all eligible Indian pincodes</span>
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Lock className="w-5 h-5 text-brand-amber" />
            <span className="text-xs uppercase tracking-wider font-semibold text-white">100% Secure Checkout</span>
            <span className="text-xs text-stone-400">Encrypted UPI, Cards & Netbanking</span>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-14 border-b border-white/10">
          {/* Brand & Editorial Vision */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-serif text-3xl tracking-[0.2em] font-normal uppercase text-white block">
              VELYRA
            </span>
            <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
              Formulated for the unique challenges of Indian climates. Everyday photoprotection and barrier restoration elevated to a mindful, weightless daily ritual.
            </p>
            <div className="pt-2 text-[11px] text-stone-400">
              Manufactured with love in India • Certified Dermatologically Safe
            </div>
          </div>

          {/* Formulations Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-brand-amber font-semibold">Formulations</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link href="/products/silk-air-fluid-sunscreen-spf50" className="hover:text-white transition-colors">
                  Silk-Air Sunscreen SPF 50+
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <span className="text-stone-500 cursor-not-allowed">
                  Barrier Cream <em className="text-[10px] text-brand-amber/80 font-serif">(Coming Soon)</em>
                </span>
              </li>
              <li>
                <span className="text-stone-500 cursor-not-allowed">
                  Amino Cleanser <em className="text-[10px] text-brand-amber/80 font-serif">(Coming Soon)</em>
                </span>
              </li>
            </ul>
          </div>

          {/* Client Care & Company */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-brand-amber font-semibold">Concierge</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / The Editorial Digest */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-brand-amber font-semibold">The VELYRA Journal</h4>
            <p className="text-xs text-stone-300">
              Subscribe for thoughtful skincare insights, private launch access, and 10% off your first ritual.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center">
              <input
                type="email"
                placeholder="Enter your email address..."
                className="bg-white/5 border border-white/20 px-3.5 py-2.5 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-brand-amber flex-1 rounded-l-sm"
              />
              <button
                type="submit"
                className="bg-brand-amber text-brand-charcoal px-4 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-r-sm hover:bg-white transition-colors flex items-center gap-1"
                aria-label="Subscribe"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            &copy; {new Date().getFullYear()} VELYRA Skincare Essentials LLP. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">
              Shipping Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund & Return Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
