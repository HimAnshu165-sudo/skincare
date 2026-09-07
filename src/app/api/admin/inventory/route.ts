import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess, sanitizeString } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const LOW_STOCK_THRESHOLD = 20;

export async function GET(request: Request) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { searchParams } = new URL(request.url);
    const search = sanitizeString(searchParams.get('search') || '', 100);
    const filter = searchParams.get('filter') || 'ALL'; // ALL, LOW_STOCK, OUT_OF_STOCK, IN_STOCK

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filter === 'LOW_STOCK') {
      where.stockQuantity = { lte: LOW_STOCK_THRESHOLD, gt: 0 };
      where.inStock = true;
    } else if (filter === 'OUT_OF_STOCK') {
      where.OR = [{ stockQuantity: { lte: 0 } }, { inStock: false }];
    } else if (filter === 'IN_STOCK') {
      where.stockQuantity = { gt: LOW_STOCK_THRESHOLD };
      where.inStock = true;
    }

    const [products, totalProducts, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          category: true,
          price: true,
          mrp: true,
          stockQuantity: true,
          inStock: true,
          volume: true,
          updatedAt: true,
          productImages: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
        orderBy: [{ stockQuantity: 'asc' }, { updatedAt: 'desc' }],
      }),
      prisma.product.count(),
      prisma.product.count({
        where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD, gt: 0 }, inStock: true },
      }),
      prisma.product.count({
        where: { OR: [{ stockQuantity: { lte: 0 } }, { inStock: false }] },
      }),
    ]);

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      stockQuantity: p.stockQuantity,
      inStock: p.inStock,
      volume: p.volume,
      isLowStock: p.inStock && p.stockQuantity <= LOW_STOCK_THRESHOLD && p.stockQuantity > 0,
      isOutOfStock: !p.inStock || p.stockQuantity <= 0,
      imageUrl: p.productImages?.[0]?.url || '/products/sunscreen-hero.webp',
      updatedAt: p.updatedAt,
    }));

    return jsonSuccess({
      inventory: formatted,
      summary: {
        totalProducts,
        inStockCount: totalProducts - outOfStockCount,
        lowStockCount,
        outOfStockCount,
        threshold: LOW_STOCK_THRESHOLD,
      },
    });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return jsonError('Failed to fetch inventory from database.', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON body.', 400);
    }

    const { productId, stockQuantity, adjustment, inStock } = body || {};

    if (!productId) {
      return jsonError('Product ID is required.', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return jsonError('Product not found in database.', 404);
    }

    let newStock = product.stockQuantity;

    if (stockQuantity !== undefined) {
      const parsed = parseInt(stockQuantity, 10);
      if (isNaN(parsed) || parsed < 0) {
        return jsonError('Stock quantity must be a non-negative number.', 400);
      }
      newStock = parsed;
    } else if (adjustment !== undefined) {
      const adj = parseInt(adjustment, 10);
      if (isNaN(adj)) {
        return jsonError('Adjustment must be a number.', 400);
      }
      newStock = Math.max(0, product.stockQuantity + adj);
    }

    const newInStock = inStock !== undefined ? Boolean(inStock) : newStock > 0;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newStock,
        inStock: newInStock,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        inStock: true,
        updatedAt: true,
      },
    });

    await logAdminAction({
      adminUserId: auth.user.id,
      action: 'INVENTORY_UPDATED',
      resourceType: 'INVENTORY',
      resourceId: product.id,
      metadata: {
        productName: product.name,
        sku: product.sku,
        previousStock: product.stockQuantity,
        newStock,
      },
      request,
    });

    try {
      revalidateTag('products');
    } catch {}

    return jsonSuccess({
      message: `Inventory updated for ${updated.name}.`,
      product: updated,
    });
  } catch (error: any) {
    console.error('Error updating inventory:', error);
    return jsonError(error.message || 'Failed to update inventory in database.', 500);
  }
}
