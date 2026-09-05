import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { mergeGuestCartIntoUserCart, getOrCreateCart, formatCart } from '@/lib/cart';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const guestToken = cookieStore.get('velyra_guest_token')?.value;

    if (guestToken) {
      await mergeGuestCartIntoUserCart(guestToken, user.id);
      // Clear guest token cookie
      cookieStore.set('velyra_guest_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
    }

    const userCart = await getOrCreateCart(user.id);

    return NextResponse.json({
      success: true,
      cart: formatCart(userCart),
      message: 'Cart merged successfully.',
    });
  } catch (error: any) {
    console.error('Error merging cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to merge cart.' },
      { status: 500 }
    );
  }
}
