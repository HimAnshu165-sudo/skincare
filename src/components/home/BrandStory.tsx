import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Award } from 'lucide-react';

export function BrandStory() {
  return (
    <section className="py-24 bg-surface-base border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Editorial Visual */}
          <div className="lg:col-span-6 relative aspect-[4/5] bg-surface-muted rounded-2xl overflow-hidden border border-border-subtle p-8 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src="/products/sunscreen-lifestyle.webp"
                alt="VELYRA brand story visual"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-6 left-6 bg-surface-elevated/90 backdrop-blur-sm p-4 rounded-sm border border-border-subtle max-w-xs shadow-md">
              <span className="text-[10px] uppercase tracking-widest text-brand-amber font-bold block mb-1">
                Clinical Standard
              </span>
              <p className="text-xs text-brand-charcoal font-serif">
                &ldquo;Photoprotection is the single most critical step in preserving skin longevity.&rdquo;
              </p>
            </div>
          </div>

          {/* Right Editorial Story Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold">
                Our Genesis
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-charcoal font-normal">
                Born out of frustration with heavy, white-cast sunscreens.
              </h2>
            </div>

            <p className="text-sm text-brand-mineral leading-relaxed">
              In India, the UV index regularly reaches peak hazard levels above 10 throughout the year. Yet, over 70% of people skip sunscreen because existing formulas feel greasy, cause acne flare-ups, sting the eyes during sweat, or leave a ghost-like purple or white mask on deeper skin tones.
            </p>

            <p className="text-sm text-brand-mineral leading-relaxed">
              We spent over 18 months formulating VELYRA with top cosmetic chemists in Bangalore and modern filter partners in Europe. The goal was uncompromising: zero white cast, supreme photostability, non-comedogenic ingredients, and a finish so weightless you look forward to applying it every single morning.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-brand-charcoal text-white px-7 py-3.5 text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-brand-mineral transition-colors"
              >
                <span>Read the Full Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-xs text-brand-mineral font-medium">
                Tested & Verified on Indian Phototypes III - VI
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
