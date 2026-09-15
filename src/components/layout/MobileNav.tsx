'use client';

import React from 'react';
import Link from 'next/link';
import { X, ArrowRight, ShieldCheck, User as UserIcon, Package, MapPin, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ label: string; href: string }>;
}

export function MobileNav({ isOpen, onClose, links }: MobileNavProps) {
  const { user, logout } = useAuth();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div className="fixed inset-y-0 left-0 w-[86vw] max-w-xs bg-surface-elevated shadow-xl z-50 p-5 sm:p-6 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col justify-between overflow-y-auto animate-fade-in border-r border-border-subtle">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
            <span className="font-serif text-xl tracking-[0.15em] font-medium text-brand-charcoal uppercase">
              VELYRA
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-brand-charcoal hover:opacity-70 transition-opacity"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Strip */}
          <div className="py-4 border-b border-border-subtle">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-sand/60 text-brand-charcoal text-xs font-semibold flex items-center justify-center border border-brand-sand">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-brand-charcoal truncate">{user.name}</p>
                    <p className="text-[10px] text-foreground/50 truncate">{user.email}</p>
                  </div>
                </div>

                {user.role === 'ADMIN' && (
                  <div className="pt-1">
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="flex items-center gap-2 px-3 py-2 rounded-xs bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-medium"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      <span>Admin Operations Dashboard</span>
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border-subtle text-[11px]">
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-foreground/70 hover:text-brand-charcoal"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>My Orders</span>
                  </Link>
                  <button
                    onClick={() => {
                      onClose();
                      logout();
                    }}
                    className="flex items-center gap-1.5 text-red-600 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-between text-xs font-medium text-brand-charcoal"
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-brand-charcoal/70" />
                  <span>Sign In / Create Account</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Links */}
          <nav className="mt-6 flex flex-col gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between text-sm uppercase tracking-wider font-medium text-brand-charcoal hover:text-brand-amber transition-colors group"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-amber" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-border-subtle space-y-4">
          <div className="bg-surface-muted p-3.5 rounded-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-olive flex-shrink-0" />
            <div className="text-[12px] text-brand-charcoal font-medium">
              Dermatologist Formulated • 100% Indian Fitzpatrick Safe
            </div>
          </div>
          <div className="text-xs text-foreground/60 flex items-center justify-between">
            <span>Concierge Support:</span>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-charcoal font-semibold hover:underline"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
