import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getOrCreateCart, formatCart, clearCart } from '@/lib/cart';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const cookieStore = await cookies();
    const guestToken = cookieStore.get('velyra_guest_token')?.value || null;

    let cart;
    if (user) {
      cart = await getOrCreateCart(user.id, null);
    } else if (guestToken) {
      cart = await getOrCreateCart(null, guestToken);
    } else {
      // Create a new guest token
      const newGuestToken = `gst_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      cookieStore.set('velyra_guest_token', newGuestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      cart = await getOrCreateCart(null, newGuestToken);
    }

    return NextResponse.json({
      success: true,
      cart: formatCart(cart),
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const cookieStore = await cookies();
    const guestToken = cookieStore.get('velyra_guest_token')?.value || null;

    const cart = await getOrCreateCart(user ? user.id : null, guestToken);
    if (cart) {
      const cleared = await clearCart(cart.id);
      return NextResponse.json({ success: true, cart: cleared });
    }

    return NextResponse.json({ success: true, cart: formatCart(null) });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear cart.' },
      { status: 500 }
    );
  }
}
