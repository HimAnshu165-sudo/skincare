'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export function TextureLab() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const stages = [
    {
      step: 0,
      name: 'TEXTURE',
      subtitle: 'Micro-Fluid Droplet',
      actionTitle: '1. Dispense: Fluid Micro-Droplet',
      description: 'Suspended in high-viscosity surface tension. A concentrated pearl of photostable UV filters and botanical lipids resting on the skin.',
      visualNote: 'Silky, luminous emulsion with zero heaviness',
      duration: '0 to 2 Seconds',
      skinState: 'Surface Dermal Contact',
      dermalEffect: 'Initial contact with skin natural body temperature (36.5°C).',
      bgGlow: 'from-brand-amber/15 via-brand-sand/20 to-transparent',
      image: '/textures/01-dispense.jpg',
      imageAlt: 'Concentrated pearl droplet of Velyra fluid sunscreen resting on natural stone',
      badge: 'Concentrated Fluid Droplet',
    },
    {
      step: 1,
      name: 'APPLICATION',
      subtitle: 'Sensorial Fluid Break',
      actionTitle: '2. Glide: Instant Water-Break',
      description: 'Under gentle fingertip shearing force, the emulsion breaks instantly into refreshing micro-water droplets that glide effortlessly across contours.',
      visualNote: 'Effortless friction-free spreadability',
      duration: '2 to 5 Seconds',
      skinState: 'Glide & Dispersal',
      dermalEffect: 'Micro-dispersion of Tinosorb S filters evenly coating epidermal micro-creases.',
      bgGlow: 'from-amber-200/20 via-orange-100/20 to-transparent',
      image: '/textures/02-glide.jpg',
      imageAlt: 'Sensory fingertip glide dispersing lightweight fluid sunscreen across skin',
      badge: 'Instant Water-Break Glide',
    },
    {
      step: 2,
      name: 'ABSORPTION',
      subtitle: 'Cellular Dermal Uptake',
      actionTitle: '3. Uptake: 10-Second Penetration',
      description: 'Niacinamide, Hyaluronic Acid, and Centella Asiatica penetrate the stratum corneum while the photoprotective matrix binds to skin lipids.',
      visualNote: 'Zero tacky residue or oil film',
      duration: '5 to 10 Seconds',
      skinState: 'Rapid Absorption',
      dermalEffect: 'Zero occlusion of follicular pores; completely non-comedogenic bonding.',
      bgGlow: 'from-amber-100/20 via-brand-sand/20 to-transparent',
      image: '/textures/03-absorption.jpg',
      imageAlt: 'Active photoprotective emulsion completely penetrating skin with zero white cast',
      badge: 'Rapid Epidermal Uptake',
    },
    {
      step: 3,
      name: 'FINISH',
      subtitle: 'Invisible Velvet Dew',
      actionTitle: '4. Final Finish: 100% Invisible Shield',
      description: 'The final dry-down: bare skin illuminated with an imperceptible velvet dew glow. Zero white cast, zero ghosting, and zero eye burn.',
      visualNote: 'Airbrushed second-skin radiance',
      duration: 'All-Day Wear',
      skinState: 'Imperceptible Photoprotection',
      dermalEffect: 'Broad spectrum photostable UVA + UVB shield locked in for daily city wear.',
      bgGlow: 'from-brand-sand/30 via-surface-muted to-transparent',
      image: '/textures/04-finish.jpg',
      imageAlt: 'Velyra 100% invisible velvet dew finish in bright natural sunlight',
      badge: 'Invisible Velvet Dew Finish',
    },
  ];

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveStep((prev) => (prev + 1) % stages.length);
  }, [stages.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveStep((prev) => (prev - 1 + stages.length) % stages.length);
  }, [stages.length]);

  const goToStep = (idx: number) => {
    setDirection(idx > activeStep ? 1 : -1);
    setActiveStep(idx);
  };

  // Automatic slider transition every 3 seconds (pauses strictly when hovering over the card)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const current = stages[activeStep];

  return (
    <section
      className="py-24 sm:py-32 bg-surface-base border-b border-border-subtle relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="The Velyra Texture Lab Transformation"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted border border-border-subtle rounded-full text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
            <span>Sensory Formulation Lab</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal tracking-tight">
            The Velyra Texture Lab
          </h2>
          <p className="text-base sm:text-lg text-brand-mineral font-normal leading-relaxed">
            Experience the 10-second dermal transformation from concentrated droplet to completely invisible photoprotective veil.
          </p>
        </div>

        {/* 4 Interactive Stage Buttons (Clean, no black lines) */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12 flex-wrap">
          {stages.map((stg) => {
            const isActive = activeStep === stg.step;
            return (
              <button
                key={stg.step}
                type="button"
                onClick={() => goToStep(stg.step)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className={`px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand-charcoal text-white shadow-lg scale-105'
                    : 'bg-surface-muted text-brand-charcoal hover:bg-border-strong border border-border-subtle'
                }`}
                aria-label={`Go to ${stg.name} stage`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand-amber' : 'bg-brand-mineral'}`} />
                <span>{stg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Lab Showcase Card (Pauses strictly on hover over this card) */}
        <div
          className="bg-surface-muted rounded-2xl border border-border-subtle p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-sm"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Ambient Glow */}
          <div className={`absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${current.bgGlow} blur-3xl pointer-events-none transition-all duration-700`} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            
            {/* Left High-End Photographic Showcase */}
            <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-surface-elevated border border-border-subtle shadow-md">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.step}
                  custom={direction}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={current.image}
                    alt={current.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center"
                    priority={activeStep === 0}
                  />

                  {/* Editorial Vignette / Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25 pointer-events-none" />

                  {/* Top Stage Badge */}
                  <div className="absolute top-4 left-4 bg-brand-charcoal/85 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-3.5 py-1.5 rounded-full border border-white/20">
                    Stage 0{current.step + 1} / 04 • {current.name}
                  </div>

                  {/* Bottom Verification Label */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase tracking-widest text-brand-amber font-bold block mb-0.5">
                      Dermal Transformation Phase
                    </span>
                    <div className="font-serif text-lg sm:text-xl font-medium drop-shadow-sm">
                      {current.badge}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Stage Narrative & Controls */}
            <div className="lg:col-span-6 space-y-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 20 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div>
                    <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold block mb-1">
                      Sensory Phase
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-medium">
                      {current.actionTitle}
                    </h3>
                  </div>

                  <p className="text-base text-brand-mineral leading-relaxed">
                    {current.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle space-y-1 shadow-xs">
                      <span className="text-[10px] uppercase tracking-widest text-brand-mineral block font-semibold">
                        Time to Finish
                      </span>
                      <div className="font-serif text-base font-semibold text-brand-charcoal">
                        {current.duration}
                      </div>
                    </div>
                    <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle space-y-1 shadow-xs">
                      <span className="text-[10px] uppercase tracking-widest text-brand-mineral block font-semibold">
                        Sensory Profile
                      </span>
                      <div className="font-serif text-base font-semibold text-brand-charcoal">
                        {current.visualNote}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Sequence Controls */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={nextSlide}
                  className="bg-brand-charcoal text-white px-6 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-brand-mineral transition-colors rounded-xs flex items-center gap-2 shadow-sm"
                >
                  <span>{activeStep === stages.length - 1 ? 'Restart Sequence' : 'Next Stage'}</span>
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(0)}
                  className="border border-border-strong px-4 py-3.5 text-xs uppercase tracking-widest font-semibold text-brand-charcoal hover:bg-surface-elevated transition-colors rounded-xs"
                  title="Reset to stage 1"
                  aria-label="Reset to stage 1"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
