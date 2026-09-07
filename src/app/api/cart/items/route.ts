import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, getCookieValue, GUEST_COOKIE_NAME } from '@/lib/auth';
import { getOrCreateCart, addItemToCart } from '@/lib/cart';
import { prisma } from '@/lib/prisma';
import { validateCartQuantity, jsonError, jsonSuccess } from '@/lib/validation';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`cart:items:ip:${ip}`, 60, 60000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many cart requests. Please try again later.');
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    const { productId, quantity = 1 } = body || {};

    if (!productId || typeof productId !== 'string') {
      return jsonError('A valid productId is required.', 400);
    }

    // Verify product exists in catalog
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return jsonError('Product not found.', 404);
    }

    if (!product.inStock || product.isUpcoming) {
      return jsonError('This formulation is currently unavailable.', 400);
    }

    if (product.stockQuantity <= 0) {
      return jsonError('Product is currently out of stock.', 400);
    }

    // Strict quantity validation
    const qtyCheck = validateCartQuantity(quantity, Math.min(product.stockQuantity, 99));
    if (!qtyCheck.valid) {
      return jsonError(qtyCheck.error || 'Invalid quantity.', 400);
    }

    const user = await getAuthenticatedUser(request);
    let guestToken = await getCookieValue(GUEST_COOKIE_NAME, request);

    if (!user && !guestToken) {
      guestToken = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const cookieStore = await cookies();
      cookieStore.set(GUEST_COOKIE_NAME, guestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    const cart = await getOrCreateCart(user ? user.id : null, guestToken);
    if (!cart) {
      return jsonError('Unable to initialize cart session.', 500);
    }

    const updatedCart = await addItemToCart(cart.id, productId, qtyCheck.quantity);

    return jsonSuccess({
      cart: updatedCart,
      message: 'Item added to cart.',
    });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return jsonError(error.message || 'Failed to add item to cart.', 400);
  }
}
