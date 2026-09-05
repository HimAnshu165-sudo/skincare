import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getOrCreateCart, addItemToCart } from '@/lib/cart';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid product or quantity.' },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(request);
    const cookieStore = await cookies();
    let guestToken = cookieStore.get('velyra_guest_token')?.value || null;

    if (!user && !guestToken) {
      guestToken = `gst_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      cookieStore.set('velyra_guest_token', guestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    const cart = await getOrCreateCart(user ? user.id : null, guestToken);
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Unable to initialize cart.' },
        { status: 500 }
      );
    }

    const updatedCart = await addItemToCart(cart.id, productId, quantity);

    return NextResponse.json({
      success: true,
      cart: updatedCart,
      message: 'Item added to cart.',
    });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to add item to cart.' },
      { status: 400 }
    );
  }
}
