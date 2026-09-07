'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProcessing } from '@/context/ProcessingContext';
import { ArrowRight, Lock, Mail, Sparkles, AlertCircle, Loader2, Eye, EyeOff, Shield, KeyRound } from 'lucide-react';
import { sanitizeRedirectPath } from '@/lib/validation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || searchParams.get('next');
  const { login, user } = useAuth();
  const { showProcessing, hideProcessing } = useProcessing();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Clean up global processing overlay on component unmount
  React.useEffect(() => {
    return () => {
      hideProcessing();
    };
  }, [hideProcessing]);

  // If already logged in, redirect based strictly on server-determined user role
  React.useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        const safeTarget = sanitizeRedirectPath(rawRedirect, '/admin');
        router.push(safeTarget.startsWith('/admin') ? safeTarget : '/admin');
      } else {
        const safeTarget = sanitizeRedirectPath(rawRedirect, '/account');
        router.push(safeTarget.startsWith('/admin') ? '/account' : safeTarget);
      }
    }
  }, [user, router, rawRedirect]);

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

    if (mfaRequired) {
      const trimmedPin = pin.trim();
      if (!trimmedPin || !/^\d{6}$/.test(trimmedPin)) {
        setError('Please enter your 6-digit numeric Admin Security PIN.');
        return;
      }
    }

    setSubmitting(true);
    showProcessing(
      mfaRequired ? 'Verifying Admin PIN...' : 'Signing you in...',
      mfaRequired ? 'Validating cryptographic security credentials...' : 'Authenticating credentials and synchronizing session...'
    );

    try {
      const result = await login(trimmedEmail, password, mfaRequired ? pin.trim() : undefined);
      if (result.success) {
        if (result.requiresMfa) {
          hideProcessing();
          setSubmitting(false);
          setMfaRequired(true);
          return;
        }

        hideProcessing();
        setSubmitting(false);

        // Role-based destination routing
        if (result.user?.role === 'ADMIN') {
          const safeTarget = sanitizeRedirectPath(rawRedirect, '/admin');
          const dest = safeTarget.startsWith('/admin') ? safeTarget : '/admin';
          router.push(dest);
        } else {
          // CUSTOMER is never redirected to /admin
          const safeTarget = sanitizeRedirectPath(rawRedirect, '/account');
          const dest = safeTarget.startsWith('/admin') ? '/account' : safeTarget;
          router.push(dest);
        }
      } else {
        hideProcessing();
        setSubmitting(false);
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      hideProcessing();
      setSubmitting(false);
      setError('A network error occurred. Please try again.');
    } finally {
      hideProcessing();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:py-24 bg-surface-base">
      <div className="w-full max-w-md bg-surface-elevated border border-border-subtle p-8 sm:p-10 rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          {mfaRequired ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-medium tracking-wider uppercase text-amber-600 mb-2">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin Step-Up Security</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sand/30 border border-brand-sand/50 text-[11px] font-medium tracking-wider uppercase text-brand-charcoal/80 mb-2">
              <Sparkles className="w-3 h-3 text-brand-amber" />
              <span>Sign In Portal</span>
            </div>
          )}
          <h1 className="font-serif text-3xl font-light text-brand-charcoal tracking-tight">
            {mfaRequired ? 'Enter Security PIN' : 'Sign In to VELYRA'}
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60">
            {mfaRequired
              ? 'Elevated administrative credentials detected. Enter your 6-digit PIN to access Operations.'
              : 'Access your formulation orders, saved addresses, concierge service, and operations.'}
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
          {!mfaRequired ? (
            <>
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
            </>
          ) : (
            <div className="space-y-1.5 animate-fade-in">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
                6-Digit Security PIN *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  maxLength={6}
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-base border border-amber-300 font-mono tracking-widest text-center text-lg rounded-xs focus:outline-none focus:border-amber-500 transition-colors placeholder:text-foreground/30"
                />
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-foreground/50">Confidential admin key</span>
                <button
                  type="button"
                  onClick={() => {
                    setMfaRequired(false);
                    setPin('');
                    setError('');
                  }}
                  className="text-[11px] text-brand-charcoal hover:underline"
                >
                  Cancel / Re-enter credentials
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full mt-2 py-3 rounded-xs text-xs uppercase tracking-editorial font-medium transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.08)] disabled:opacity-60 disabled:cursor-not-allowed ${
              mfaRequired
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-brand-charcoal hover:bg-black text-white'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mfaRequired ? 'Validating PIN...' : 'Authenticating...'}</span>
              </>
            ) : (
              <>
                <span>{mfaRequired ? 'Authorize & Open Admin Dashboard' : 'Sign In'}</span>
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
              href={`/signup${rawRedirect ? `?redirect=${encodeURIComponent(rawRedirect)}` : ''}`}
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

