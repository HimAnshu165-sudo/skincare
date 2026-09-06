'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  UploadCloud,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductImage {
  id: string;
  url: string;
  pathname: string;
  alt: string;
  isPrimary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  inStock: boolean;
  volume: string;
  category: string;
  isFeatured: boolean;
  isUpcoming: boolean;
  primaryImage: string;
  productImages: ProductImage[];
  totalOrdersCount: number;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [inStockFilter, setInStockFilter] = useState('ALL');

  // Modal / Drawer state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    tagline: '',
    description: '',
    price: '',
    mrp: '',
    stockQuantity: '100',
    volume: '50ml / 1.7 fl. oz.',
    category: 'Sunscreens',
    spfRating: 'SPF 50+ PA++++',
    finish: 'Invisible Dewy-Matte',
    skinType: 'All Skin Types • Non-Comedogenic',
    isFeatured: false,
    isUpcoming: false,
  });

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        category,
        ...(inStockFilter === 'IN_STOCK' ? { inStock: 'true' } : {}),
        ...(inStockFilter === 'OUT_OF_STOCK' ? { inStock: 'false' } : {}),
      });
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, inStockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      sku: '',
      tagline: '',
      description: '',
      price: '',
      mrp: '',
      stockQuantity: '100',
      volume: '50ml / 1.7 fl. oz.',
      category: 'Sunscreens',
      spfRating: 'SPF 50+ PA++++',
      finish: 'Invisible Dewy-Matte',
      skinType: 'All Skin Types • Non-Comedogenic',
      isFeatured: false,
      isUpcoming: false,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      tagline: product.tagline || '',
      description: product.description || '',
      price: product.price.toString(),
      mrp: product.mrp.toString(),
      stockQuantity: product.stockQuantity.toString(),
      volume: product.volume || '50ml',
      category: product.category || 'Sunscreens',
      spfRating: 'SPF 50+ PA++++',
      finish: 'Invisible Dewy-Matte',
      skinType: 'All Skin Types',
      isFeatured: product.isFeatured,
      isUpcoming: product.isUpcoming,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        fetchProducts();
      } else {
        alert(data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete / archive "${product.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchProducts();
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleImageUpload = async (productId: string, productSlug: string) => {
    if (!selectedFile) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('productId', productId);
      fd.append('productSlug', productSlug);
      fd.append('folder', 'products');
      fd.append('isPrimary', 'true');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        alert('Image uploaded to Vercel Blob & attached to product!');
        setSelectedFile(null);
        fetchProducts();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262422] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-normal">
            Product Catalog
          </h1>
          <p className="text-xs text-[#8C857B] mt-1">
            Database-backed product items, pricing, inventory stock, and Vercel Blob imagery
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#1A1918] hover:bg-[#252422] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#11100F] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8C857B]" />
            <input
              type="text"
              placeholder="Search products by Name, SKU, Category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#201F1D] border border-[#2E2C29] pl-9 pr-3 py-2 text-xs text-[#FAF8F5] placeholder:text-[#8C857B] rounded-xs focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs"
            >
              <option value="ALL">All Categories</option>
              <option value="Sunscreens">Sunscreens</option>
              <option value="Moisturizers">Moisturizers</option>
              <option value="Cleansers">Cleansers</option>
              <option value="Sets">Sets</option>
            </select>
          </div>

          <div>
            <select
              value={inStockFilter}
              onChange={(e) => setInStockFilter(e.target.value)}
              className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-xs text-[#FAF8F5] rounded-xs"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock (Available)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-[#171614] border border-[#262422] rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p>Loading products from PostgreSQL...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#8C857B] space-y-2">
            <Sparkles className="w-8 h-8 text-[#57534E] mx-auto" />
            <p className="text-sm font-medium text-[#FAF8F5]">No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F1E1B] text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold border-b border-[#262422]">
                <tr>
                  <th className="p-4">Product Image & Name</th>
                  <th className="p-4">SKU & Category</th>
                  <th className="p-4">Price & MRP</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262422]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1E1D1B] transition-colors">
                    {/* Image & Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#201F1D] border border-[#2E2C29] rounded-sm overflow-hidden shrink-0">
                          <img
                            src={p.primaryImage}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="font-medium text-[#FAF8F5] hover:text-amber-400 transition-colors flex items-center gap-1"
                          >
                            <span>{p.name}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-[#8C857B]" />
                          </a>
                          <div className="text-[10px] text-[#8C857B]">{p.volume}</div>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Category */}
                    <td className="p-4">
                      <div className="font-mono font-semibold text-[#FAF8F5]">{p.sku}</div>
                      <div className="text-[10px] text-[#8C857B]">{p.category}</div>
                    </td>

                    {/* Pricing */}
                    <td className="p-4">
                      <div className="font-serif font-bold text-sm text-[#FAF8F5]">
                        {formatPrice(p.price)}
                      </div>
                      <div className="text-[10px] text-[#8C857B] line-through">
                        {formatPrice(p.mrp)}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <span
                        className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded-xs ${
                          p.stockQuantity <= 0
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : p.stockQuantity <= 20
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {p.stockQuantity} units
                      </span>
                    </td>

                    {/* Active/Status */}
                    <td className="p-4">
                      {p.inStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-400">
                          <XCircle className="w-3 h-3" /> Out of Stock
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="block text-[9px] uppercase font-mono text-amber-400 mt-0.5">
                          Featured
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/admin/products/${p.id}/images`}
                        className="p-1.5 bg-[#201F1D] hover:bg-[#2A2825] border border-[#2E2C29] text-[#FAF8F5] rounded-xs inline-block"
                        title="Manage Images"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      </Link>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-[#201F1D] hover:bg-[#2A2825] border border-[#2E2C29] text-[#FAF8F5] rounded-xs"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 bg-[#201F1D] hover:bg-red-950/40 border border-[#2E2C29] hover:border-red-500/30 text-[#8C857B] hover:text-red-400 rounded-xs"
                        title="Delete/Archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#171614] border border-[#262422] rounded-sm max-w-2xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262422] pb-3">
              <h2 className="font-serif text-xl text-[#FAF8F5]">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs text-[#8C857B] hover:text-[#FAF8F5]"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                    Selling Price (INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                    MRP (INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs"
                  >
                    <option value="Sunscreens">Sunscreens</option>
                    <option value="Moisturizers">Moisturizers</option>
                    <option value="Cleansers">Cleansers</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                    Volume / Size
                  </label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    placeholder="50ml / 1.7 fl. oz."
                    className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Invisible Daily Mineral Shield"
                  className="w-full bg-[#201F1D] border border-[#2E2C29] px-3 py-2 text-[#FAF8F5] rounded-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#201F1D] border border-[#2E2C29] p-3 text-[#FAF8F5] rounded-xs"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span className="text-[#FAF8F5]">Feature on Home Hero</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isUpcoming}
                    onChange={(e) => setFormData({ ...formData, isUpcoming: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span className="text-[#FAF8F5]">Upcoming / Coming Soon</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#262422]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#201F1D] border border-[#2E2C29] text-xs font-semibold text-[#FAF8F5] rounded-xs hover:bg-[#2A2825]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-amber-500 text-[#11100F] text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-amber-400"
                >
                  {isSaving ? 'Writing to PostgreSQL...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
