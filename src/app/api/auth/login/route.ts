import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie, clearGuestCookie, getCookieValue, GUEST_COOKIE_NAME } from '@/lib/auth';
import { mergeGuestCartIntoUserCart } from '@/lib/cart';
import { isValidEmail, jsonError, jsonSuccess } from '@/lib/validation';
import { checkRateLimit, checkDualRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid or malformed JSON payload.', 400);
    }

    const { email, password, pin, guestToken: bodyGuestToken } = body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return jsonError('Email and password are required.', 400);
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Dual-Key Rate Limit:
    // 1. IP limiter: max 10 attempts per minute
    // 2. Account identifier limiter: max 5 attempts per minute (prevents distributed credential stuffing)
    const rateCheck = await checkDualRateLimit(
      `login:ip:${ip}`,
      10,
      60000,
      `login:acc:${trimmedEmail}`,
      5,
      60000
    );

    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many login attempts. Please try again later.');
    }

    if (!isValidEmail(trimmedEmail)) {
      return jsonError('Please enter a valid email address.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phone: true,
        role: true,
        adminMfaPin: true,
        createdAt: true,
      },
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

    // Step-up Admin MFA verification if PIN is configured for this admin
    if (user.role === 'ADMIN' && user.adminMfaPin) {
      if (!pin) {
        // Prompt client for the 6-digit PIN step without establishing full session yet
        return jsonSuccess({
          requiresMfa: true,
          message: 'Admin 6-digit Security PIN required.',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }

      const trimmedPin = String(pin).trim();
      if (!/^\d{6}$/.test(trimmedPin)) {
        return jsonError('Please provide a valid 6-digit numeric security PIN.', 400);
      }

      const isPinMatch = await verifyPassword(trimmedPin, user.adminMfaPin);
      if (!isPinMatch) {
        await logAdminAction({
          adminUserId: user.id,
          action: 'ADMIN_LOGIN_FAILED',
          resourceType: 'AUTH',
          resourceId: user.id,
          metadata: { email: user.email, reason: 'Invalid Admin MFA PIN' },
          request,
        });
        return jsonError('Invalid Admin Security PIN.', 401);
      }

      await logAdminAction({
        adminUserId: user.id,
        action: 'ADMIN_MFA_VERIFIED',
        resourceType: 'AUTH',
        resourceId: user.id,
        metadata: { email: user.email, event: 'Admin MFA verified during login' },
        request,
      });
    }

    // Generate session JWT and set secure httpOnly cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      mfaVerified: user.role === 'ADMIN' ? true : undefined,
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
      requiresMfa: false,
      message: 'Logged in successfully.',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return jsonError('An error occurred during authentication.', 500);
  }
}

