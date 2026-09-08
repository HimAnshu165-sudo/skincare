'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Check, ShoppingBag } from 'lucide-react';
import { VelyraSunscreen } from '@/lib/sunscreenData';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface SunscreenCardProps {
  product: VelyraSunscreen;
  onExplore: (product: VelyraSunscreen) => void;
  aspectClass?: string;
  isFeatured?: boolean;
}

export function SunscreenCard({
  product,
  onExplore,
  aspectClass = 'aspect-[3/4]',
  isFeatured = false,
}: SunscreenCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Create a compatible Product object for the cart
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
      console.error('Failed to add to cart:', err);
    }
  };

  return (
    <div
      className={`group relative flex flex-col bg-surface-base rounded-xl overflow-hidden border border-border-subtle transition-all duration-500 hover:border-brand-charcoal/40 hover:shadow-xl ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="article"
      aria-label={`${product.name} ${product.spf}`}
    >
      {/* 1. Product Image & Masked Reveal Container */}
      <div 
        onClick={() => onExplore(product)}
        className={`relative w-full overflow-hidden bg-surface-muted cursor-pointer ${aspectClass}`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle Luxury Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/50 via-transparent to-black/10 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 bg-surface-base/90 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest text-brand-charcoal rounded-xs shadow-xs border border-border-subtle">
            {product.code}
          </span>
          <span className="px-2.5 py-1 bg-brand-charcoal/90 text-white backdrop-blur-md text-[10px] uppercase font-semibold tracking-wider rounded-xs shadow-xs">
            {product.spf} • {product.pa}
          </span>
        </div>

        {/* 2. Sophisticated Masked Editorial Hover Reveal (Section 7 Requirement) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-surface-base/92 p-6 flex flex-col justify-between z-20"
            >
              {/* Top spec badges */}
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="space-y-1"
              >
                <div className="text-[10px] uppercase tracking-widest text-brand-amber font-bold">
                  Clinical Profile
                </div>
                <div className="font-serif text-lg text-brand-charcoal font-medium">
                  {product.finish}
                </div>
              </motion.div>

              {/* 3 to 5 Feature Highlights with smooth directional motion */}
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="space-y-2 py-2"
              >
                {product.hoverFeatures.slice(0, 4).map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-border-subtle text-brand-charcoal"
                  >
                    <span className="text-[11px] uppercase tracking-wider text-brand-mineral font-medium">
                      {feat.label}
                    </span>
                    <span className="font-medium text-right text-[11px]">{feat.value}</span>
                  </div>
                ))}
                <div className="text-[11px] text-brand-mineral italic pt-1 line-clamp-2">
                  &ldquo;{product.tagline}&rdquo;
                </div>
              </motion.div>

              {/* Action Buttons inside hover panel */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className="flex items-center gap-2 pt-2"
              >
                <button
                  type="button"
                  onClick={() => onExplore(product)}
                  className="flex-1 bg-brand-charcoal text-white py-2.5 px-3 text-[11px] uppercase tracking-widest font-semibold hover:bg-brand-mineral transition-colors rounded-xs flex items-center justify-center gap-1.5"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className={`p-2.5 rounded-xs border transition-colors flex items-center justify-center ${
                    added
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-border-strong text-brand-charcoal hover:bg-surface-muted'
                  }`}
                  aria-label={`Add ${product.name} to bag`}
                  title="Quick add to bag"
                >
                  {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Bottom Information Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-surface-base">
        <div>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-brand-mineral mb-1">
            <span>{product.skinType.split('•')[0].trim()}</span>
            <span>{product.volume}</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl text-brand-charcoal font-medium leading-snug group-hover:text-brand-amber transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-brand-mineral line-clamp-2 mt-1 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-base font-semibold text-brand-charcoal">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-brand-mineral line-through">
              {formatPrice(product.mrp)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onExplore(product)}
            className="inline-flex items-center gap-1.5 py-1.5 px-2 -mr-2 text-[11px] uppercase tracking-widest font-semibold text-brand-charcoal hover:text-brand-amber transition-colors"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
