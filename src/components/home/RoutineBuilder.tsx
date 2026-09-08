'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Clock, CheckCircle2 } from 'lucide-react';
import { VELYRA_ROUTINE, RoutineStep } from '@/lib/sunscreenData';

export function RoutineBuilder() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const total = VELYRA_ROUTINE.length;
  const current: RoutineStep = VELYRA_ROUTINE[activeStepIndex] || VELYRA_ROUTINE[0];

  const goToStep = useCallback((idx: number) => {
    setActiveStepIndex(idx);
  }, []);

  const nextStep = useCallback(() => {
    setActiveStepIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevStep = useCallback(() => {
    setActiveStepIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play timer: advances smoothly every 3 seconds, pauses strictly when hovering directly over the card
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % total);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, activeStepIndex, total]);

  // Touch drag swipe support
  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 40;
    if (info.offset.x < -threshold || info.velocity.x < -400) {
      nextStep();
    } else if (info.offset.x > threshold || info.velocity.x > 400) {
      prevStep();
    }
  };

  return (
    <section
      className="py-24 sm:py-32 bg-surface-base border-b border-border-subtle relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Daily Sunscreen Routine Builder Slider"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted border border-border-subtle rounded-full text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal">
            <Sun className="w-3.5 h-3.5 text-brand-amber" />
            <span>The Daily Protocol</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal tracking-tight">
            Build Your Sunscreen Routine
          </h2>
          <p className="text-base sm:text-lg text-brand-mineral font-normal leading-relaxed">
            The minimalist 5-step morning sequence designed to prime and photoprotect without heavy product layering.
          </p>
        </div>

        {/* 5-Step Horizontal Flow Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {VELYRA_ROUTINE.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const isSPF = step.step === '04';

            return (
              <button
                key={step.step}
                type="button"
                onClick={() => goToStep(idx)}
                className={`p-4 sm:p-5 rounded-xl border text-left transition-all duration-300 relative cursor-pointer group ${
                  isActive
                    ? 'bg-surface-elevated border-brand-charcoal shadow-lg -translate-y-1'
                    : 'bg-surface-muted/50 border-border-subtle hover:bg-surface-muted'
                }`}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Step ${step.step}: ${step.title} - ${step.subtitle}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold ${isSPF ? 'text-brand-amber' : 'text-brand-mineral'}`}>
                    {step.step}
                  </span>
                  {isSPF && (
                    <span className="w-2 h-2 rounded-full bg-brand-amber animate-pulse" title="Core Non-Negotiable Step" />
                  )}
                </div>
                <div className="font-serif text-base sm:text-lg font-medium text-brand-charcoal leading-snug">
                  {step.title}
                </div>
                <div className="text-[11px] text-brand-mineral mt-0.5 truncate">
                  {step.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Coordinated Active Step Slider Card: Left Image + Right Details */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-surface-muted rounded-2xl border border-border-subtle overflow-hidden shadow-sm max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            
            {/* Left Column: Dedicated Step Visual (5 cols) */}
            <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[480px] bg-surface-base overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.step}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={current.image}
                    alt={`${current.title} — ${current.subtitle}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center"
                    priority={activeStepIndex === 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

                  {/* Step Pill Badge */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-[11px] font-mono font-medium text-brand-charcoal shadow-sm">
                      STEP {current.step} OF 0{total}
                    </span>
                  </div>

                  {/* Overlay Title at bottom of photo */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 text-white z-10">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-semibold block">
                      {current.time}
                    </span>
                    <div className="font-serif text-xl sm:text-2xl font-medium drop-shadow-sm">
                      {current.title}
                    </div>
                    <div className="text-xs text-white/80">
                      {current.subtitle}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Step Details & Advisory (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-brand-charcoal text-white text-[11px] font-mono font-bold rounded-xs">
                        STEP {current.step}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium">
                        {current.title} — {current.subtitle}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-brand-mineral font-mono">
                      <Clock className="w-3.5 h-3.5 text-brand-amber" />
                      <span>{current.time}</span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-brand-mineral leading-relaxed">
                    {current.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-brand-amber font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-brand-amber" />
                        Execution Gesture
                      </span>
                      <p className="text-xs text-brand-charcoal font-medium leading-relaxed">
                        {current.keyAction}
                      </p>
                    </div>

                    <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-brand-olive font-bold flex items-center gap-1">
                        <Sun className="w-3 h-3 text-brand-olive" />
                        Dermatologist Advisory
                      </span>
                      <p className="text-xs text-brand-charcoal font-medium leading-relaxed">
                        {current.dermatologistTip}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
