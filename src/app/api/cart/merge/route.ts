import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, clearGuestCookie, GUEST_COOKIE_NAME } from '@/lib/auth';
import { mergeGuestCartIntoUserCart, getOrCreateCart, formatCart } from '@/lib/cart';
import { jsonError, jsonSuccess } from '@/lib/validation';
import { checkDualRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonError('Unauthorized: Must be signed in to merge cart.', 401);
    }

    const ip = getClientIp(request);
    const rateCheck = await checkDualRateLimit(
      `cart:merge:user:${user.id}`,
      20,
      60000,
      `cart:merge:ip:${ip}`,
      20,
      60000
    );
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many cart merge attempts. Please try again later.');
    }

    let guestToken: string | null = null;

    try {
      const body = await request.json();
      if (body && typeof body.guestToken === 'string') {
        guestToken = body.guestToken;
      }
    } catch {
      // Body is optional if cookie is present
    }

    const cookieStore = await cookies();
    if (!guestToken) {
      guestToken = cookieStore.get(GUEST_COOKIE_NAME)?.value || null;
    }

    if (guestToken) {
      await mergeGuestCartIntoUserCart(guestToken, user.id);
      await clearGuestCookie();
    }

    const userCart = await getOrCreateCart(user.id);

    return jsonSuccess({
      cart: formatCart(userCart),
      message: 'Cart merged successfully.',
    });
  } catch (error: any) {
    console.error('Error merging cart:', error);
    return jsonError('Failed to merge cart.', 500);
  }
}
