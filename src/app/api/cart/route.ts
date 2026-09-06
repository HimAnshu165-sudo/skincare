import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, clearGuestCookie, getCookieValue, GUEST_COOKIE_NAME } from '@/lib/auth';
import { getOrCreateCart, formatCart, clearCart, mergeGuestCartIntoUserCart } from '@/lib/cart';
import { jsonSuccess, jsonError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const guestToken = await getCookieValue(GUEST_COOKIE_NAME, request);

    let cart;
    if (user) {
      // If user is authenticated and an unmerged guest cart exists, auto-merge it
      if (guestToken) {
        try {
          await mergeGuestCartIntoUserCart(guestToken, user.id);
        } catch (mergeErr) {
          console.error('Auto-merge error on cart fetch:', mergeErr);
        }
        await clearGuestCookie();
      }

      cart = await getOrCreateCart(user.id, null);
    } else if (guestToken) {
      cart = await getOrCreateCart(null, guestToken);
    } else {
      // Create a fresh guest session token
      const newGuestToken = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const cookieStore = await cookies();
      cookieStore.set(GUEST_COOKIE_NAME, newGuestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      cart = await getOrCreateCart(null, newGuestToken);
    }

    return jsonSuccess({
      cart: formatCart(cart),
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return jsonError('Failed to fetch cart.', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const guestToken = await getCookieValue(GUEST_COOKIE_NAME, request);

    const cart = await getOrCreateCart(user ? user.id : null, guestToken);
    if (cart) {
      const cleared = await clearCart(cart.id);
      return jsonSuccess({ cart: cleared });
    }

    return jsonSuccess({ cart: formatCart(null) });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return jsonError('Failed to clear cart.', 500);
  }
}
