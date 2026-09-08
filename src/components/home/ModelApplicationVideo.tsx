'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, ShieldCheck, Volume2, VolumeX, Maximize } from 'lucide-react';
import { CinematicVideoModal } from '@/components/video/CinematicVideoModal';
import { VELYRA_SUNSCREENS } from '@/lib/sunscreenData';

export function ModelApplicationVideo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  // Default featured product for the flagship application showcase
  const featuredProduct = VELYRA_SUNSCREENS[0]; // VEL-01 Silk-Air Fluid

  // Autoplay video as soon as the website is scrolled towards this section
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    // Strict browser autoplay compliance: muted, defaultMuted, and explicit attributes
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // If browser policy deferred it, it will retry on next tick or interaction
          });
      }
    };

    // IntersectionObserver triggers as soon as the section is scrolled near (150px margin)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            attemptPlay();
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        root: null,
        rootMargin: '150px 0px 150px 0px', // Starts playing slightly before it enters the viewport
        threshold: 0.02, // Triggers immediately when even 2% is near viewport
      }
    );

    observer.observe(section);

    // If media was still buffering when scrolled into view, start playing as soon as data arrives
    const handleCanPlay = () => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight + 150 && rect.bottom > -150) {
        attemptPlay();
      }
    };

    video.addEventListener('canplay', handleCanPlay);

    // Initial check in case user loaded the page directly scrolled to this section
    handleCanPlay();

    return () => {
      observer.disconnect();
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Toggle sound
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  // Open full modal
  const handleOpenModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setModalOpen(true);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="application-ritual"
      className="w-full bg-surface-base border-b border-border-subtle relative overflow-hidden"
    >
      {/* 100% Full-Width Cinematic Video Showcase Banner with Sleek Height */}
      <div
        onClick={togglePlay}
        className="group relative w-full h-[320px] sm:h-[420px] lg:h-[460px] overflow-hidden bg-black cursor-pointer select-none"
        role="region"
        aria-label="The Velyra Application Ritual Video Demonstration"
      >
        {/* Autoplaying HTML5 Video with 100% Width */}
        <video
          ref={videoRef}
          src="/VELYRA_sunscreen_bottle_at_shore…_202609081027.mp4"
          muted
          autoPlay
          playsInline
          loop
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.01]"
          aria-label="Velyra Sunscreen Bottle at Shore Video"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src="/VELYRA_sunscreen_bottle_at_shore…_202609081027.mp4" type="video/mp4" />
          <source src="/VELYRA_sunscreen_shore.mp4" type="video/mp4" />
        </video>

        {/* Luxury Cinematic Scrim & Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/25 transition-opacity duration-300 pointer-events-none" />

        {/* Centered Play/Pause Trigger (Fades out when autoplaying, reveals on hover or pause) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 transition-all duration-300 ${
            isPlaying ? 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100' : 'opacity-100 scale-100'
          }`}
        >
          <button
            ref={playButtonRef}
            type="button"
            onClick={togglePlay}
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:scale-110 hover:bg-white/30 hover:border-white/60 transition-all duration-300 shadow-2xl pointer-events-auto focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label={isPlaying ? 'Pause application demonstration' : 'Play application demonstration'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 sm:w-8 sm:h-8 fill-white" />
            ) : (
              <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
            )}
          </button>

          <div className="mt-2.5 sm:mt-3 flex flex-col items-center gap-1">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-bold text-amber-200 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              {isPlaying ? 'Pause Demonstration' : 'Watch Application'}
            </span>
            <span className="text-[11px] sm:text-xs text-stone-300 tracking-wide font-medium">
              The Velyra Application Ritual
            </span>
          </div>
        </div>

        {/* Floating Editorial Badges and Statement */}
        <div className="absolute inset-0 p-4 sm:p-8 lg:p-12 flex flex-col justify-between pointer-events-none z-10">
          {/* Top Bar Badges & Interactive Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest rounded-full border border-white/20">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isPlaying ? 'Live Demonstration' : 'Application Ritual'}</span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={toggleMute}
                className="px-3 py-1 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white text-[11px] font-medium rounded-full border border-white/20 flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-1 focus:ring-white/50"
                aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isMuted ? 'Sound Off' : 'Sound On'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenModal}
                className="p-1.5 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white rounded-full border border-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-white/50"
                aria-label="Expand to full cinematic view"
                title="Full Cinematic View"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Statement */}
          <div className="max-w-2xl space-y-2 transform transition-transform duration-300 group-hover:-translate-y-0.5">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>The Velyra Application Standard</span>
            </div>
            <blockquote className="font-serif text-xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight drop-shadow-md">
              &ldquo;Light on the skin. Strong on everyday protection.&rdquo;
            </blockquote>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg leading-relaxed drop-shadow-sm line-clamp-2 sm:line-clamp-none">
              Protection that disappears into your morning routine. Zero white cast, zero eye stinging, and zero heavy residue.
            </p>
          </div>
        </div>
      </div>

      {/* Reusable Cinematic Video Modal */}
      {modalOpen && (
        <CinematicVideoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={featuredProduct}
          videoSrc="/VELYRA_sunscreen_bottle_at_shore…_202609081027.mp4"
          posterSrc=""
          title="The Velyra Application Ritual"
          statement="Protection that disappears into your routine. Zero white cast, zero stinging."
          triggerRef={playButtonRef}
        />
      )}
    </section>
  );
}
