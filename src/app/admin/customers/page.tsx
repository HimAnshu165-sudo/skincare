'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  ordersCount: number;
  addressesCount: number;
  totalSpent: number;
}

interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CustomerOrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  itemsCount: number;
}

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  addresses: CustomerAddress[];
  orders: CustomerOrderDetail[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Detail modal state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search,
      });
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCustomerDetail = async (id: string) => {
    setSelectedCustomerId(id);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();
      if (data.success) {
        setCustomerDetail(data.customer);
      }
    } catch (err) {
      console.error('Error loading customer detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262422] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-normal">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-[#8C857B] mt-1">
            Real registered customer accounts, lifetime order history, and address books in PostgreSQL
          </p>
        </div>

        <button
          onClick={() => fetchCustomers()}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1A1918] hover:bg-[#252422] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Customers</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm p-4">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8C857B]" />
          <input
            type="text"
            placeholder="Search by Customer Name, Email, or Phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#201F1D] border border-[#2E2C29] pl-9 pr-3 py-2 text-xs text-[#FAF8F5] placeholder:text-[#8C857B] rounded-xs focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p>Loading customers from database...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <Users className="w-8 h-8 text-[#57534E] mx-auto" />
            <p className="text-sm font-medium text-[#FAF8F5]">No customer accounts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F1E1B] text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold border-b border-[#262422]">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email & Phone</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262422]">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#1E1D1B] transition-colors">
                    {/* Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-xs shrink-0">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#FAF8F5]">{cust.name}</div>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-xs bg-[#252422] text-[#8C857B]">
                            {cust.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="p-4">
                      <div className="text-[#FAF8F5]">{cust.email}</div>
                      <div className="text-[10px] text-[#8C857B] font-mono">{cust.phone || 'No phone'}</div>
                    </td>

                    {/* Registration Date */}
                    <td className="p-4 text-[#A8A196]">
                      {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Orders Count */}
                    <td className="p-4">
                      <span className="font-mono font-bold text-[#FAF8F5]">
                        {cust.ordersCount} {cust.ordersCount === 1 ? 'order' : 'orders'}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="p-4">
                      <div className="font-serif font-bold text-sm text-amber-400">
                        {formatPrice(cust.totalSpent)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openCustomerDetail(cust.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#201F1D] hover:bg-[#2A2825] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Profile & Orders</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 bg-[#1F1E1B] border-t border-[#262422] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C857B]">
          <div>
            Showing <strong className="text-[#FAF8F5]">{customers.length}</strong> of{' '}
            <strong className="text-[#FAF8F5]">{pagination.total}</strong> registered customers
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-[#201F1D] disabled:opacity-40 border border-[#2E2C29] rounded-xs text-[#FAF8F5] hover:bg-[#2A2825]"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-[#FAF8F5]">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 bg-[#201F1D] disabled:opacity-40 border border-[#2E2C29] rounded-xs text-[#FAF8F5] hover:bg-[#2A2825]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#171614] border border-[#262422] rounded-sm max-w-2xl w-full p-6 space-y-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262422] pb-4">
              <div>
                <h2 className="font-serif text-xl text-[#FAF8F5]">
                  Customer Profile & Purchase Ledger
                </h2>
                <p className="text-xs text-[#8C857B]">PostgreSQL customer records (passwords safely masked)</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setCustomerDetail(null);
                }}
                className="text-[#8C857B] hover:text-[#FAF8F5] text-xs p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail || !customerDetail ? (
              <div className="p-12 text-center text-xs text-[#8C857B]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                Loading customer profile...
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Profile Overview */}
                <div className="bg-[#201F1D] border border-[#2E2C29] p-4 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block">
                      Name & Account
                    </span>
                    <div className="font-semibold text-sm text-[#FAF8F5] mt-0.5">{customerDetail.name}</div>
                    <div className="text-[11px] text-[#8C857B]">{customerDetail.email}</div>
                    <div className="text-[11px] text-[#8C857B] font-mono">{customerDetail.phone || 'No phone'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block">
                      Total Lifetime Orders
                    </span>
                    <div className="font-serif text-2xl font-bold text-[#FAF8F5] mt-0.5">
                      {customerDetail.totalOrders}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block">
                      Lifetime Spend
                    </span>
                    <div className="font-serif text-2xl font-bold text-amber-400 mt-0.5">
                      {formatPrice(customerDetail.totalSpent)}
                    </div>
                  </div>
                </div>

                {/* Saved Delivery Addresses */}
                <div className="space-y-2">
                  <h3 className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Saved Delivery Addresses ({customerDetail.addresses.length})</span>
                  </h3>
                  {customerDetail.addresses.length === 0 ? (
                    <p className="text-[#8C857B] italic">No saved addresses on file.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {customerDetail.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="bg-[#201F1D] border border-[#2E2C29] p-3 rounded-sm space-y-1"
                        >
                          <div className="font-semibold text-[#FAF8F5]">{addr.fullName}</div>
                          <div className="text-[#A8A196]">{addr.addressLine1}</div>
                          {addr.addressLine2 && <div className="text-[#A8A196]">{addr.addressLine2}</div>}
                          <div className="text-[#8C857B]">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </div>
                          <div className="text-[10px] text-[#8C857B] font-mono">Phone: {addr.phone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orders History List */}
                <div className="space-y-2">
                  <h3 className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Order History ({customerDetail.orders.length})</span>
                  </h3>

                  {customerDetail.orders.length === 0 ? (
                    <p className="text-[#8C857B] italic">No orders recorded for this customer.</p>
                  ) : (
                    <div className="border border-[#262422] rounded-sm divide-y divide-[#262422] max-h-60 overflow-y-auto">
                      {customerDetail.orders.map((ord) => (
                        <div key={ord.id} className="p-3 bg-[#171614] flex items-center justify-between gap-3 hover:bg-[#1E1D1B]">
                          <div>
                            <Link
                              href={`/admin/orders/${ord.id}`}
                              className="font-mono font-bold text-amber-400 hover:underline"
                            >
                              #{ord.orderNumber}
                            </Link>
                            <div className="text-[10px] text-[#8C857B]">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })} • {ord.itemsCount} items
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-xs bg-[#201F1D] text-[#FAF8F5] border border-[#2E2C29]">
                              {ord.orderStatus}
                            </span>
                            <div className="font-serif font-bold text-xs text-[#FAF8F5]">
                              {formatPrice(ord.total)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
