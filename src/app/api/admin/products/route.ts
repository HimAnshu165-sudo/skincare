import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess, sanitizeString } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = sanitizeString(searchParams.get('search') || '', 100);
    const category = searchParams.get('category');
    const inStock = searchParams.get('inStock');

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (inStock === 'true') {
      where.inStock = true;
    } else if (inStock === 'false') {
      where.inStock = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [totalProducts, productsRaw] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          productImages: {
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { orderItems: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedProducts = productsRaw.map((p) => {
      let parsedBenefits: string[] = [];
      let parsedIngredients: any[] = [];
      try {
        parsedBenefits = typeof p.benefits === 'string' ? JSON.parse(p.benefits) : p.benefits;
      } catch {
        parsedBenefits = [];
      }
      try {
        parsedIngredients = typeof p.keyIngredients === 'string' ? JSON.parse(p.keyIngredients) : p.keyIngredients;
      } catch {
        parsedIngredients = [];
      }

      let primaryImage = '/products/sunscreen-hero.webp';
      if (p.productImages && p.productImages.length > 0) {
        primaryImage = p.productImages[0].url;
      } else if (p.images) {
        try {
          const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
          if (Array.isArray(imgs) && imgs.length > 0) primaryImage = imgs[0];
        } catch {
          // fallback
        }
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        tagline: p.tagline,
        description: p.description,
        price: p.price,
        mrp: p.mrp,
        stockQuantity: p.stockQuantity,
        inStock: p.inStock,
        volume: p.volume,
        spfRating: p.spfRating,
        finish: p.finish,
        skinType: p.skinType,
        category: p.category,
        isFeatured: p.isFeatured,
        isUpcoming: p.isUpcoming,
        primaryImage,
        productImages: p.productImages,
        benefits: parsedBenefits,
        keyIngredients: parsedIngredients,
        fullIngredients: p.fullIngredients,
        howToUse: p.howToUse,
        totalOrdersCount: p._count.orderItems,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return jsonSuccess({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return jsonError('Failed to fetch product catalog.', 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    const {
      name,
      slug,
      sku,
      tagline,
      description,
      price,
      mrp,
      stockQuantity,
      inStock,
      volume,
      spfRating,
      finish,
      skinType,
      category,
      isFeatured,
      isUpcoming,
      benefits,
      keyIngredients,
      fullIngredients,
      howToUse,
      images,
    } = body || {};

    const sanitizedName = sanitizeString(name, 150);
    let sanitizedSlug = sanitizeString(slug, 150).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (!sanitizedSlug && sanitizedName) {
      sanitizedSlug = sanitizedName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    }
    const sanitizedSku = sanitizeString(sku, 50).toUpperCase();

    if (!sanitizedName) return jsonError('Product name is required.', 400);
    if (!sanitizedSlug) return jsonError('Product slug is required.', 400);
    if (!sanitizedSku) return jsonError('Product SKU is required.', 400);

    const parsedPrice = parseFloat(price);
    const parsedMrp = parseFloat(mrp);
    const parsedStock = parseInt(stockQuantity ?? 100, 10);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return jsonError('Price must be a valid positive number.', 400);
    }
    if (isNaN(parsedMrp) || parsedMrp < parsedPrice) {
      return jsonError('MRP must be greater than or equal to selling price.', 400);
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      return jsonError('Stock quantity must be a non-negative number.', 400);
    }

    // Check slug and sku collision
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug: sanitizedSlug }, { sku: sanitizedSku }],
      },
    });

    if (existing) {
      if (existing.slug === sanitizedSlug) {
        return jsonError('A product with this URL slug already exists.', 409);
      }
      if (existing.sku === sanitizedSku) {
        return jsonError('A product with this SKU already exists.', 409);
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        name: sanitizedName,
        slug: sanitizedSlug,
        sku: sanitizedSku,
        tagline: sanitizeString(tagline || '', 200),
        description: sanitizeString(description || '', 2000),
        price: parsedPrice,
        mrp: parsedMrp,
        stockQuantity: parsedStock,
        inStock: inStock !== undefined ? Boolean(inStock) : parsedStock > 0,
        volume: sanitizeString(volume || '50ml', 50),
        spfRating: sanitizeString(spfRating || '', 50) || null,
        finish: sanitizeString(finish || '', 100) || null,
        skinType: sanitizeString(skinType || 'All Skin Types', 100) || null,
        category: sanitizeString(category || 'Sunscreens', 50),
        isFeatured: Boolean(isFeatured),
        isUpcoming: Boolean(isUpcoming),
        images: Array.isArray(images) ? JSON.stringify(images) : JSON.stringify(['/products/sunscreen-hero.webp']),
        benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : JSON.stringify([]),
        keyIngredients: Array.isArray(keyIngredients) ? JSON.stringify(keyIngredients) : JSON.stringify([]),
        fullIngredients: sanitizeString(fullIngredients || '', 2000),
        howToUse: sanitizeString(howToUse || '', 2000),
      },
      include: {
        productImages: true,
      },
    });

    await logAdminAction({
      adminUserId: auth.user.id,
      action: 'PRODUCT_CREATED',
      resourceType: 'PRODUCT',
      resourceId: newProduct.id,
      metadata: { name: newProduct.name, sku: newProduct.sku, price: newProduct.price },
      request,
    });

    try {
      revalidateTag('products');
    } catch {}

    return jsonSuccess({
      message: 'Product created successfully.',
      product: newProduct,
    }, 201);
  } catch (error: any) {
    console.error('Error creating admin product:', error);
    return jsonError(error.message || 'Failed to create product in PostgreSQL.', 500);
  }
}
