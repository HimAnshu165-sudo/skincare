'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  Search,
  Folder,
  RefreshCw,
  Plus,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Shield,
  Filter
} from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  pathname: string;
  alt: string;
  isPrimary: boolean;
  size?: number | null;
  contentType?: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload Form State
  const [targetFolder, setTargetFolder] = useState('products');
  const [productSlug, setProductSlug] = useState('silk-air-fluid-sunscreen-spf50');
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        setMedia(data.images);
      }
    } catch (e) {
      console.error('Error fetching media:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}...`);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', targetFolder);
      if (targetFolder === 'products' && productSlug) {
        formData.append('productSlug', productSlug);
      }
      if (altText) {
        formData.append('alt', altText);
      }

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
        }
      } catch (e) {
        console.error('Error uploading file:', file.name, e);
      }
    }

    setUploading(false);
    setUploadProgress(null);
    setAltText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchMedia();
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to delete ${item.pathname}? This will remove it from Vercel Blob and database.`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/admin/media?id=${item.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMedia((prev) => prev.filter((m) => m.id !== item.id));
      }
    } catch (e) {
      console.error('Failed to delete image:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter((item) => {
    const matchesFolder =
      selectedFolder === 'ALL' || item.pathname.startsWith(selectedFolder);
    const matchesSearch =
      !searchTerm ||
      item.pathname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alt?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="bg-surface-base min-h-screen py-10 sm:py-16 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-brand-mineral hover:text-brand-charcoal mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Dashboard</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal font-normal">
              Vercel Blob Media Library
            </h1>
            <p className="text-xs text-brand-mineral mt-1">
              Store: <strong className="font-semibold text-brand-charcoal">velyra-media</strong> (Public CDN CDN distribution)
            </p>
          </div>

          <button
            onClick={fetchMedia}
            className="inline-flex items-center gap-2 bg-surface-elevated border border-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-surface-muted transition-colors text-brand-charcoal self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-mineral" />
            <span>Refresh Storage</span>
          </button>
        </div>

        {/* Upload Drawer Card */}
        <div className="bg-surface-elevated rounded-sm border border-border-subtle p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2 font-serif text-xl text-brand-charcoal font-medium border-b border-border-subtle pb-3">
            <Upload className="w-5 h-5 text-brand-amber" />
            <span>Upload New Skincare Assets to Blob</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="uppercase tracking-wider font-semibold text-brand-mineral">
                Target Folder *
              </label>
              <select
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                className="w-full bg-surface-muted border border-border-subtle p-2.5 rounded-xs text-xs font-medium text-brand-charcoal focus:outline-none"
              >
                <option value="products">products/</option>
                <option value="brand">brand/</option>
                <option value="homepage">homepage/</option>
                <option value="editorial">editorial/</option>
                <option value="icons">icons/</option>
              </select>
            </div>

            {targetFolder === 'products' && (
              <div className="space-y-1">
                <label className="uppercase tracking-wider font-semibold text-brand-mineral">
                  Product Slug (Subdirectory)
                </label>
                <select
                  value={productSlug}
                  onChange={(e) => setProductSlug(e.target.value)}
                  className="w-full bg-surface-muted border border-border-subtle p-2.5 rounded-xs text-xs font-medium text-brand-charcoal focus:outline-none"
                >
                  <option value="silk-air-fluid-sunscreen-spf50">silk-air-fluid-sunscreen-spf50</option>
                  <option value="ceramide-barrier-cushion-cream">ceramide-barrier-cushion-cream</option>
                  <option value="amino-jelly-balancing-cleanser">amino-jelly-balancing-cleanser</option>
                  <option value="the-daily-defense-duo">the-daily-defense-duo</option>
                  <option value="general">general</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="uppercase tracking-wider font-semibold text-brand-mineral">
                SEO Alt Description
              </label>
              <input
                type="text"
                placeholder="e.g. VELYRA Silk-Air Sunscreen Bottle Shot"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full bg-surface-muted border border-border-subtle p-2.5 rounded-xs text-xs text-brand-charcoal placeholder:text-brand-mineral focus:outline-none"
              />
            </div>
          </div>

          {/* Drag and drop / file input box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border-strong hover:border-brand-charcoal p-8 rounded-sm text-center cursor-pointer bg-surface-muted/60 transition-colors space-y-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <div className="w-12 h-12 rounded-full bg-surface-elevated mx-auto flex items-center justify-center text-brand-amber shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-serif text-base text-brand-charcoal font-medium">
              Click to browse or drag and drop images
            </p>
            <p className="text-[11px] text-brand-mineral">
              WebP, AVIF, PNG, JPEG, SVG up to 12MB each. Images will be automatically routed to <code className="text-brand-charcoal font-semibold">{targetFolder}/{targetFolder === 'products' ? `${productSlug}/` : ''}</code>
            </p>
          </div>

          {uploading && (
            <div className="p-4 bg-brand-sand/40 border border-brand-sand text-brand-charcoal text-xs rounded-xs flex items-center gap-3 animate-pulse">
              <Sparkles className="w-4 h-4 text-brand-amber flex-shrink-0" />
              <span>{uploadProgress || 'Uploading files to Vercel Blob...'}</span>
            </div>
          )}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-surface-elevated p-4 rounded-sm border border-border-subtle">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'products', 'brand', 'homepage', 'editorial', 'icons'].map((folder) => (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`px-3 py-1.5 rounded-xs text-[11px] font-semibold uppercase tracking-wider transition-all ${
                  selectedFolder === folder
                    ? 'bg-brand-charcoal text-white shadow-xs'
                    : 'bg-surface-muted text-brand-mineral hover:text-brand-charcoal'
                }`}
              >
                {folder}/
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-brand-mineral" />
            <input
              type="text"
              placeholder="Search filename or alt text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-muted border border-border-subtle pl-9 pr-3 py-2 text-xs text-brand-charcoal placeholder:text-brand-mineral rounded-xs focus:outline-none focus:border-brand-charcoal"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="bg-surface-elevated rounded-sm border border-border-subtle p-6 shadow-sm">
          {loading ? (
            <div className="text-center py-16 text-xs text-brand-mineral">
              Loading Vercel Blob assets...
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <ImageIcon className="w-10 h-10 text-brand-mineral mx-auto" />
              <h3 className="font-serif text-lg text-brand-charcoal">No media assets found in this folder.</h3>
              <p className="text-xs text-brand-mineral">Upload brand imagery or product photography above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-surface-muted rounded-xs border border-border-subtle hover:border-brand-charcoal/40 overflow-hidden flex flex-col justify-between transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full bg-surface-muted p-2 flex items-center justify-center overflow-hidden">
                    <Image
                      src={item.url}
                      alt={item.alt || item.pathname}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-contain p-2"
                    />
                    {item.isPrimary && (
                      <span className="absolute top-2 left-2 bg-brand-amber text-brand-charcoal text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-xs">
                        Primary
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-3 bg-surface-elevated border-t border-border-subtle space-y-1">
                    <p className="text-[11px] font-mono font-semibold text-brand-charcoal truncate" title={item.pathname}>
                      {item.pathname}
                    </p>
                    <p className="text-[10px] text-brand-mineral truncate" title={item.alt}>
                      {item.alt || 'No alt text'}
                    </p>

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-between border-t border-border-subtle/60">
                      <button
                        onClick={() => copyUrl(item.url, item.id)}
                        className="text-[10px] uppercase font-semibold text-brand-mineral hover:text-brand-charcoal flex items-center gap-1"
                        title="Copy Public Blob CDN URL"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="text-stone-400 hover:text-red-700 p-1 transition-colors"
                        title="Delete from Blob & Database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
