'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Sparkles,
  Layers,
  Users,
  CreditCard,
  Image as ImageIcon,
  ExternalLink,
  LogOut,
  Shield,
  Menu,
  X,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from 'lucide-react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

import { useAuth } from '@/context/AuthContext';
import { useProcessing } from '@/context/ProcessingContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { showProcessing } = useProcessing();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unauthorized = !authLoading && (!user || user.role !== 'ADMIN');
  const loading = authLoading;

  const handleLogout = async () => {
    showProcessing('Signing out...', 'Closing secure administrative session...');
    await logout();
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Orders', href: '/admin/orders', icon: Package },
    { label: 'Products', href: '/admin/products', icon: Sparkles },
    { label: 'Inventory', href: '/admin/inventory', icon: Layers },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11100F] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif text-[#FAF8F5] tracking-wide">
            Verifying Admin Authorization...
          </h2>
          <p className="text-xs text-[#A8A196]">Connecting to secure operations gateway</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[#11100F] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1A1918] border border-red-500/20 rounded-lg p-8 text-center space-y-6 shadow-2xl">
          <div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif text-[#FAF8F5] font-normal">
              Access Restricted
            </h1>
            <p className="text-xs text-[#A8A196] leading-relaxed">
              This administrative area requires elevated database credentials (<code className="text-amber-400">role: ADMIN</code>). Your session is not authorized to view operations portals.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/login?redirect=/admin"
              className="flex-1 bg-amber-500 text-[#11100F] py-2.5 px-4 rounded-xs text-xs font-semibold uppercase tracking-wider hover:bg-amber-400 transition-colors"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/"
              className="flex-1 bg-[#252422] border border-[#3A3835] text-[#FAF8F5] py-2.5 px-4 rounded-xs text-xs font-semibold uppercase tracking-wider hover:bg-[#2F2D2A] transition-colors"
            >
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0E0D] text-[#E8DFD3] flex flex-col lg:flex-row antialiased">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 bg-[#171614] border-r border-[#262422] flex-col shrink-0 justify-between">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#262422]">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-sm bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-lg group-hover:border-amber-400 transition-colors">
                V
              </div>
              <div>
                <span className="font-serif text-lg tracking-widest text-[#FAF8F5] uppercase block font-semibold">
                  VELYRA
                </span>
                <span className="text-[10px] uppercase tracking-widest text-amber-400/90 font-mono font-medium flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Operations Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#7D776E] font-semibold">
              Core Modules
            </div>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold shadow-xs'
                      : 'text-[#B8B0A2] hover:text-[#FAF8F5] hover:bg-[#201F1D]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-[#8C857B]'}`} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-400/70" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Profile */}
        <div className="p-4 border-t border-[#262422] space-y-3">
          <div className="bg-[#201F1D] p-3 rounded-sm border border-[#2E2C29] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#FAF8F5] truncate">{user?.name}</div>
              <div className="text-[10px] text-[#8C857B] truncate">{user?.email}</div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-amber-400/10 text-amber-400 border border-amber-400/20">
              ADMIN
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#201F1D] hover:bg-[#2A2825] border border-[#2E2C29] text-[11px] text-[#B8B0A2] hover:text-[#FAF8F5] rounded-xs transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Live Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 bg-[#201F1D] hover:bg-red-950/40 border border-[#2E2C29] hover:border-red-500/30 text-[#B8B0A2] hover:text-red-400 rounded-xs transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden bg-[#171614] border-b border-[#262422] p-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-sm">
            V
          </div>
          <span className="font-serif text-base tracking-widest text-[#FAF8F5] uppercase font-semibold">
            VELYRA ADMIN
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#FAF8F5] bg-[#201F1D] rounded-xs border border-[#2E2C29]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#171614] border-b border-[#262422] p-4 space-y-3 z-30">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'text-[#B8B0A2]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-[#262422] flex gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#201F1D] text-xs text-[#FAF8F5] rounded-xs"
            >
              <ExternalLink className="w-3 h-3" /> Live Store
            </Link>
            <button
              onClick={handleLogout}
              className="py-2 px-3 bg-red-950/40 text-red-400 rounded-xs text-xs"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar for desktop */}
        <header className="hidden lg:flex items-center justify-between h-14 px-8 bg-[#141311] border-b border-[#262422] shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#8C857B]">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[#FAF8F5] font-medium">PostgreSQL Direct Operations Mode</span>
            <span className="text-[#4A4742]">•</span>
            <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Connected
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-[#B8B0A2] hover:text-[#FAF8F5] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </Link>
            <div className="h-4 w-px bg-[#262422]"></div>
            <div className="text-xs text-[#FAF8F5]">
              Signed in as <strong className="text-amber-400">{user?.name}</strong>
            </div>
          </div>
        </header>

        {/* Page children */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
