'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    shippingFee,
    total,
    freeShippingThreshold,
    progressToFreeShipping,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponMsg(null);
    const result = await applyCoupon(couponCode);
    setCouponLoading(false);
    setCouponMsg({
      text: result.message,
      isError: !result.success,
    });
    if (result.success) {
      setCouponCode('');
    }
  };

  const amountRemainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-surface-base shadow-2xl flex flex-col z-10 animate-fade-in border-l border-border-subtle">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border-subtle flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg sm:text-xl tracking-wide uppercase text-brand-charcoal">
              Your Shopping Bag
            </h2>
            <span className="text-xs text-brand-mineral font-medium">
              ({items.reduce((acc, item) => acc + item.quantity, 0)})
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-brand-mineral hover:text-brand-charcoal transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-surface-muted border-b border-border-subtle text-xs">
          {amountRemainingForFreeShipping > 0 ? (
            <div className="space-y-2">
              <p className="text-brand-charcoal">
                Add <strong className="font-semibold text-brand-charcoal">{formatPrice(amountRemainingForFreeShipping)}</strong> more to unlock <span className="text-brand-amber font-semibold uppercase">Free Express Shipping</span>
              </p>
              <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-amber transition-all duration-500 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-brand-olive font-medium">
              <Sparkles className="w-4 h-4 text-brand-amber" />
              <span>You have qualified for Complimentary Express Shipping!</span>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-brand-mineral font-serif text-2xl">
                0
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-brand-charcoal">Your bag is currently empty</h3>
                <p className="text-xs text-brand-mineral max-w-xs">
                  Discover our dermatologist-formulated photoprotection and barrier essentials.
                </p>
              </div>
              <Link
                href="/products/silk-air-fluid-sunscreen-spf50"
                onClick={closeCart}
                className="inline-block mt-4 bg-brand-charcoal text-white text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-sm hover:bg-brand-mineral transition-colors"
              >
                Discover Silk-Air Sunscreen
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-6 border-b border-border-subtle/80 last:border-none"
              >
                {/* Product Thumbnail */}
                <div className="relative w-20 h-24 bg-surface-muted rounded-sm flex-shrink-0 overflow-hidden border border-border-subtle">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="font-serif text-sm font-medium text-brand-charcoal hover:underline line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-brand-mineral/60 hover:text-red-700 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-[11px] text-brand-mineral mt-0.5">{item.volume}</div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-border-subtle rounded-sm bg-surface-elevated">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-brand-mineral hover:text-brand-charcoal transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-2 text-brand-charcoal min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-brand-mineral hover:text-brand-charcoal transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="text-sm font-semibold text-brand-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.mrp > item.price && (
                        <span className="block text-[11px] text-brand-mineral line-through">
                          {formatPrice(item.mrp * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary / Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6 border-t border-border-subtle bg-surface-elevated space-y-4">
            {/* Coupon Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-brand-sand/40 border border-brand-sand p-2.5 rounded-sm text-xs">
                  <div className="flex items-center gap-1.5 text-brand-charcoal font-medium">
                    <Tag className="w-3.5 h-3.5 text-brand-amber" />
                    <span>Coupon applied: <strong>{appliedCoupon.code}</strong></span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. VELYRA10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-surface-muted border border-border-subtle px-3 py-2 text-xs uppercase text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-sm"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode}
                    className="bg-brand-charcoal text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-sm hover:bg-brand-mineral transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponMsg && (
                <p className={`text-[11px] mt-1.5 ${couponMsg.isError ? 'text-red-600' : 'text-emerald-700 font-medium'}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-brand-mineral pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-brand-charcoal font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-brand-charcoal font-medium">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 uppercase font-semibold">Free</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm text-brand-charcoal font-semibold pt-2 border-t border-border-subtle">
                <span>Total (Incl. all taxes)</span>
                <span className="font-serif text-base text-brand-charcoal">{formatPrice(total)}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-brand-charcoal text-white py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-brand-mineral transition-colors rounded-sm shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full text-center block text-xs text-brand-mineral uppercase tracking-wider hover:text-brand-charcoal pt-1 transition-colors"
              >
                View Full Cart & Notes
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="text-[11px] text-brand-mineral text-center flex items-center justify-center gap-2 pt-1 border-t border-border-subtle">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-olive" />
              <span>Cash on Delivery & Secure UPI Accepted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
