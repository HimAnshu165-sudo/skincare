import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie, clearGuestCookie, getCookieValue, GUEST_COOKIE_NAME } from '@/lib/auth';
import { mergeGuestCartIntoUserCart } from '@/lib/cart';
import { isValidEmail, jsonError, jsonSuccess } from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60000);
    if (!rateCheck.allowed) {
      return jsonError(`Too many login attempts. Please try again in ${rateCheck.resetSeconds}s.`, 429);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid or malformed JSON payload.', 400);
    }

    const { email, password, guestToken: bodyGuestToken } = body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return jsonError('Email and password are required.', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return jsonError('Please enter a valid email address.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return jsonError('Invalid email or password.', 401);
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      if (user.role === 'ADMIN') {
        await logAdminAction({
          adminUserId: user.id,
          action: 'ADMIN_LOGIN_FAILED',
          resourceType: 'AUTH',
          resourceId: user.id,
          metadata: { email: user.email, reason: 'Invalid password' },
          request,
        });
      }
      return jsonError('Invalid email or password.', 401);
    }

    // Generate session JWT and set secure httpOnly cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSessionCookie(token);

    // If Admin, log successful login
    if (user.role === 'ADMIN') {
      await logAdminAction({
        adminUserId: user.id,
        action: 'ADMIN_LOGIN',
        resourceType: 'AUTH',
        resourceId: user.id,
        metadata: { email: user.email },
        request,
      });
    }

    // Resolve guest token from body OR cookies and merge
    const guestToken = bodyGuestToken || (await getCookieValue(GUEST_COOKIE_NAME, request));

    if (guestToken) {
      try {
        await mergeGuestCartIntoUserCart(guestToken, user.id);
      } catch (mergeError) {
        console.error('Non-blocking cart merge error on login:', mergeError);
      }
      await clearGuestCookie();
    }

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    return jsonSuccess({
      user: sanitizedUser,
      message: 'Logged in successfully.',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return jsonError('An error occurred during authentication.', 500);
  }
}
