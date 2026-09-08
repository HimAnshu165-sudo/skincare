'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { VelyraSunscreen } from '@/lib/sunscreenData';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { ProductVideoCard } from '@/components/video/ProductVideoCard';

interface ProductDetailModalProps {
  product: VelyraSunscreen;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleAddToCart = async () => {
    try {
      const cartCompatibleProduct: any = {
        id: product.id,
        name: `${product.name} ${product.spf}`,
        slug: product.id.replace('prod_', ''),
        price: product.price,
        mrp: product.mrp,
        inStock: true,
        stockQuantity: 100,
        sku: product.code,
        volume: product.volume,
        images: [product.image],
        category: 'Sunscreens',
        benefits: product.benefits,
        keyIngredients: product.keyIngredients,
      };
      await addItem(cartCompatibleProduct, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed adding product to bag:', err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 lg:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-brand-charcoal/70 backdrop-blur-md"
        />

        {/* Cinematic Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-6xl bg-surface-base border border-border-subtle rounded-2xl shadow-2xl overflow-hidden z-10 my-auto"
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          {/* Top Bar with Close */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border-subtle bg-surface-muted/40">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-brand-charcoal text-white text-[10px] uppercase font-bold tracking-widest rounded-xs">
                {product.code}
              </span>
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-brand-mineral font-semibold truncate max-w-[200px] sm:max-w-none">
                Clinical Product Specification
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface-muted text-brand-charcoal transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3-Panel Cinematic Split Layout (Section 13 Requirement) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] lg:max-h-[80vh] overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
            
            {/* PANEL 1 (LEFT): Before/After Model Experience */}
            <div className="lg:col-span-4 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-5 sm:space-y-6 bg-surface-muted/20">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-brand-amber font-bold">
                  Visual Dermal Result
                </span>
                <h4 className="font-serif text-lg sm:text-xl text-brand-charcoal font-medium">
                  Zero White Cast Finish
                </h4>
                <p className="text-xs text-brand-mineral leading-relaxed">
                  Interactive dermal comparison. Slide to inspect how {product.name} blends invisibly into bare skin.
                </p>
              </div>

              <div className="my-auto">
                <BeforeAfterSlider aspectClass="aspect-[4/3] rounded-lg shadow-sm" />
              </div>

              <div className="pt-2 text-[11px] text-brand-mineral flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-olive shrink-0" />
                <span>Calibrated for Fitzpatrick phototypes III through VI</span>
              </div>
            </div>

            {/* PANEL 2 (CENTER): Product Details, Specs, Price, CTAs */}
            <div className="lg:col-span-4 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 flex flex-col justify-between bg-surface-base">
              <div className="space-y-4">
                {/* Visual */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-muted border border-border-subtle">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-surface-base/90 text-brand-charcoal text-[10px] uppercase font-bold tracking-wider rounded-xs border border-border-subtle">
                    {product.spf} • {product.pa}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-brand-amber font-semibold">
                    {product.finish} • {product.volume}
                  </div>
                  <h3 className="font-serif text-2xl text-brand-charcoal font-medium mt-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-brand-mineral mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Key Benefits Bullet List */}
                <div className="space-y-1.5 pt-1">
                  {product.benefits.slice(0, 3).map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-brand-charcoal">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-amber mt-1.5 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Add to Bag */}
              <div className="pt-4 border-t border-border-subtle space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-semibold text-brand-charcoal">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-brand-mineral line-through">
                      MRP {formatPrice(product.mrp)}
                    </span>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs font-semibold">
                    In Stock • Ships Free
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full py-4 text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                    added
                      ? 'bg-emerald-700 text-white'
                      : 'bg-brand-charcoal text-white hover:bg-brand-mineral'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Shopping Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag • {formatPrice(product.price)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PANEL 3 (RIGHT): Model Application Video / Statement */}
            <div className="lg:col-span-4 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-5 sm:space-y-6 bg-surface-muted/20">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-brand-amber font-bold">
                  Sensory Application
                </span>
                <h4 className="font-serif text-lg sm:text-xl text-brand-charcoal font-medium">
                  Effortless Dermal Uptake
                </h4>
                <p className="text-xs text-brand-mineral leading-relaxed">
                  Watch the fluid break absorb seamlessly without friction or greasy film.
                </p>
              </div>

              {/* Real Video Experience with Cinematic Modal */}
              <ProductVideoCard
                product={product}
                videoSrc="/Hero.mp4"
                posterSrc="/models/model-apply.jpg"
                title={`${product.name} Ritual`}
                statement="Light on the skin. Strong on everyday protection."
                aspectClass="aspect-[4/3] rounded-lg shadow-sm"
              />

              {/* Editorial Statement */}
              <div className="space-y-3 pt-2">
                <blockquote className="font-serif text-lg text-brand-charcoal italic leading-snug">
                  &ldquo;Light on the skin. Strong on everyday protection.&rdquo;
                </blockquote>
                <p className="text-[11px] text-brand-mineral leading-relaxed">
                  Texture Note: {product.textureNote}
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
