'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Tag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function OrderSummary() {
  const {
    items,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    setLoading(true);
    setMsg(null);
    const res = await applyCoupon(couponInput);
    setLoading(false);
    setMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  return (
    <div className="bg-surface-elevated p-6 sm:p-8 rounded-sm border border-border-subtle shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <h3 className="font-serif text-xl text-brand-charcoal font-medium">
          Order Summary
        </h3>
        <span className="text-xs text-brand-mineral font-medium">
          {items.reduce((acc, i) => acc + i.quantity, 0)} Items
        </span>
      </div>

      {/* Item List */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3.5 items-center">
            <div className="relative w-14 h-16 bg-surface-muted rounded-xs overflow-hidden flex-shrink-0 border border-border-subtle">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-1"
              />
              <span className="absolute -top-1 -right-1 bg-brand-charcoal text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-xs font-medium text-brand-charcoal truncate">
                {item.name}
              </h4>
              <div className="text-[11px] text-brand-mineral">{item.volume}</div>
            </div>
            <div className="text-xs font-semibold text-brand-charcoal">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Field */}
      <div className="pt-4 border-t border-border-subtle">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-brand-sand/30 border border-brand-sand p-2.5 rounded-xs text-xs">
            <div className="flex items-center gap-1.5 text-brand-charcoal font-medium">
              <Tag className="w-3.5 h-3.5 text-brand-amber" />
              <span>Coupon <strong>{appliedCoupon.code}</strong> Applied</span>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-xs text-red-600 hover:underline font-semibold"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="flex gap-2">
            <input
              type="text"
              placeholder="Promo / Privilege Code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="flex-1 bg-surface-muted border border-border-subtle px-3 py-2 text-xs uppercase text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-xs"
            />
            <button
              type="submit"
              disabled={loading || !couponInput}
              className="bg-brand-charcoal text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-xs hover:bg-brand-mineral disabled:opacity-50 transition-colors"
            >
              {loading ? '...' : 'Apply'}
            </button>
          </form>
        )}
        {msg && (
          <p className={`text-[11px] mt-1.5 ${msg.isError ? 'text-red-600' : 'text-emerald-700 font-medium'}`}>
            {msg.text}
          </p>
        )}
      </div>

      {/* Totals Breakdown */}
      <div className="space-y-2 text-xs text-brand-mineral pt-4 border-t border-border-subtle">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-brand-charcoal font-semibold">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Privilege Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Express Shipping</span>
          <span className="text-brand-charcoal font-semibold">
            {shippingFee === 0 ? (
              <span className="text-emerald-700 uppercase font-semibold">Free</span>
            ) : (
              formatPrice(shippingFee)
            )}
          </span>
        </div>
        <div className="flex justify-between text-base font-semibold text-brand-charcoal pt-3 border-t border-border-subtle">
          <span>Total Amount</span>
          <span className="font-serif text-xl">{formatPrice(total)}</span>
        </div>
        <p className="text-[10px] text-brand-mineral text-right -mt-1">
          Includes GST & applicable Indian taxes
        </p>
      </div>

      {/* Shipping Guarantee Pill */}
      <div className="bg-surface-muted p-3 rounded-xs border border-border-subtle flex items-center gap-2.5 text-xs text-brand-charcoal">
        <Truck className="w-4 h-4 text-brand-amber flex-shrink-0" />
        <span className="text-[11px]">
          Dispatched within 24h via Delhivery/Bluedart Express
        </span>
      </div>
    </div>
  );
}
