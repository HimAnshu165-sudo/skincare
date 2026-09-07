'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProcessing } from '@/context/ProcessingContext';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Home,
  Briefcase
} from 'lucide-react';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  isDefault: boolean;
}

export default function AccountAddressesPage() {
  const { user, loading } = useAuth();
  const { showProcessing, hideProcessing } = useProcessing();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressType, setAddressType] = useState('HOME');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account/addresses');
    }
  }, [user, loading, router]);

  const loadAddresses = () => {
    fetch('/api/addresses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAddresses(data.addresses);
        }
      })
      .catch(console.error)
      .finally(() => setFetchLoading(false));
  };

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const resetForm = () => {
    setFullName(user?.name || '');
    setPhone(user?.phone || '');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setAddressType('HOME');
    setIsDefault(false);
    setEditingId(null);
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setAddressType(addr.addressType);
    setIsDefault(addr.isDefault);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanedPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setSaving(true);
    showProcessing('Saving delivery address...', 'Updating your address book in database...');

    const payload = {
      fullName,
      phone: cleanedPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      addressType,
      isDefault,
    };

    try {
      const url = editingId ? `/api/addresses/${editingId}` : '/api/addresses';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        loadAddresses();
      } else {
        setError(data.message || 'Failed to save address.');
      }
    } catch {
      setError('Network error saving address.');
    } finally {
      hideProcessing();
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        loadAddresses();
      }
    } catch (err) {
      console.error('Set default error:', err);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-foreground/60 hover:text-brand-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-light text-brand-charcoal">
            Saved Addresses
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60">
            Manage your delivery destinations for rapid checkout and complimentary domestic shipping.
          </p>
        </div>

        {/* Address Grid */}
        {fetchLoading ? (
          <div className="py-16 bg-surface-elevated border border-border-subtle rounded-sm text-center flex items-center justify-center gap-2 text-xs text-foreground/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading saved addresses...</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className="py-16 bg-surface-elevated border border-border-subtle rounded-sm text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-foreground/40">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-brand-charcoal font-medium">No Saved Addresses</h3>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto">
              Save your primary residence or workplace for accelerated single-click checkout.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Address</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-surface-elevated border rounded-sm p-6 space-y-4 transition-all ${addr.isDefault ? 'border-brand-charcoal shadow-[0_4px_16px_rgba(0,0,0,0.04)]' : 'border-border-subtle hover:border-brand-charcoal/30'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {addr.addressType === 'WORK' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-brand-sand/40 text-brand-charcoal">
                        <Briefcase className="w-3 h-3" />
                        <span>Work</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-brand-sand/40 text-brand-charcoal">
                        <Home className="w-3 h-3" />
                        <span>Home</span>
                      </span>
                    )}
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-1 text-foreground/50 hover:text-brand-charcoal transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-1 text-foreground/50 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-foreground/80 space-y-1 leading-relaxed">
                  <p className="font-semibold text-brand-charcoal text-sm">{addr.fullName}</p>
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} — {addr.postalCode}
                  </p>
                  <p className="text-foreground/50 pt-1">Phone: {addr.phone}</p>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] font-medium text-brand-charcoal hover:underline pt-2 inline-flex items-center gap-1"
                  >
                    <span>Set as Default Address</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal for Add / Edit */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-elevated border border-border-subtle max-w-lg w-full rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <h3 className="font-serif text-xl font-medium text-brand-charcoal">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-foreground/50 hover:text-brand-charcoal text-sm"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="House / Flat No., Street"
                    className="w-full px-3 py-2 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apartment, Landmark"
                    className="w-full px-3 py-2 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/70">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="6 digits"
                      className="w-full px-3 py-2 bg-surface-base border border-border-strong rounded-xs focus:outline-none focus:border-brand-charcoal"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="addressType"
                      value="HOME"
                      checked={addressType === 'HOME'}
                      onChange={() => setAddressType('HOME')}
                      className="accent-brand-charcoal"
                    />
                    <span>Home</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="addressType"
                      value="WORK"
                      checked={addressType === 'WORK'}
                      onChange={() => setAddressType('WORK')}
                      className="accent-brand-charcoal"
                    />
                    <span>Work</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="accent-brand-charcoal rounded-xs"
                    />
                    <span>Set as default delivery address</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 border border-border-strong rounded-xs text-xs font-medium hover:bg-surface-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-brand-charcoal text-white rounded-xs text-xs uppercase tracking-editorial font-medium hover:bg-black transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
