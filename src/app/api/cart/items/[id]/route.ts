import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getCookieValue, GUEST_COOKIE_NAME } from '@/lib/auth';
import { getOrCreateCart, updateCartItemQuantity, removeCartItem } from '@/lib/cart';
import { validateCartQuantity, jsonError, jsonSuccess } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartItemId } = await params;
    if (!cartItemId) {
      return jsonError('Cart item ID is required.', 400);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    const { quantity } = body || {};
    if (quantity === undefined || quantity === null) {
      return jsonError('Quantity is required.', 400);
    }

    const user = await getAuthenticatedUser(request);
    const guestToken = await getCookieValue(GUEST_COOKIE_NAME, request);

    const cart = await getOrCreateCart(user ? user.id : null, guestToken);
    if (!cart) {
      return jsonError('Cart session not found.', 404);
    }

    const numQuantity = Number(quantity);

    // If 0, remove the item
    if (numQuantity === 0) {
      const updatedCart = await removeCartItem(cart.id, cartItemId);
      return jsonSuccess({ cart: updatedCart });
    }

    const qtyCheck = validateCartQuantity(numQuantity, 99);
    if (!qtyCheck.valid) {
      return jsonError(qtyCheck.error || 'Invalid quantity.', 400);
    }

    const updatedCart = await updateCartItemQuantity(cart.id, cartItemId, qtyCheck.quantity);

    return jsonSuccess({ cart: updatedCart });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return jsonError(error.message || 'Failed to update item quantity.', 400);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartItemId } = await params;
    if (!cartItemId) {
      return jsonError('Cart item ID is required.', 400);
    }

    const user = await getAuthenticatedUser(request);
    const guestToken = await getCookieValue(GUEST_COOKIE_NAME, request);

    const cart = await getOrCreateCart(user ? user.id : null, guestToken);
    if (!cart) {
      return jsonError('Cart session not found.', 404);
    }

    const updatedCart = await removeCartItem(cart.id, cartItemId);

    return jsonSuccess({ cart: updatedCart });
  } catch (error: any) {
    console.error('Error removing cart item:', error);
    return jsonError('Failed to remove item.', 500);
  }
}
