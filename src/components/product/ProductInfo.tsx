'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<{ checked: boolean; valid?: boolean; message?: string }>({
    checked: false,
  });

  const availableStock = product.stockQuantity ?? 0;
  const isOutOfStock = !product.inStock || availableStock <= 0;
  const isUpcoming = Boolean(product.isUpcoming);

  const discountPercent = calculateDiscount(product.mrp, product.price);

  const handleAddToCart = async () => {
    if (isUpcoming || isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(product, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isUpcoming || isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(product, quantity);
      router.push('/checkout');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus({
        checked: true,
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }
    setPincodeStatus({
      checked: true,
      valid: true,
      message: 'Express Delivery Available • Delivery in 2-4 business days • COD Available',
    });
  };

  const benefits = Array.isArray(product.benefits)
    ? product.benefits
    : typeof product.benefits === 'string'
    ? JSON.parse(product.benefits)
    : [];

  return (
    <div className="space-y-6">
      {/* Category & Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-brand-mineral font-semibold">
          {product.category}
        </span>
        {product.spfRating && (
          <span className="bg-brand-charcoal text-white text-[10px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-xs">
            {product.spfRating}
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-brand-amber text-brand-charcoal text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-xs">
            Hero Formulation
          </span>
        )}
        {isOutOfStock && !isUpcoming && (
          <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] tracking-wider uppercase font-bold px-2.5 py-0.5 rounded-xs">
            OUT OF STOCK
          </span>
        )}
      </div>

      {/* Product Title & Tagline */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal tracking-tight">
          {product.name}
        </h1>
        <p className="text-sm text-brand-mineral leading-relaxed">
          {product.tagline}
        </p>
      </div>

      {/* Volume & Stock Status Spec */}
      <div className="flex items-center justify-between gap-4 text-xs text-brand-charcoal py-2 border-y border-border-subtle">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-brand-mineral">Volume: </span>
            <strong className="font-semibold">{product.volume}</strong>
          </div>
          {product.finish && (
            <div>
              <span className="text-brand-mineral">Finish: </span>
              <strong className="font-semibold">{product.finish}</strong>
            </div>
          )}
        </div>

        {/* Global Stock Indicator */}
        <div>
          {isUpcoming ? (
            <span className="text-xs text-brand-mineral font-medium uppercase tracking-wider">Coming Soon</span>
          ) : isOutOfStock ? (
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">OUT OF STOCK</span>
          ) : availableStock <= 10 ? (
            <span className="text-xs font-semibold text-amber-700">
              Only {availableStock} {availableStock === 1 ? 'unit' : 'units'} available
            </span>
          ) : (
            <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{availableStock} units available</span>
            </span>
          )}
        </div>
      </div>

      {/* Price Block */}
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-3xl font-semibold text-brand-charcoal">
          {formatPrice(product.price)}
        </span>
        {product.mrp > product.price && (
          <>
            <span className="text-sm text-brand-mineral line-through">
              MRP {formatPrice(product.mrp)}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-xs">
              Save {discountPercent}%
            </span>
          </>
        )}
      </div>
      <div className="text-[11px] text-brand-mineral -mt-3">
        Inclusive of all Indian taxes • Free Express Shipping on orders over ₹999
      </div>

      {/* Benefits Highlights */}
      {benefits.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs uppercase tracking-wider text-brand-charcoal font-semibold">
            Key Dermatological Benefits
          </h4>
          <ul className="space-y-1.5">
            {benefits.map((benefit: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-brand-mineral">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-amber mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quantity & CTA Buttons */}
      {isUpcoming ? (
        <div className="p-4 bg-surface-muted rounded-sm text-center space-y-2 border border-border-subtle">
          <span className="text-xs uppercase tracking-widest text-brand-mineral font-semibold block">
            Upcoming Formulation Launch
          </span>
          <p className="text-xs text-brand-mineral">
            Sign up below to be notified first when batch inventory goes live.
          </p>
        </div>
      ) : isOutOfStock ? (
        <div className="space-y-3 pt-4 border-t border-border-subtle">
          <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-center space-y-1">
            <span className="text-xs uppercase tracking-widest text-red-800 font-bold block">
              Currently Out of Stock
            </span>
            <p className="text-xs text-red-700">
              All batch units have been allocated. New cleanroom formulation is underway.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              disabled
              className="w-full bg-surface-muted text-brand-mineral/60 py-4 text-xs uppercase tracking-widest font-semibold cursor-not-allowed rounded-sm border border-border-subtle"
            >
              Out of Stock
            </button>
            <button
              disabled
              className="w-full bg-surface-muted text-brand-mineral/60 py-4 text-xs uppercase tracking-widest font-semibold cursor-not-allowed rounded-sm border border-border-subtle"
            >
              Unavailable
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-wider text-brand-charcoal font-semibold">
              Quantity:
            </span>
            <div className="flex items-center border border-border-strong rounded-sm bg-surface-elevated">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="p-2 text-brand-mineral hover:text-brand-charcoal disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-semibold px-4 text-brand-charcoal min-w-[2.5rem] text-center font-mono">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((prev) => Math.min(availableStock, prev + 1))}
                disabled={quantity >= availableStock}
                className="p-2 text-brand-mineral hover:text-brand-charcoal disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {quantity >= availableStock && (
              <span className="text-[11px] text-amber-700 font-medium">Max available reached</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-brand-charcoal text-white py-4 text-xs uppercase tracking-widest font-semibold hover:bg-brand-mineral transition-all rounded-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isAdding ? 'Adding...' : `Add to Bag • ${formatPrice(product.price * quantity)}`}</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isAdding}
              className="w-full bg-brand-amber text-brand-charcoal py-4 text-xs uppercase tracking-widest font-bold hover:bg-amber-400 transition-all rounded-sm shadow-sm disabled:opacity-50"
            >
              {isAdding ? 'Redirecting...' : 'Buy Now with 1-Click'}
            </button>
          </div>
        </div>
      )}

      {/* Pincode Delivery Check */}
      <div className="p-4 bg-surface-muted rounded-sm space-y-2.5 border border-border-subtle">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-charcoal uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-brand-amber" />
          <span>Estimate Delivery & Cash on Delivery (COD)</span>
        </div>
        <form onSubmit={handleCheckPincode} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter 6-digit Pincode (e.g. 110001)"
            value={pincode}
            maxLength={6}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            className="flex-1 bg-surface-elevated border border-border-subtle px-3 py-2 text-xs text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal rounded-sm"
          />
          <button
            type="submit"
            className="bg-brand-charcoal text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-sm hover:bg-brand-mineral transition-colors"
          >
            Check
          </button>
        </form>
        {pincodeStatus.checked && (
          <p
            className={`text-[11px] ${
              pincodeStatus.valid ? 'text-emerald-700 font-medium' : 'text-red-600'
            }`}
          >
            {pincodeStatus.message}
          </p>
        )}
      </div>

      {/* Security and Trust Badges */}
      <div className="grid grid-cols-2 gap-3 text-xs text-brand-mineral pt-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-olive" />
          <span>Photostable UV Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-olive" />
          <span>Ships within 24h</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-amber" />
          <span>Zero White Cast</span>
        </div>
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-brand-olive" />
          <span>COD Available</span>
        </div>
      </div>
    </div>
  );
}
