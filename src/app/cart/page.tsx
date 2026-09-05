'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    orderNotes,
    setOrderNotes,
    freeShippingThreshold,
    progressToFreeShipping,
  } = useCart();

  const [couponCode, setCouponCode] = React.useState('');
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [couponMsg, setCouponMsg] = React.useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponCode);
    setCouponLoading(false);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponCode('');
  };

  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="bg-surface-base min-h-[70vh] flex items-center justify-center py-20">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-surface-muted mx-auto flex items-center justify-center font-serif text-3xl text-brand-mineral">
            0
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-brand-charcoal font-normal">
              Your Bag is Currently Empty
            </h1>
            <p className="text-sm text-brand-mineral leading-relaxed">
              Explore our dermatologist-formulated photoprotection and barrier restoration products.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-block bg-brand-charcoal text-white px-8 py-4 text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-brand-mineral transition-colors shadow-md"
          >
            Explore All Formulations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-base min-h-screen py-12 sm:py-16 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div className="border-b border-border-subtle pb-6 flex items-baseline justify-between">
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            Your Shopping Bag
          </h1>
          <span className="text-xs text-brand-mineral font-medium">
            {items.reduce((acc, i) => acc + i.quantity, 0)} Items Selected
          </span>
        </div>

        {/* Free Shipping Progress Banner */}
        <div className="bg-surface-muted p-4 rounded-sm border border-border-subtle text-xs">
          {amountToFreeShipping > 0 ? (
            <div className="space-y-2 max-w-xl">
              <p className="text-brand-charcoal">
                Add <strong className="font-semibold text-brand-charcoal">{formatPrice(amountToFreeShipping)}</strong> more to qualify for <span className="text-brand-amber font-semibold uppercase">Free Express Delivery</span>
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
              <span>Complimentary Express Shipping unlocked across India!</span>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-elevated rounded-sm border border-border-subtle shadow-sm divide-y divide-border-subtle">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="relative w-24 h-28 bg-surface-muted rounded-xs overflow-hidden flex-shrink-0 border border-border-subtle">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif text-lg text-brand-charcoal hover:underline"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-brand-mineral">{item.volume} • SKU: {item.sku}</div>
                    <div className="text-xs font-semibold text-brand-charcoal pt-1">
                      {formatPrice(item.price)} each
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center border border-border-strong rounded-xs bg-surface-elevated">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-brand-mineral hover:text-brand-charcoal"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold px-3 text-brand-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-brand-mineral hover:text-brand-charcoal"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div className="text-right sm:min-w-[100px] flex sm:flex-col justify-between items-end w-full sm:w-auto">
                    <span className="font-serif text-base font-semibold text-brand-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-brand-mineral hover:text-red-700 flex items-center gap-1 mt-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions Note */}
            <div className="bg-surface-elevated p-6 rounded-sm border border-border-subtle shadow-sm space-y-2">
              <label className="text-xs uppercase tracking-wider text-brand-charcoal font-semibold block">
                Special Delivery Instructions / Packaging Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Leave package with building security guard or call prior to delivery."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-surface-muted border border-border-subtle p-3 text-xs text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-xs"
              />
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-elevated p-6 sm:p-8 rounded-sm border border-border-subtle shadow-sm space-y-6">
              <h3 className="font-serif text-xl text-brand-charcoal font-medium border-b border-border-subtle pb-4">
                Order Summary
              </h3>

              {/* Coupon Form */}
              <div>
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
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-surface-muted border border-border-subtle px-3 py-2 text-xs uppercase text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-xs"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode}
                      className="bg-brand-charcoal text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-xs hover:bg-brand-mineral disabled:opacity-50"
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

              {/* Price Details */}
              <div className="space-y-2 text-xs text-brand-mineral pt-4 border-t border-border-subtle">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-brand-charcoal font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
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
                <div className="flex justify-between text-base font-semibold text-brand-charcoal pt-4 border-t border-border-subtle">
                  <span>Estimated Total</span>
                  <span className="font-serif text-2xl">{formatPrice(total)}</span>
                </div>
                <p className="text-[10px] text-brand-mineral text-right -mt-1">
                  Includes all Indian Taxes & GST
                </p>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-brand-charcoal text-white py-4 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-brand-mineral transition-colors rounded-sm shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
