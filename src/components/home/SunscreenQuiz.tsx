'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, RefreshCw, ShoppingBag } from 'lucide-react';
import { VELYRA_QUIZ, getQuizRecommendation, VelyraSunscreen } from '@/lib/sunscreenData';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { ProductDetailModal } from './ProductDetailModal';

export function SunscreenQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [recommendation, setRecommendation] = useState<VelyraSunscreen | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<VelyraSunscreen | null>(null);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const question = VELYRA_QUIZ[currentStep];

  const handleSelectOption = (tag: string) => {
    const updatedAnswers = { ...answers, [question.id]: tag };
    setAnswers(updatedAnswers);

    if (currentStep < VELYRA_QUIZ.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Completed quiz! Compute recommendation
      const rec = getQuizRecommendation(updatedAnswers);
      setRecommendation(rec);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendation(null);
    setAdded(false);
  };

  const handleAddToCart = async () => {
    if (!recommendation) return;
    try {
      const cartCompatibleProduct: any = {
        id: recommendation.id,
        name: `${recommendation.name} ${recommendation.spf}`,
        slug: recommendation.id.replace('prod_', ''),
        price: recommendation.price,
        mrp: recommendation.mrp,
        inStock: true,
        stockQuantity: 100,
        sku: recommendation.code,
        volume: recommendation.volume,
        images: [recommendation.image],
        category: 'Sunscreens',
        benefits: recommendation.benefits,
        keyIngredients: recommendation.keyIngredients,
      };
      await addItem(cartCompatibleProduct, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add recommended product:', err);
    }
  };

  return (
    <section id="quiz" className="py-24 sm:py-32 bg-surface-muted/50 border-b border-border-subtle relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-base border border-border-subtle rounded-full text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
            <span>Formulation Diagnostic</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal tracking-tight">
            Find Your Velyra
          </h2>
          <p className="text-base text-brand-mineral leading-relaxed max-w-xl mx-auto">
            Answer 5 brief questions about your skin, commute, and preferred finish to discover your ideal daily photoprotection match.
          </p>
        </div>

        {/* Quiz Window */}
        <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-6 sm:p-10 shadow-lg min-h-[420px] flex flex-col justify-between relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!recommendation ? (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 my-auto"
              >
                {/* Progress Bar & Counter */}
                <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest font-mono text-brand-amber font-bold">
                      Question 0{currentStep + 1}
                    </span>
                    <span className="text-xs text-brand-mineral font-mono">/ 05</span>
                  </div>
                  
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="text-xs text-brand-mineral hover:text-brand-charcoal flex items-center gap-1 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                  )}
                </div>

                {/* Question Title */}
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium">
                    {question.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-mineral">
                    {question.subtitle}
                  </p>
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {question.options.map((opt) => {
                    const isSelected = answers[question.id] === opt.tag;
                    return (
                      <button
                        key={opt.tag}
                        type="button"
                        onClick={() => handleSelectOption(opt.tag)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 group flex flex-col justify-between ${
                          isSelected
                            ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-md scale-[1.02]'
                            : 'bg-surface-base hover:bg-surface-muted/80 border-border-subtle'
                        }`}
                      >
                        <div className="font-medium text-sm sm:text-base group-hover:text-brand-amber transition-colors">
                          {opt.label}
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-stone-300' : 'text-brand-mineral'}`}>
                          {opt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* Quiz Result Display */
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your Recommended Formulation Match</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="text-xs text-brand-mineral hover:text-brand-charcoal flex items-center gap-1 font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Diagnostic</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-center pt-2">
                  {/* Left: Product Image */}
                  <div className="sm:col-span-5 relative aspect-[4/5] rounded-xl overflow-hidden bg-surface-muted border border-border-subtle shadow-md">
                    <Image
                      src={recommendation.image}
                      alt={recommendation.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 40vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-surface-base/90 text-[10px] uppercase font-bold tracking-widest text-brand-charcoal rounded-xs border border-border-subtle">
                      {recommendation.code}
                    </div>
                  </div>

                  {/* Right: Recommendation Rationale & CTAs */}
                  <div className="sm:col-span-7 space-y-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-brand-amber font-semibold">
                        {recommendation.spf} • {recommendation.pa} • {recommendation.finish}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium mt-1">
                        {recommendation.name}
                      </h3>
                      <p className="text-xs text-brand-mineral mt-1 leading-relaxed">
                        {recommendation.tagline}
                      </p>
                    </div>

                    <div className="bg-surface-muted/60 p-3.5 rounded-lg border border-border-subtle space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-brand-mineral font-bold block">
                        Why this formula matches your skin:
                      </span>
                      <p className="text-xs text-brand-charcoal leading-relaxed font-serif">
                        &ldquo;Calibrated for your specific finish preference and climate exposure. Delivers weightless photoprotection with zero white cast and skin-calming actives.&rdquo;
                      </p>
                    </div>

                    {/* Price and CTAs */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className={`flex-1 py-3.5 px-4 text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                          added
                            ? 'bg-emerald-700 text-white'
                            : 'bg-brand-charcoal text-white hover:bg-brand-mineral'
                        }`}
                      >
                        {added ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added to Bag</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Bag • {formatPrice(recommendation.price)}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProductForModal(recommendation)}
                        className="py-3.5 px-5 text-xs uppercase tracking-widest font-semibold border border-border-strong text-brand-charcoal hover:bg-surface-muted transition-colors rounded-xs text-center"
                      >
                        Full Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Product Detail Modal from Quiz Result */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}
    </section>
  );
}
