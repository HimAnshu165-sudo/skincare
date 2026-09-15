'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CloudSun, Shield, Sparkles, Check } from 'lucide-react';

export function DailyShieldEducation() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const slides = [
    {
      id: 'exposure',
      stepNum: 'Step 01',
      title: 'Solar Exposure',
      subtitle: 'UVA, UVB & High Energy Visible Blue Light',
      image: '/education/01-solar-exposure.jpg',
      imageAlt: 'Solar exposure rays cutting through room onto stone pedestal',
      badge: 'SPECTRUM PHOTOBIOLOGY',
      icon: Sun,
    },
    {
      id: 'environment',
      stepNum: 'Step 02',
      title: 'UV Environment',
      subtitle: 'Indian UV Index 8–11+ and Tropical Humidity',
      image: '/education/02-uv-environment.jpg',
      imageAlt: 'Tropical ocean sunlight with palm tree shadows and sunscreen on limestone',
      badge: 'TROPICAL CLIMATE DYNAMICS',
      icon: CloudSun,
    },
    {
      id: 'protection',
      stepNum: 'Step 03',
      title: 'Daily Defense',
      subtitle: 'Broad-Spectrum Photostable Shield',
      image: '/education/03-daily-defense.jpg',
      imageAlt: 'Outdoor photostable broad-spectrum daily defense shield in direct sunlight',
      badge: 'ACTIVE CELLULAR DEFENSE',
      icon: Shield,
    },
  ];

  const total = slides.length;
  const currentSlide = slides[activeStep];

  const goToSlide = (index: number) => {
    setDirection(index >= activeStep ? 1 : -1);
    setActiveStep(index);
  };

  // Automatic slider transition every 3 seconds (pauses strictly when hovering directly over the card)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setActiveStep((prev) => (prev + 1) % total);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, activeStep, total]);

  return (
    <section
      className="py-24 sm:py-32 bg-surface-base border-b border-border-subtle relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Daily Shield Education Slider"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted border border-border-subtle rounded-full text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal">
            <Sun className="w-3.5 h-3.5 text-brand-amber" />
            <span>Photobiology &amp; Environment</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal tracking-tight">
            Your Daily Shield
          </h2>
          <p className="text-base sm:text-lg text-brand-mineral font-normal leading-relaxed">
            Understanding the invisible solar spectrum and how daily photoprotection preserves cellular longevity.
          </p>
        </div>

        {/* 3 Step Interactive Navigation Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {slides.map((s, idx) => {
            const isActive = activeStep === idx;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`p-5 sm:p-6 rounded-xl border text-left transition-all duration-300 relative cursor-pointer group ${
                  isActive
                    ? 'bg-surface-elevated border-brand-charcoal shadow-md -translate-y-0.5'
                    : 'bg-surface-muted/40 border-border-subtle hover:bg-surface-muted'
                }`}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Go to ${s.title}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-mono uppercase font-bold ${isActive ? 'text-brand-amber' : 'text-brand-mineral'}`}>
                    {s.stepNum}
                  </span>
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-charcoal' : 'text-brand-mineral group-hover:text-brand-charcoal'}`} />
                </div>
                <div className="font-serif text-lg sm:text-xl text-brand-charcoal font-medium">
                  {s.title}
                </div>
                <p className="text-xs text-brand-mineral mt-1">
                  {s.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Coordinated Slider Card: Left Image + Right Rich Content */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-surface-muted rounded-2xl border border-border-subtle overflow-hidden shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            
            {/* Left Column: Dedicated Content-Accurate Image (5 cols) */}
            <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[520px] bg-surface-base overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={currentSlide.image}
                    alt={currentSlide.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center"
                    priority={activeStep === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-[11px] font-mono font-medium text-brand-charcoal shadow-sm">
                      {currentSlide.badge}
                    </span>
                  </div>

                  {/* Slide Title Overlay at bottom of photo */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 text-white z-10">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-semibold block">
                      {currentSlide.stepNum}
                    </span>
                    <div className="font-serif text-xl sm:text-2xl font-medium drop-shadow-sm">
                      {currentSlide.title}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Dynamic Informational Panel (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step 01 Content: Solar Rays Breakdown */}
                  {activeStep === 0 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-brand-amber font-semibold">
                          Waveband Breakdown
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium mt-1">
                          The Invisible Solar Spectrum
                        </h3>
                        <p className="text-xs sm:text-sm text-brand-mineral mt-1">
                          Solar radiation reaches the skin in distinct wavelengths that require targeted protection mechanisms.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-brand-amber font-semibold block">
                            UVA (320 - 400 nm)
                          </span>
                          <h4 className="font-serif text-base text-brand-charcoal font-medium">The Aging Ray</h4>
                          <p className="text-xs text-brand-mineral leading-relaxed">
                            Penetrates deep into dermis through glass and clouds, degrading structural collagen year-round.
                          </p>
                          <div className="text-[10px] text-brand-olive font-semibold bg-brand-olive/10 px-2 py-0.5 rounded-xs inline-block">
                            PA++++ (Uvinul A Plus)
                          </div>
                        </div>

                        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-brand-amber font-semibold block">
                            UVB (290 - 320 nm)
                          </span>
                          <h4 className="font-serif text-base text-brand-charcoal font-medium">The Burning Ray</h4>
                          <p className="text-xs text-brand-mineral leading-relaxed">
                            Hits superficial epidermis. Causes sunburn and direct cellular DNA damage during peak midday hours.
                          </p>
                          <div className="text-[10px] text-brand-olive font-semibold bg-brand-olive/10 px-2 py-0.5 rounded-xs inline-block">
                            SPF 50+ (Tinosorb S)
                          </div>
                        </div>

                        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-brand-amber font-semibold block">
                            HEV Blue Light
                          </span>
                          <h4 className="font-serif text-base text-brand-charcoal font-medium">Digital Rays</h4>
                          <p className="text-xs text-brand-mineral leading-relaxed">
                            Emitted by screens and sunlight. Triggers persistent melasma and hyperpigmentation.
                          </p>
                          <div className="text-[10px] text-brand-olive font-semibold bg-brand-olive/10 px-2 py-0.5 rounded-xs inline-block">
                            Niacinamide Shield
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 02 Content: UV Environment & Indian Climate */}
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-brand-amber font-semibold">
                          Tropical Photobiology
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium mt-1">
                          Why Indian Climates Demand Different Chemistry
                        </h3>
                        <p className="text-xs sm:text-sm text-brand-mineral mt-1 leading-relaxed">
                          In India, the solar UV index regularly registers between 8 (Very High) and 12 (Extreme) for over 9 months. Heavy foreign sunscreens melt off within 45 minutes due to sweat dissolution.
                        </p>
                      </div>

                      <div className="bg-surface-elevated p-5 rounded-xl border border-border-subtle space-y-3">
                        <div className="text-xs uppercase tracking-wider text-brand-charcoal font-semibold">
                          Annual Indian UV Scale &amp; Exposure Guide
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                            <span>UV 1 - 2: Low Exposure</span>
                            <span className="font-bold">Winter Dawns</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-100">
                            <span>UV 3 - 7: Moderate to High</span>
                            <span className="font-bold">Morning Transit</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 text-red-800 border border-red-100">
                            <span>UV 8 - 11+: Very High to Extreme</span>
                            <span className="font-bold">10 AM to 4 PM Peak</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 03 Content: Daily Defense Pillars */}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-brand-amber font-semibold">
                          Clinical Photoprotection
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium mt-1">
                          Broad-Spectrum Photostable Shield
                        </h3>
                        <p className="text-xs sm:text-sm text-brand-mineral mt-1">
                          Engineered to maintain uninterrupted filter integrity without suffocating dermal pores.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle space-y-2">
                          <Shield className="w-5 h-5 text-brand-amber" />
                          <h4 className="font-serif text-base text-brand-charcoal font-medium">8-Hour Stability</h4>
                          <p className="text-xs text-brand-mineral leading-relaxed">
                            Photostable modern filters that do not degrade or release free radicals under intense solar exposure.
                          </p>
                        </div>

                        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle space-y-2">
                          <Sparkles className="w-5 h-5 text-brand-amber" />
                          <h4 className="font-serif text-base text-brand-charcoal font-medium">Zero White Cast</h4>
                          <p className="text-xs text-brand-mineral leading-relaxed">
                            Verified across Indian Fitzpatrick phototypes III to VI, disappearing completely into skin in 10 seconds.
                          </p>
                        </div>

                        <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle space-y-2">
                          <Check className="w-5 h-5 text-brand-olive" />
                          <h4 className="font-serif text-base text-brand-charcoal font-medium">Pore-Friendly</h4>
                          <p className="text-xs text-brand-mineral leading-relaxed">
                            Non-comedogenic base formulated without heavy occlusive waxes or breakout-triggering oils.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
