import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductAccordions } from '@/components/product/ProductAccordions';
import { StickyPurchaseBar } from '@/components/product/StickyPurchaseBar';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { getStaticFallbackProducts } from '@/lib/sunscreenData';

interface PDPProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PDPProps): Promise<Metadata> {
  const { slug } = await params;
  let product: any = null;
  try {
    const dbPromise = prisma.product.findUnique({ where: { slug } });
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );
    product = await Promise.race([dbPromise, timeoutPromise]);
  } catch {
    // fallback
  }

  if (!product) {
    product = getStaticFallbackProducts().find((p) => p.slug === slug || p.id === slug);
  }

  if (!product) {
    return {
      title: 'Product Not Found | VELYRA Skincare',
    };
  }

  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
  const image = images && images.length > 0 ? images[0] : '/products/sunscreen-hero.webp';

  return {
    title: `${product.name} — ${product.spfRating || product.volume}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | VELYRA Skincare`,
      description: product.tagline,
      url: `https://velyra.in/products/${product.slug}`,
      images: [
        {
          url: image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.tagline,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: PDPProps) {
  const { slug } = await params;
  let rawProduct: any = null;

  try {
    const dbPromise = prisma.product.findUnique({
      where: { slug },
      include: {
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 3500)
    );

    rawProduct = await Promise.race([dbPromise, timeoutPromise]);
  } catch {
    console.warn(`Neon serverless sleeping/unreachable for slug "${slug}"; serving catalog fallback.`);
  }

  let product: Product;
  if (rawProduct) {
    const blobImageUrls = rawProduct.productImages && rawProduct.productImages.length > 0
      ? rawProduct.productImages.map((img: any) => img.url)
      : null;
    const fallbackImages = typeof rawProduct.images === 'string' ? JSON.parse(rawProduct.images) : rawProduct.images;

    product = {
      ...rawProduct,
      images: blobImageUrls || fallbackImages,
      benefits: typeof rawProduct.benefits === 'string' ? JSON.parse(rawProduct.benefits) : rawProduct.benefits,
      keyIngredients: typeof rawProduct.keyIngredients === 'string' ? JSON.parse(rawProduct.keyIngredients) : rawProduct.keyIngredients,
    } as Product;
  } else {
    const fallback = getStaticFallbackProducts().find(
      (p) => p.slug === slug || p.id === slug || p.sku.toLowerCase() === slug.toLowerCase()
    );
    if (!fallback) {
      notFound();
    }
    product = fallback;
  }

  // Related products with fallback
  let relatedProducts: Product[] = [];
  try {
    const rawRelated = await prisma.product.findMany({
      where: { id: { not: product.id } },
      take: 3,
    });
    if (rawRelated && rawRelated.length > 0) {
      relatedProducts = rawRelated.map((p: any) => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        benefits: typeof p.benefits === 'string' ? JSON.parse(p.benefits) : p.benefits,
        keyIngredients: typeof p.keyIngredients === 'string' ? JSON.parse(p.keyIngredients) : p.keyIngredients,
      })) as Product[];
    }
  } catch {
    // fallback
  }

  if (relatedProducts.length === 0) {
    relatedProducts = getStaticFallbackProducts().filter((p) => p.id !== product.id).slice(0, 3);
  }

  // JSON-LD Product Schema
  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': product.images,
    'description': product.description,
    'sku': product.sku,
    'offers': {
      '@type': 'Offer',
      'url': `https://velyra.in/products/${product.slug}`,
      'priceCurrency': 'INR',
      'price': product.price,
      'priceValidUntil': '2027-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    'brand': {
      '@type': 'Brand',
      'name': 'VELYRA',
    },
  };

  return (
    <div className="bg-surface-base min-h-screen py-10 sm:py-16 border-b border-border-subtle">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-brand-mineral">
          <Link href="/" className="hover:text-brand-charcoal transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-brand-sand" />
          <Link href="/products" className="hover:text-brand-charcoal transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3 h-3 text-brand-sand" />
          <span className="text-brand-charcoal font-medium truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Product Buy Section */}
          <div className="lg:col-span-5 space-y-8">
            <ProductInfo product={product} />
            <ProductAccordions product={product} />
          </div>
        </div>

        {/* Related Formulations */}
        {relatedProducts.length > 0 && (
          <div className="pt-16 border-t border-border-subtle space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-amber font-semibold block mb-1">
                Complete Your Ritual
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-normal">
                Complementary Formulations
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Bar */}
      <StickyPurchaseBar product={product} />
    </div>
  );
}
