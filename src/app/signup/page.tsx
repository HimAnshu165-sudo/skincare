'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Lock, Mail, User as UserIcon, Phone, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';
  const { signup, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const result = await signup(name, email, password, phone);
    setSubmitting(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.message || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:py-24 bg-surface-base">
      <div className="w-full max-w-md bg-surface-elevated border border-border-subtle p-8 sm:p-10 rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sand/30 border border-brand-sand/50 text-[11px] font-medium tracking-wider uppercase text-brand-charcoal/80 mb-2">
            <Sparkles className="w-3 h-3 text-brand-amber" />
            <span>Join VELYRA</span>
          </div>
          <h1 className="font-serif text-3xl font-light text-brand-charcoal tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60">
            Enjoy priority restock access, express checkout, and tailored skincare consultation.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-base border border-border-strong rounded-xs text-xs sm:text-sm focus:outline-none focus:border-brand-charcoal transition-colors placeholder:text-foreground/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav.sharma@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-base border border-border-strong rounded-xs text-xs sm:text-sm focus:outline-none focus:border-brand-charcoal transition-colors placeholder:text-foreground/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-base border border-border-strong rounded-xs text-xs sm:text-sm focus:outline-none focus:border-brand-charcoal transition-colors placeholder:text-foreground/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal/70">
              Password (Min. 6 Characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-base border border-border-strong rounded-xs text-xs sm:text-sm focus:outline-none focus:border-brand-charcoal transition-colors placeholder:text-foreground/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-3 py-3 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.08)] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-border-subtle text-center text-xs text-foreground/60 space-y-2">
          <p>
            Already have an account?{' '}
            <Link
              href={`/login${redirectUrl !== '/account' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="text-brand-charcoal font-medium underline underline-offset-4 hover:opacity-75 transition-opacity"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-charcoal" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
