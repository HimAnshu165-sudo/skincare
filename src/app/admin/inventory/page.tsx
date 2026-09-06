'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Save,
  Package,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface InventoryItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  inStock: boolean;
  volume: string;
  isLowStock: boolean;
  isOutOfStock: boolean;
  imageUrl: string;
  updatedAt: string;
}

interface InventorySummary {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  threshold: number;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, LOW_STOCK, OUT_OF_STOCK, IN_STOCK
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        filter,
      });
      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInventory(data.inventory);
        setSummary(data.summary);
        // Initialize stock edits
        const stockMap: Record<string, number> = {};
        data.inventory.forEach((i: InventoryItem) => {
          stockMap[i.id] = i.stockQuantity;
        });
        setEditingStock(stockMap);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleStockChange = (id: string, delta: number) => {
    setEditingStock((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  const handleManualInput = (id: string, value: string) => {
    const parsed = parseInt(value, 10);
    setEditingStock((prev) => ({
      ...prev,
      [id]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const handleSaveStock = async (id: string) => {
    const qty = editingStock[id];
    if (qty === undefined) return;

    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          stockQuantity: qty,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchInventory();
      } else {
        alert(data.message || 'Failed to update stock');
      }
    } catch (err) {
      console.error('Stock update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262422] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-normal">
            Inventory & Warehouse Stock
          </h1>
          <p className="text-xs text-[#8C857B] mt-1">
            Real-time stock quantities, safety thresholds, and decrement tracking in PostgreSQL
          </p>
        </div>

        <button
          onClick={() => fetchInventory()}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1A1918] hover:bg-[#252422] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#171614] border border-[#262422] rounded-sm p-4 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold">Total Catalog SKUs</span>
          <div className="font-serif text-2xl text-[#FAF8F5] font-bold">{summary?.totalProducts || 0}</div>
        </div>

        <div className="bg-[#171614] border border-[#262422] rounded-sm p-4 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold">Well-Stocked SKUs</span>
          <div className="font-serif text-2xl text-emerald-400 font-bold">{summary?.inStockCount || 0}</div>
        </div>

        <div className="bg-[#171614] border border-[#262422] rounded-sm p-4 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold">Low Stock Warnings (&le; 20)</span>
          <div className="font-serif text-2xl text-amber-400 font-bold">{summary?.lowStockCount || 0}</div>
        </div>

        <div className="bg-[#171614] border border-[#262422] rounded-sm p-4 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold">Out of Stock (0)</span>
          <div className="font-serif text-2xl text-red-400 font-bold">{summary?.outOfStockCount || 0}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8C857B]" />
            <input
              type="text"
              placeholder="Search by Product Name, SKU code, Category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#201F1D] border border-[#2E2C29] pl-9 pr-3 py-2 text-xs text-[#FAF8F5] placeholder:text-[#8C857B] rounded-xs focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs focus:outline-none focus:border-amber-400/50"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="LOW_STOCK">Low Stock Alert (&le; 20 units)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0 units)</option>
              <option value="IN_STOCK">Healthy Stock (&gt; 20 units)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p>Loading inventory from database...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <Layers className="w-8 h-8 text-[#57534E] mx-auto" />
            <p className="text-sm font-medium text-[#FAF8F5]">No matching inventory records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F1E1B] text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold border-b border-[#262422]">
                <tr>
                  <th className="p-4">Product & SKU</th>
                  <th className="p-4">Category & Volume</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Inventory Status</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4 text-right">Quick Stock Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262422]">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1E1D1B] transition-colors">
                    {/* Product & SKU */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#201F1D] border border-[#2E2C29] rounded-sm overflow-hidden shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-[#FAF8F5]">{item.name}</div>
                          <div className="text-[10px] text-[#8C857B] font-mono">{item.sku}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <div className="text-[#FAF8F5] font-medium">{item.category}</div>
                      <div className="text-[10px] text-[#8C857B]">{item.volume}</div>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="font-serif font-bold text-sm text-[#FAF8F5]">
                        {formatPrice(item.price)}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {item.isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-red-500/20 text-red-400 border border-red-500/30">
                          <XCircle className="w-3 h-3" /> OUT OF STOCK
                        </span>
                      ) : item.isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> LOW STOCK (&le; 20)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> IN STOCK
                        </span>
                      )}
                    </td>

                    {/* Stock Quantity Display */}
                    <td className="p-4">
                      <div className="font-mono text-base font-bold text-[#FAF8F5]">
                        {item.stockQuantity} <span className="text-[10px] font-normal text-[#8C857B]">units</span>
                      </div>
                    </td>

                    {/* Inline Stock Adjustment Controls */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-[#201F1D] border border-[#2E2C29] p-1 rounded-xs">
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.id, -10)}
                          className="px-1.5 py-1 bg-[#282724] hover:bg-[#33312D] text-[#FAF8F5] rounded-xs text-[10px] font-mono"
                          title="-10 units"
                        >
                          -10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.id, -1)}
                          className="p-1 bg-[#282724] hover:bg-[#33312D] text-[#FAF8F5] rounded-xs"
                          title="-1 unit"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={editingStock[item.id] ?? item.stockQuantity}
                          onChange={(e) => handleManualInput(item.id, e.target.value)}
                          className="w-14 bg-[#141311] border border-[#2E2C29] py-1 px-1.5 text-center font-mono font-bold text-xs text-amber-400 rounded-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.id, 1)}
                          className="p-1 bg-[#282724] hover:bg-[#33312D] text-[#FAF8F5] rounded-xs"
                          title="+1 unit"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.id, 10)}
                          className="px-1.5 py-1 bg-[#282724] hover:bg-[#33312D] text-[#FAF8F5] rounded-xs text-[10px] font-mono"
                          title="+10 units"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === item.id || editingStock[item.id] === item.stockQuantity}
                          onClick={() => handleSaveStock(item.id)}
                          className={`ml-1 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-xs transition-colors ${
                            editingStock[item.id] !== item.stockQuantity
                              ? 'bg-amber-500 text-[#11100F] hover:bg-amber-400'
                              : 'bg-[#282724] text-[#8C857B] cursor-not-allowed'
                          }`}
                        >
                          {updatingId === item.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
