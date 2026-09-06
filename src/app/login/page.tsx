'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Lock, Mail, Sparkles, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    const result = await login(trimmedEmail, password);
    setSubmitting(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:py-24 bg-surface-base">
      <div className="w-full max-w-md bg-surface-elevated border border-border-subtle p-8 sm:p-10 rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sand/30 border border-brand-sand/50 text-[11px] font-medium tracking-wider uppercase text-brand-charcoal/80 mb-2">
            <Sparkles className="w-3 h-3 text-brand-amber" />
            <span>Customer Portal</span>
          </div>
          <h1 className="font-serif text-3xl font-light text-brand-charcoal tracking-tight">
            Sign In to VELYRA
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60">
            Access your formulation orders, saved addresses, and concierge service.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-base border border-border-strong rounded-xs text-xs sm:text-sm focus:outline-none focus:border-brand-charcoal transition-colors placeholder:text-foreground/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
                Password *
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-surface-base border border-border-strong rounded-xs text-xs sm:text-sm focus:outline-none focus:border-brand-charcoal transition-colors placeholder:text-foreground/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-brand-charcoal transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.08)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-border-subtle text-center text-xs text-foreground/60 space-y-3">
          <p>
            Don&apos;t have a VELYRA account?{' '}
            <Link
              href={`/signup${redirectUrl !== '/account' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="text-brand-charcoal font-medium underline underline-offset-4 hover:opacity-75 transition-opacity"
            >
              Create an Account
            </Link>
          </p>
          <div className="text-[11px] text-foreground/40">
            Guest items in your bag will be automatically linked to your account.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-charcoal" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
