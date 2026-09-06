import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess, sanitizeString } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { id } = await params;
    if (!id) {
      return jsonError('Product ID is required.', 400);
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }, { sku: id }],
      },
      include: {
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { orderItems: true, cartItems: true },
        },
      },
    });

    if (!product) {
      return jsonError('Product not found in database.', 404);
    }

    let parsedBenefits: string[] = [];
    let parsedIngredients: any[] = [];
    try {
      parsedBenefits = typeof product.benefits === 'string' ? JSON.parse(product.benefits) : product.benefits;
    } catch {
      parsedBenefits = [];
    }
    try {
      parsedIngredients = typeof product.keyIngredients === 'string' ? JSON.parse(product.keyIngredients) : product.keyIngredients;
    } catch {
      parsedIngredients = [];
    }

    return jsonSuccess({
      product: {
        ...product,
        benefits: parsedBenefits,
        keyIngredients: parsedIngredients,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin product:', error);
    return jsonError('Failed to fetch product details.', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { id } = await params;
    if (!id) {
      return jsonError('Product ID is required.', 400);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }, { sku: id }] },
    });

    if (!existing) {
      return jsonError('Product not found.', 404);
    }

    const updateData: any = {};

    if (body.name !== undefined) {
      const name = sanitizeString(body.name, 150);
      if (!name) return jsonError('Name cannot be empty.', 400);
      updateData.name = name;
    }

    if (body.slug !== undefined) {
      const slug = sanitizeString(body.slug, 150).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      if (!slug) return jsonError('Slug cannot be empty.', 400);
      // Check collision
      const slugCheck = await prisma.product.findFirst({
        where: { slug, id: { not: existing.id } },
      });
      if (slugCheck) return jsonError('Slug already in use by another product.', 409);
      updateData.slug = slug;
    }

    if (body.sku !== undefined) {
      const sku = sanitizeString(body.sku, 50).toUpperCase();
      if (!sku) return jsonError('SKU cannot be empty.', 400);
      const skuCheck = await prisma.product.findFirst({
        where: { sku, id: { not: existing.id } },
      });
      if (skuCheck) return jsonError('SKU already in use by another product.', 409);
      updateData.sku = sku;
    }

    if (body.tagline !== undefined) updateData.tagline = sanitizeString(body.tagline, 200);
    if (body.description !== undefined) updateData.description = sanitizeString(body.description, 2000);
    if (body.volume !== undefined) updateData.volume = sanitizeString(body.volume, 50);
    if (body.spfRating !== undefined) updateData.spfRating = sanitizeString(body.spfRating, 50) || null;
    if (body.finish !== undefined) updateData.finish = sanitizeString(body.finish, 100) || null;
    if (body.skinType !== undefined) updateData.skinType = sanitizeString(body.skinType, 100) || null;
    if (body.category !== undefined) updateData.category = sanitizeString(body.category, 50);
    if (body.fullIngredients !== undefined) updateData.fullIngredients = sanitizeString(body.fullIngredients, 2000);
    if (body.howToUse !== undefined) updateData.howToUse = sanitizeString(body.howToUse, 2000);

    if (body.price !== undefined) {
      const price = parseFloat(body.price);
      if (isNaN(price) || price < 0) return jsonError('Invalid price.', 400);
      updateData.price = price;
    }

    if (body.mrp !== undefined) {
      const mrp = parseFloat(body.mrp);
      if (isNaN(mrp) || mrp < 0) return jsonError('Invalid MRP.', 400);
      updateData.mrp = mrp;
    }

    if (body.stockQuantity !== undefined) {
      const stock = parseInt(body.stockQuantity, 10);
      if (isNaN(stock) || stock < 0) return jsonError('Invalid stock quantity.', 400);
      updateData.stockQuantity = stock;
      if (body.inStock === undefined) {
        updateData.inStock = stock > 0;
      }
    }

    if (body.inStock !== undefined) {
      updateData.inStock = Boolean(body.inStock);
    }

    if (body.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(body.isFeatured);
    }

    if (body.isUpcoming !== undefined) {
      updateData.isUpcoming = Boolean(body.isUpcoming);
    }

    if (body.benefits !== undefined) {
      updateData.benefits = Array.isArray(body.benefits) ? JSON.stringify(body.benefits) : JSON.stringify([]);
    }

    if (body.keyIngredients !== undefined) {
      updateData.keyIngredients = Array.isArray(body.keyIngredients) ? JSON.stringify(body.keyIngredients) : JSON.stringify([]);
    }

    if (body.images !== undefined) {
      updateData.images = Array.isArray(body.images) ? JSON.stringify(body.images) : JSON.stringify([]);
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        productImages: { orderBy: { sortOrder: 'asc' } },
      },
    });

    await logAdminAction({
      adminUserId: auth.user.id,
      action: 'PRODUCT_UPDATED',
      resourceType: 'PRODUCT',
      resourceId: existing.id,
      metadata: { name: updated.name, sku: updated.sku, updates: Object.keys(updateData) },
      request,
    });

    return jsonSuccess({
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (error: any) {
    console.error('Error updating admin product:', error);
    return jsonError(error.message || 'Failed to update product.', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { id } = await params;
    if (!id) {
      return jsonError('Product ID is required.', 400);
    }

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }, { sku: id }] },
      include: {
        _count: { select: { orderItems: true } },
      },
    });

    if (!existing) {
      return jsonError('Product not found.', 404);
    }

    // If product has existing orders, soft-archive by setting inStock = false and stockQuantity = 0 to preserve OrderItem FK integrity
    if (existing._count.orderItems > 0) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          inStock: false,
          stockQuantity: 0,
          isFeatured: false,
          isUpcoming: false,
        },
      });

      await logAdminAction({
        adminUserId: auth.user.id,
        action: 'PRODUCT_DELETED',
        resourceType: 'PRODUCT',
        resourceId: existing.id,
        metadata: { name: existing.name, sku: existing.sku, actionTaken: 'archived_due_to_orders' },
        request,
      });

      return jsonSuccess({
        message: 'Product has existing order history; it has been deactivated and archived in stock.',
        archived: true,
      });
    }

    // Otherwise safe to hard delete
    await prisma.product.delete({
      where: { id: existing.id },
    });

    await logAdminAction({
      adminUserId: auth.user.id,
      action: 'PRODUCT_DELETED',
      resourceType: 'PRODUCT',
      resourceId: existing.id,
      metadata: { name: existing.name, sku: existing.sku, actionTaken: 'hard_deleted' },
      request,
    });

    return jsonSuccess({
      message: 'Product deleted from database successfully.',
      deleted: true,
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return jsonError(error.message || 'Failed to delete product.', 500);
  }
}
