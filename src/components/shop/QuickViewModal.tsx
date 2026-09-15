'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!product) return null;

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : ['/products/sunscreen-hero.webp'];

  const mainImage = images[0] || '/products/sunscreen-hero.webp';
  const discountPercent = calculateDiscount(product.mrp, product.price);

  const handleAdd = async () => {
    if (product.isUpcoming || !product.inStock) return;
    try {
      await addItem(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} Quick View`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-surface-base rounded-sm shadow-2xl overflow-hidden border border-border-subtle z-10 animate-fade-up max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-surface-base/80 hover:bg-surface-muted text-brand-mineral hover:text-brand-charcoal flex items-center justify-center border border-border-subtle transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 relative bg-surface-muted/40 aspect-square md:aspect-auto p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-border-subtle">
          <div className="relative w-full h-full min-h-[220px]">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest text-brand-mineral font-semibold">
                {product.category} {product.volume ? `• ${product.volume}` : ''}
              </span>
              {product.spfRating && (
                <span className="px-2 py-0.5 bg-brand-charcoal text-white text-[10px] uppercase font-semibold rounded-xs">
                  {product.spfRating}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-normal">
              {product.name}
            </h2>

            <p className="text-xs sm:text-sm text-brand-mineral leading-relaxed">
              {product.description || product.tagline}
            </p>

            {/* Price Row */}
            <div className="flex items-baseline gap-2.5 pt-2">
              <span className="font-serif text-2xl text-brand-charcoal font-medium">
                {formatPrice(product.price)}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-xs text-brand-mineral line-through">
                    {formatPrice(product.mrp)}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-olive uppercase tracking-wider">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Key Formulation Meta */}
            <div className="space-y-1.5 pt-2 text-xs text-brand-charcoal">
              {product.finish && (
                <div className="flex items-center gap-2">
                  <span className="text-brand-mineral uppercase tracking-wider text-[10px] w-16">Finish:</span>
                  <span className="font-medium">{product.finish}</span>
                </div>
              )}
              {product.skinType && (
                <div className="flex items-center gap-2">
                  <span className="text-brand-mineral uppercase tracking-wider text-[10px] w-16">Skin Type:</span>
                  <span className="font-medium">{product.skinType}</span>
                </div>
              )}
            </div>

            {/* Benefits Highlights */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="pt-2 border-t border-border-subtle/70 space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-mineral block">
                  Key Benefits
                </span>
                <ul className="space-y-1 text-xs text-brand-mineral">
                  {product.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-amber shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-border-subtle space-y-2.5">
            {!product.isUpcoming && product.inStock ? (
              <button
                type="button"
                onClick={handleAdd}
                className={`w-full py-3 px-4 rounded-sm text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-brand-charcoal text-white hover:bg-brand-mineral shadow-sm'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Bag • {formatPrice(product.price)}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="py-3 px-4 bg-surface-muted text-center text-xs font-medium text-brand-mineral rounded-sm">
                Coming Soon • Limited Release
              </div>
            )}

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-sm text-xs font-semibold uppercase tracking-widest text-center text-brand-charcoal hover:text-brand-amber flex items-center justify-center gap-1 transition-colors"
            >
              <span>View Full Formula Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
