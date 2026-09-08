'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, User as UserIcon, LogOut, Package, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MobileNav } from './MobileNav';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { openCart, itemCount } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Sunscreen', href: '/products/silk-air-fluid-sunscreen-spf50' },
    { label: 'Shop All', href: '/products' },
    { label: 'Our Story', href: '/about' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'header-blur shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-border-subtle py-3.5'
            : 'bg-surface-base/95 border-b border-border-subtle/60 py-4.5'
        }`}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-brand-charcoal hover:opacity-70 transition-opacity"
              aria-label="Open menu"
              suppressHydrationWarning
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Left Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] tracking-wide uppercase transition-all duration-200 font-medium ${
                    isActive
                      ? 'text-brand-charcoal font-semibold border-b border-brand-charcoal pb-0.5'
                      : 'text-brand-charcoal/70 hover:text-brand-charcoal'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Brand Logo - Centered in Navbar */}
          <div className="flex-1 lg:flex-initial text-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-medium text-brand-charcoal uppercase group-hover:opacity-85 transition-opacity">
                VELYRA
              </span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-brand-charcoal hover:opacity-70 transition-opacity p-1.5"
              aria-label="Search products"
              suppressHydrationWarning
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Customer Account Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 text-brand-charcoal hover:opacity-70 transition-opacity group"
                  aria-label="User Account"
                  suppressHydrationWarning
                >
                  <div className="w-7 h-7 rounded-full bg-brand-sand/60 text-brand-charcoal text-xs font-semibold flex items-center justify-center border border-brand-sand">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-foreground/50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border-subtle rounded-sm shadow-xl py-2 z-50 animate-fade-up text-xs">
                    <div className="px-4 py-2.5 border-b border-border-subtle">
                      <p className="font-medium text-brand-charcoal truncate">{user.name}</p>
                      <p className="text-[11px] text-foreground/50 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-foreground/80 hover:bg-surface-muted hover:text-brand-charcoal transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-foreground/50" />
                        <span>Account Dashboard</span>
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-foreground/80 hover:bg-surface-muted hover:text-brand-charcoal transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-foreground/50" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/account/addresses"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-foreground/80 hover:bg-surface-muted hover:text-brand-charcoal transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-foreground/50" />
                        <span>Saved Addresses</span>
                      </Link>
                    </div>

                    <div className="border-t border-border-subtle pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50/50 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand-charcoal/80 hover:text-brand-charcoal transition-colors p-1"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Shopping Bag Button */}
            <button
              type="button"
              onClick={openCart}
              className="relative text-brand-charcoal hover:opacity-70 transition-opacity p-1.5 flex items-center gap-1.5 group"
              aria-label="View shopping bag"
              suppressHydrationWarning
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline-block text-xs font-medium tracking-wide uppercase text-brand-charcoal/70 group-hover:text-brand-charcoal">
                Bag
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-charcoal text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {searchOpen && (
          <div className="border-t border-border-subtle bg-surface-base px-4 py-4 animate-fade-in">
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <Search className="w-4 h-4 text-foreground/40" />
              <input
                type="text"
                placeholder="Search formulations (e.g. Silk-Air Sunscreen, Ceramides, SPF 50)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-brand-charcoal/20 pb-1.5 text-sm text-brand-charcoal placeholder:text-foreground/40 focus:outline-none focus:border-brand-charcoal"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs text-foreground/50 uppercase tracking-wider hover:text-brand-charcoal"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={navLinks}
      />
    </>
  );
}
