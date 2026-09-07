'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProcessing } from '@/context/ProcessingContext';
import { ArrowLeft, User, Lock, Phone, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AccountProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const { showProcessing, hideProcessing } = useProcessing();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account/profile');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const cleanedPhone = phone.trim().replace(/\D/g, '');
    if (cleanedPhone && !/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    showProcessing('Saving profile changes...', 'Updating your credentials in secure database...');

    try {
      const payload: any = { name: name.trim(), phone: cleanedPhone || null };
      if (newPassword) payload.password = newPassword;

      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Profile details updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
        refreshUser();
      } else {
        setErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch {
      setErrorMsg('Network error updating profile.');
    } finally {
      hideProcessing();
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface-base">
        <Loader2 className="w-8 h-8 animate-spin text-brand-charcoal/40" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-surface-base py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-foreground/60 hover:text-brand-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-light text-brand-charcoal">
            Profile & Security
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60">
            Update your personal contact credentials and account security settings.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-surface-elevated border border-border-subtle rounded-sm p-6 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-8">
          {successMsg && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xs animate-fade-in">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Account Details Section */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-medium text-brand-charcoal border-b border-border-subtle pb-2">
                Personal Credentials
              </h3>

              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 bg-surface-muted/60 border border-border-subtle rounded-xs text-foreground/50 cursor-not-allowed text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                    Phone Number
                  </label>
                  <span className="text-[10px] text-foreground/40 font-mono">10 digits</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4 pt-4">
              <h3 className="font-serif text-base font-medium text-brand-charcoal border-b border-border-subtle pb-2">
                Change Password (Optional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-brand-charcoal transition-colors"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-brand-charcoal transition-colors"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors disabled:opacity-60"
              >
                {saving ? 'Updating Profile...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
