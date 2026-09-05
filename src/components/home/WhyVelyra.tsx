import React from 'react';
import { Shield, Droplets, Sparkles, Feather, HeartHandshake, EyeOff } from 'lucide-react';

export function WhyVelyra() {
  const pillars = [
    {
      icon: Feather,
      title: 'Weightless On Skin',
      description: 'Formulated with ultra-fine fluid emulsions that absorb within 10 seconds without any sticky or heavy film.',
    },
    {
      icon: EyeOff,
      title: 'True Zero White Cast',
      description: 'Transparent micro-dispersion filters calibrated for Indian Fitzpatrick skin tones (Types III to VI).',
    },
    {
      icon: Droplets,
      title: 'Acne-Safe & Non-Comedogenic',
      description: 'Breathable pore-friendly base infused with Centella Asiatica & Niacinamide to soothe heat inflammation.',
    },
    {
      icon: Shield,
      title: 'Tested Photostability',
      description: 'Advanced European filters that retain their SPF 50+ integrity even under grueling midday sun exposure.',
    },
  ];

  return (
    <section className="py-24 bg-surface-muted border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
            Why Indian Skin Needs VELYRA
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
            Skincare formulated for our sun, our humidity, our skin.
          </h2>
          <p className="text-xs sm:text-sm text-brand-mineral leading-relaxed">
            Most imported luxury sunscreens are designed for dry, temperate European winters. VELYRA is engineered from the ground up for tropical heat, urban pollution, and melanin-rich skin.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-surface-elevated p-8 rounded-sm border border-border-subtle hover:border-brand-charcoal/30 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4"
              >
                <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-brand-amber">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-brand-charcoal font-medium">
                  {pillar.title}
                </h3>
                <p className="text-xs text-brand-mineral leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
