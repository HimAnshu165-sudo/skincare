'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PaymentItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  orderStatus: string;
  createdAt: string;
}

interface PaymentSummary {
  totalPayments: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [method, setMethod] = useState('ALL');
  const [page, setPage] = useState(1);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        status,
        method,
      });
      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
        setSummary(data.summary);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, method]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262422] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-normal">
            Payments Ledger & Gateway Logs
          </h1>
          <p className="text-xs text-[#8C857B] mt-1">
            Reconciliation records for Razorpay Online Gateway and Cash on Delivery in PostgreSQL
          </p>
        </div>

        <button
          onClick={() => fetchPayments()}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1A1918] hover:bg-[#252422] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#171614] border border-[#262422] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold">Total Transactions</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#FAF8F5]">
            {summary?.totalPayments || 0}
          </div>
        </div>

        <div className="bg-[#171614] border border-[#262422] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold">Settled Revenue (Paid)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-serif text-3xl font-bold text-emerald-400">
            {formatPrice(summary?.totalPaidAmount || 0)}
          </div>
        </div>

        <div className="bg-[#171614] border border-[#262422] rounded-sm p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8C857B] font-semibold">Pending / In-Transit COD</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-serif text-3xl font-bold text-amber-400">
            {formatPrice(summary?.totalPendingAmount || 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8C857B]" />
            <input
              type="text"
              placeholder="Search by Razorpay ID, Order #, Name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#201F1D] border border-[#2E2C29] pl-9 pr-3 py-2 text-xs text-[#FAF8F5] placeholder:text-[#8C857B] rounded-xs focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs focus:outline-none focus:border-amber-400/50"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          <div>
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs focus:outline-none focus:border-amber-400/50"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="RAZORPAY">Razorpay / Online</option>
              <option value="COD">Cash on Delivery (COD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p>Loading payments from PostgreSQL...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <CreditCard className="w-8 h-8 text-[#57534E] mx-auto" />
            <p className="text-sm font-medium text-[#FAF8F5]">No payment transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F1E1B] text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold border-b border-[#262422]">
                <tr>
                  <th className="p-4">Transaction Date</th>
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method & Status</th>
                  <th className="p-4">Gateway Reference IDs</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262422]">
                {payments.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-[#1E1D1B] transition-colors">
                    <td className="p-4 font-mono text-[11px] text-[#A8A196]">
                      {new Date(pmt.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${pmt.orderId}`}
                        className="font-mono font-bold text-amber-400 hover:underline"
                      >
                        #{pmt.orderNumber}
                      </Link>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-[#FAF8F5]">{pmt.customerName}</div>
                      <div className="text-[10px] text-[#8C857B]">{pmt.customerEmail}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-serif font-bold text-sm text-[#FAF8F5]">
                        {formatPrice(pmt.amount)}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block font-mono text-[9px] font-bold px-2 py-0.5 rounded-xs ${
                          pmt.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : pmt.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {pmt.method} • {pmt.status}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[10px] text-[#8C857B] space-y-0.5">
                      {pmt.razorpayOrderId && <div>Order: {pmt.razorpayOrderId}</div>}
                      {pmt.razorpayPaymentId && <div>Pay: {pmt.razorpayPaymentId}</div>}
                      {!pmt.razorpayOrderId && !pmt.razorpayPaymentId && (
                        <div className="italic text-[#57534E]">Direct COD Transaction</div>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${pmt.orderId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#201F1D] hover:bg-[#2A2825] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-colors"
                      >
                        <span>View Order</span>
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                      </Link>
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
            Showing <strong className="text-[#FAF8F5]">{payments.length}</strong> of{' '}
            <strong className="text-[#FAF8F5]">{pagination.total}</strong> payment entries
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
    </div>
  );
}
