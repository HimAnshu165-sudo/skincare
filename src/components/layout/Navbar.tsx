'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MobileNav } from './MobileNav';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { openCart, itemCount } = useCart();

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

  const navLinks = [
    { label: 'Sunscreen', href: '/products/silk-air-fluid-sunscreen-spf50' },
    { label: 'Shop All', href: '/products' },
    { label: 'Our Story', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Track Order', href: '/track-order' },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-brand-charcoal hover:opacity-70 transition-opacity"
              aria-label="Open menu"
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
                      : 'text-brand-mineral hover:text-brand-charcoal'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Brand Logo (Center on Desktop, Centered on Mobile) */}
          <div className="flex-1 lg:flex-initial text-center">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-medium text-brand-charcoal uppercase group-hover:opacity-85 transition-opacity">
                VELYRA
              </span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-brand-charcoal hover:opacity-70 transition-opacity p-1.5"
              aria-label="Search products"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={openCart}
              className="relative text-brand-charcoal hover:opacity-70 transition-opacity p-1.5 flex items-center gap-1.5 group"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline-block text-xs font-medium tracking-wide uppercase text-brand-mineral group-hover:text-brand-charcoal">
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
              <Search className="w-4 h-4 text-brand-mineral" />
              <input
                type="text"
                placeholder="Search formulations (e.g. Silk-Air Sunscreen, Ceramides, SPF 50)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-brand-charcoal/20 pb-1.5 text-sm text-brand-charcoal placeholder:text-brand-mineral focus:outline-none focus:border-brand-charcoal"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs text-brand-mineral uppercase tracking-wider hover:text-brand-charcoal"
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
