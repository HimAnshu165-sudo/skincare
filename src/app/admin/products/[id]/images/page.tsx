'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Upload,
  ArrowLeft,
  Trash2,
  Star,
  Sparkles,
  MoveUp,
  MoveDown,
  RefreshCw,
  Check,
  Edit2
} from 'lucide-react';

interface ProductImageItem {
  id: string;
  url: string;
  pathname: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductDetails {
  id: string;
  name: string;
  slug: string;
}

export default function ProductImagesManagerPage() {
  const routeParams = useParams();
  const productId = (routeParams?.id as string) || '';
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProductImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`);
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (e) {
      console.error('Error fetching images:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductImages();
  }, [productId]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      formData.append('productId', productId);
      formData.append('productSlug', product?.slug || 'general');
      formData.append('alt', `${product?.name || 'Product'} photo ${images.length + i + 1}`);

      try {
        await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
      } catch (e) {
        console.error('Failed to upload product image', e);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchProductImages();
  };

  const setPrimary = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, isPrimary: true }),
      });
      if (res.ok) {
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            isPrimary: img.id === imageId,
          }))
        );
      }
    } catch (e) {
      console.error('Failed to set primary image', e);
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setImages(newImages);

    // Persist reorder to backend
    try {
      await fetch(`/api/admin/products/${productId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reorderedIds: newImages.map((img) => img.id),
        }),
      });
    } catch (e) {
      console.error('Failed to save reorder', e);
    }
  };

  const handleSaveAlt = async (imageId: string) => {
    try {
      await fetch(`/api/admin/products/${productId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, alt: editAlt }),
      });
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, alt: editAlt } : img))
      );
      setEditingId(null);
    } catch (e) {
      console.error('Failed to update alt text', e);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this product image from Vercel Blob?')) return;
    try {
      const res = await fetch(`/api/admin/media?id=${imageId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch (e) {
      console.error('Failed to delete image', e);
    }
  };

  return (
    <div className="bg-surface-base min-h-screen py-10 sm:py-16 border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <Link
              href="/admin/media"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-brand-mineral hover:text-brand-charcoal mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Media Library</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
              Product Image Gallery Manager
            </h1>
            <p className="text-xs text-brand-mineral mt-1">
              Manage multi-angle packshots, macro texture swatches, and primary thumbnails stored on Vercel Blob.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-brand-charcoal text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-brand-mineral transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        {uploading && (
          <div className="p-4 bg-brand-sand/40 border border-brand-sand text-brand-charcoal text-xs rounded-xs flex items-center gap-3 animate-pulse">
            <Sparkles className="w-4 h-4 text-brand-amber flex-shrink-0" />
            <span>Uploading images to Vercel Blob & syncing product gallery...</span>
          </div>
        )}

        {/* Gallery List */}
        <div className="bg-surface-elevated rounded-sm border border-border-subtle p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-xl text-brand-charcoal font-medium border-b border-border-subtle pb-3">
            Active Gallery Images ({images.length})
          </h2>

          {loading ? (
            <div className="text-center py-12 text-xs text-brand-mineral">
              Loading product gallery from database...
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-xs text-brand-mineral">No images assigned to this product yet.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-block text-xs uppercase tracking-wider font-semibold text-brand-amber hover:underline"
              >
                + Upload First Image
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-surface-muted rounded-xs border border-border-subtle hover:border-brand-charcoal/30 transition-all"
                >
                  {/* Position number */}
                  <span className="font-serif text-base font-semibold text-brand-mineral w-6 text-center">
                    {idx + 1}
                  </span>

                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 bg-surface-elevated rounded-xs overflow-hidden flex-shrink-0 border border-border-subtle">
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  {/* Details / Alt Edit */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-mono font-semibold text-brand-charcoal truncate">
                      {img.pathname}
                    </p>

                    {editingId === img.id ? (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={editAlt}
                          onChange={(e) => setEditAlt(e.target.value)}
                          className="flex-1 bg-surface-elevated border border-border-strong px-2.5 py-1 text-xs text-brand-charcoal focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveAlt(img.id)}
                          className="bg-brand-charcoal text-white text-[10px] uppercase font-semibold px-3 py-1 rounded-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-brand-mineral text-xs px-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-mineral truncate">
                          Alt: {img.alt || 'No alt description'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(img.id);
                            setEditAlt(img.alt);
                          }}
                          className="text-stone-400 hover:text-brand-charcoal p-0.5"
                          title="Edit alt text"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    {/* Primary Button */}
                    <button
                      onClick={() => setPrimary(img.id)}
                      className={`px-3 py-1.5 rounded-xs text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        img.isPrimary
                          ? 'bg-brand-amber text-brand-charcoal shadow-xs'
                          : 'bg-surface-elevated text-brand-mineral hover:text-brand-charcoal border border-border-subtle'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${img.isPrimary ? 'fill-current' : ''}`} />
                      <span>{img.isPrimary ? 'Primary Packshot' : 'Set as Primary'}</span>
                    </button>

                    {/* Order up / down */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 bg-surface-elevated hover:bg-border-strong rounded-xs text-brand-charcoal disabled:opacity-30"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveOrder(idx, 'down')}
                        disabled={idx === images.length - 1}
                        className="p-1 bg-surface-elevated hover:bg-border-strong rounded-xs text-brand-charcoal disabled:opacity-30"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="text-stone-400 hover:text-red-700 p-2 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
