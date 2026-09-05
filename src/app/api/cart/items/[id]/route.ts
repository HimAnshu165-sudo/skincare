import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getOrCreateCart, updateCartItemQuantity, removeCartItem } from '@/lib/cart';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartItemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined) {
      return NextResponse.json({ success: false, message: 'Quantity is required.' }, { status: 400 });
    }

    const user = await getAuthenticatedUser(request);
    const cookieStore = await cookies();
    const guestToken = cookieStore.get('velyra_guest_token')?.value || null;

    const cart = await getOrCreateCart(user ? user.id : null, guestToken);
    if (!cart) {
      return NextResponse.json({ success: false, message: 'Cart not found.' }, { status: 404 });
    }

    const updatedCart = await updateCartItemQuantity(cart.id, cartItemId, parseInt(quantity, 10));

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update item quantity.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartItemId } = await params;
    const user = await getAuthenticatedUser(request);
    const cookieStore = await cookies();
    const guestToken = cookieStore.get('velyra_guest_token')?.value || null;

    const cart = await getOrCreateCart(user ? user.id : null, guestToken);
    if (!cart) {
      return NextResponse.json({ success: false, message: 'Cart not found.' }, { status: 404 });
    }

    const updatedCart = await removeCartItem(cart.id, cartItemId);

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove item.' },
      { status: 500 }
    );
  }
}
