'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Droplets, SunMedium, Feather, CheckCircle2 } from 'lucide-react';

export function FormulationStory() {
  const [activePillar, setActivePillar] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const pillars = [
    {
      id: 'protection',
      icon: Shield,
      number: '01',
      title: 'PROTECTION',
      subtitle: 'Photostable European Matrix',
      highlight: 'SPF 50+ • PA++++',
      summary: 'Broad-spectrum defense against UVA, UVB, infrared, and screen blue light using non-degrading modern organic filters.',
      metrics: [
        { label: 'UVA Protection Factor', value: 'PA++++ (PPD > 16)' },
        { label: 'Photostability Rating', value: '99.4% post 4-hour UV' },
        { label: 'Eye Irritation Test', value: 'Zero Ocular Stinging' },
      ],
      quote: 'Engineered not to break down under harsh tropical solar irradiation.',
    },
    {
      id: 'texture',
      icon: Droplets,
      number: '02',
      title: 'TEXTURE',
      subtitle: 'Sensorial Fluid Break',
      highlight: 'Water-Burst Delivery',
      summary: 'Suspended in micro-emulsions that break instantaneously upon contact with skin temperature, delivering immediate weightless comfort.',
      metrics: [
        { label: 'Absorption Speed', value: 'Under 10 Seconds' },
        { label: 'Weight on Skin', value: 'Featherlight & Breathable' },
        { label: 'Pore Occlusion', value: 'Zero Comedogenic Waxes' },
      ],
      quote: 'Designed to feel like an essence, not a suffocating barrier.',
    },
    {
      id: 'daily-wear',
      icon: SunMedium,
      number: '03',
      title: 'DAILY WEAR',
      subtitle: 'Climate-Calibrated Resistance',
      highlight: 'Humid & Pollution Proof',
      summary: 'Calibrated for 35°C+ summer heat and 90% tropical humidity. Holds firm without sliding into eyes or melting off during commutes.',
      metrics: [
        { label: 'Humidity Tolerance', value: 'Up to 95% RH' },
        { label: 'Sweat Migration', value: 'Zero Midday Runoff' },
        { label: 'Pollution Defense', value: 'Anti-Adhesion Particulate Shield' },
      ],
      quote: 'Tested during active urban transits across Indian metropolitan centers.',
    },
    {
      id: 'skin-feel',
      icon: Feather,
      number: '04',
      title: 'SKIN FEEL',
      subtitle: 'True Zero White Cast',
      highlight: 'Melanin-Adaptive',
      summary: 'Micro-dispersed active filters guaranteed to leave zero ghost-like white, purple, or grey cast on Fitzpatrick skin phototypes III through VI.',
      metrics: [
        { label: 'Cast on Deep Skin', value: '100% Invisible' },
        { label: 'Under Makeup', value: 'Smooth Primer Finish' },
        { label: 'Finish Profile', value: 'Velvet Dew / Soft Touch' },
      ],
      quote: 'Protection should enhance bare skin, never mask it.',
    },
  ];

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActivePillar((prev) => (prev + 1) % pillars.length);
  }, [pillars.length]);

  const goToSlide = (idx: number) => {
    setDirection(idx > activePillar ? 1 : -1);
    setActivePillar(idx);
  };

  // Automatic slider transition every 3 seconds (pauses strictly when hovering over the card)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const current = pillars[activePillar];
  const IconComponent = current.icon;

  return (
    <section
      className="py-24 sm:py-32 bg-surface-base border-b border-border-subtle relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="The Velyra Formula Pillars"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted border border-border-subtle rounded-full text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal">
            <span>The Science of Daily Photoprotection</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal tracking-tight">
            The Velyra Formula
          </h2>
          <p className="text-base sm:text-lg text-brand-mineral font-normal leading-relaxed">
            Four pillars of uncompromising formulation science. Every decision benchmarked against Indian climate realities.
          </p>
        </div>

        {/* 4 Pillar Tabs (Clean, no black lines) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isActive = activePillar === idx;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => goToSlide(idx)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className={`p-5 rounded-xl border text-left transition-all duration-300 relative ${
                  isActive
                    ? 'bg-surface-elevated border-brand-charcoal shadow-lg'
                    : 'bg-surface-muted/60 border-border-subtle hover:bg-surface-muted opacity-80 hover:opacity-100'
                }`}
                aria-label={`Pillar ${pillar.number}: ${pillar.title}`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-bold ${isActive ? 'text-brand-amber' : 'text-brand-mineral'}`}>
                    {pillar.number}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-charcoal' : 'text-brand-mineral'}`} />
                </div>
                <div className="font-serif text-lg font-medium text-brand-charcoal">
                  {pillar.title}
                </div>
                <div className="text-[11px] text-brand-mineral mt-0.5">
                  {pillar.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Editorial Display Card with Smooth Slider Motion (Pauses strictly on hover over this card) */}
        <div
          className="bg-surface-muted rounded-2xl border border-border-subtle p-5 sm:p-10 lg:p-16 overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center"
            >
              {/* Left Column: Visual Pillar Breakdown */}
              <div className="lg:col-span-6 space-y-5 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-brand-charcoal shadow-xs flex-shrink-0">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-brand-amber" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-amber font-semibold">
                      Pillar {current.number}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-normal">
                      {current.title} — {current.highlight}
                    </h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-brand-mineral leading-relaxed">
                  {current.summary}
                </p>

                <blockquote className="border-l-2 border-brand-amber pl-4 py-1 text-xs sm:text-sm font-serif italic text-brand-charcoal">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>
              </div>

              {/* Right Column: Quantitative Clinical Standards */}
              <div className="lg:col-span-6 space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-brand-mineral font-bold block mb-2">
                  Validated Specifications
                </span>
                <div className="space-y-2.5 sm:space-y-3">
                  {current.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-elevated p-3.5 sm:p-4 rounded-lg border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-brand-olive shrink-0" />
                        <span className="text-xs font-medium text-brand-mineral">{metric.label}</span>
                      </div>
                      <span className="font-serif text-sm font-semibold text-brand-charcoal pl-6 sm:pl-0">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
