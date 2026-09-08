'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { VelyraSunscreen } from '@/lib/sunscreenData';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface CinematicVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  statement?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function CinematicVideoModal({
  isOpen,
  onClose,
  product,
  videoSrc = '/Hero.mp4',
  posterSrc = '/models/model-apply.jpg',
  title = 'The Velyra Application Ritual',
  statement = 'Light on the skin. Strong on everyday protection.',
  triggerRef,
}: CinematicVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Helper to format seconds to mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const wasOpenRef = useRef(false);

  // Lock background scroll when modal is open and manage focus only upon active dismissal
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      document.body.style.overflow = 'hidden';
      // Auto-focus the video container for keyboard shortcuts without scrolling
      setTimeout(() => {
        containerRef.current?.focus({ preventScroll: true });
      }, 50);
    } else {
      document.body.style.overflow = '';
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        if (triggerRef?.current) {
          triggerRef.current.focus({ preventScroll: true });
        }
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, triggerRef]);

  // Autoplay video once modal opens and resets state
  useEffect(() => {
    if (isOpen && videoRef.current) {
      setHasEnded(false);
      setHasError(false);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with sound might be blocked by browser policy; fallback to muted autoplay
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
          });
      }
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (hasEnded) {
        videoRef.current.currentTime = 0;
        setHasEnded(false);
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, hasEnded]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  }, []);

  // Keyboard navigation: ESC, Space, M, F
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, togglePlay, toggleMute, toggleFullscreen]);

  // Handle Fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Controls auto-hide when video is playing
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  };

  // Real video time tracking
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    if (dur > 0) {
      setProgress((cur / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  // Seeking through real progress bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = newPercent * (videoRef.current.duration || 0);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(newPercent * 100);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
    setControlsVisible(true);
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const isAlreadyFormatted = product.name?.includes('SPF');
      const spfSuffix = product.spf || product.spfRating || '';
      const formattedName = isAlreadyFormatted ? product.name : `${product.name} ${spfSuffix}`.trim();
      const cartImages = Array.isArray(product.images)
        ? product.images
        : [product.image || '/models/model-apply.jpg'];

      const cartCompatibleProduct: any = {
        id: product.id,
        name: formattedName,
        slug: product.slug || product.id.replace('prod_', ''),
        price: product.price,
        mrp: product.mrp,
        inStock: true,
        stockQuantity: 100,
        sku: product.sku || product.code || 'VEL-01',
        volume: product.volume,
        images: cartImages,
        category: 'Sunscreens',
        benefits: product.benefits,
        keyIngredients: product.keyIngredients,
      };
      await addItem(cartCompatibleProduct, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add product to bag:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 lg:p-10 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Velyra Cinematic Video Player"
      >
        {/* Dark Cinematic Backdrop with subtle blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0E0D0C]/85 backdrop-blur-md"
        />

        {/* 90-95% Viewport Cinematic Window */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleMouseMove}
          tabIndex={0}
          className={`relative w-full max-w-6xl h-[62vh] min-h-[340px] sm:h-auto sm:aspect-[16/9] max-h-[92vh] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between focus:outline-none ${
            isFullscreen ? 'rounded-none max-h-screen h-screen' : ''
          }`}
        >
          {/* Top Bar: Brand Identifier & Close Button */}
          <div
            className={`absolute top-0 inset-x-0 p-4 sm:p-6 z-30 flex items-center justify-between transition-opacity duration-300 pointer-events-auto ${
              controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest rounded-full border border-white/20">
                VELYRA
              </span>
              <span className="text-xs text-stone-200 tracking-wider font-medium hidden sm:inline-block">
                {product ? `${product.name} — ${product.spf}` : title}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md text-white hover:bg-white/30 border border-white/20 flex items-center justify-center transition-colors shadow-lg"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* REAL HTML5 VIDEO ELEMENT */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {!hasError ? (
              <video
                ref={videoRef}
                playsInline
                preload="metadata"
                poster={posterSrc}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
                aria-label={title}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support HTML5 video playback.
              </video>
            ) : (
              /* Graceful Error Fallback (Section 14 Requirement) */
              <div className="p-8 text-center space-y-4 max-w-md mx-auto">
                <AlertCircle className="w-10 h-10 text-brand-amber mx-auto" />
                <h4 className="font-serif text-2xl text-white">Video Currently Unavailable</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  We are preparing a high-resolution demonstration for this formulation. Explore the clinical specs below.
                </p>
                {product && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-white text-brand-charcoal px-6 py-3 text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-brand-sand transition-colors"
                  >
                    Explore {product.name}
                  </button>
                )}
              </div>
            )}

            {/* Subtle Click-To-Play Indicator if Paused */}
            {!isPlaying && !hasEnded && !hasError && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-2xl z-20"
                aria-label="Play video"
              >
                <Play className="w-8 h-8 fill-white translate-x-0.5" />
              </button>
            )}

            {/* Video Ending Experience (Section 15 Requirement) */}
            {hasEnded && product && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm p-6 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 z-20"
              >
                <span className="text-[11px] uppercase tracking-[0.25em] text-brand-amber font-semibold">
                  Discover Velyra
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal max-w-lg">
                  {product.name}
                </h3>

                <p className="text-xs sm:text-sm text-stone-300 max-w-md leading-relaxed">
                  {statement} Finish: {product.finish} • Zero White Cast.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`px-7 py-3.5 text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center gap-2 shadow-lg ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-brand-charcoal hover:bg-brand-sand'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{added ? 'Added to Bag' : `Shop Now • ${formatPrice(product.price)}`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className="px-6 py-3.5 text-xs uppercase tracking-widest font-semibold border border-white/30 text-white hover:bg-white/10 rounded-xs transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Replay Ritual</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Bar: REAL VIDEO CONTROLS & Dynamic Editorial Story Layer */}
          <div
            className={`absolute bottom-0 inset-x-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 pointer-events-auto ${
              controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Real Interactive Seekable Progress Bar */}
            <div
              ref={progressBarRef}
              onClick={handleSeek}
              className="relative w-full h-1.5 bg-white/25 hover:h-2.5 rounded-full cursor-pointer mb-3.5 transition-all group"
              role="slider"
              aria-label="Video seek bar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-brand-amber rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-3 text-white text-xs">
              
              {/* Left Controls: Play/Pause, Real Timestamps, Volume */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="hover:text-brand-amber transition-colors p-2 -ml-1 rounded-full focus:outline-none"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                </button>

                {/* Real Time from Video Events */}
                <div className="font-mono text-[10px] sm:text-[11px] text-stone-300 tracking-wider">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1 text-stone-500">/</span>
                  <span>{formatTime(duration)}</span>
                </div>

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="hover:text-brand-amber transition-colors p-2 rounded-full focus:outline-none"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Center Editorial Brand Layer (Section 6 Requirement) */}
              <div className="text-center hidden md:block">
                <span className="text-[11px] tracking-widest uppercase font-semibold text-stone-300">
                  {product ? `${product.name} • ${product.finish}` : statement}
                </span>
              </div>

              {/* Right Controls: Fullscreen */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="hover:text-brand-amber transition-colors p-2 -mr-1 rounded-full focus:outline-none"
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
