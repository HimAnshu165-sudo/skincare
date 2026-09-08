import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken, setSessionCookie, clearGuestCookie, getCookieValue, GUEST_COOKIE_NAME } from '@/lib/auth';
import { mergeGuestCartIntoUserCart } from '@/lib/cart';
import { isValidEmail, isValidPassword, isValidPhone, normalizePhone, sanitizeString, jsonError, jsonSuccess } from '@/lib/validation';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`signup:ip:${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many signup attempts. Please try again later.');
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid or malformed JSON payload.', 400);
    }

    const { name, email, password, phone, guestToken: bodyGuestToken } = body || {};

    const sanitizedName = sanitizeString(name, 100);
    const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const sanitizedPhone = phone ? sanitizeString(phone, 20) : null;

    // Field-level validations
    if (!sanitizedName || sanitizedName.length < 2) {
      return jsonError('Please enter your full name (at least 2 characters).', 400);
    }

    if (!isValidEmail(sanitizedEmail)) {
      return jsonError('Please provide a valid email address.', 400);
    }

    if (!isValidPassword(password, 6)) {
      return jsonError('Password must be at least 6 characters long.', 400);
    }

    if (sanitizedPhone && !isValidPhone(sanitizedPhone)) {
      return jsonError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.', 400);
    }
    const finalPhone = sanitizedPhone ? normalizePhone(sanitizedPhone) : null;

    // Check existing email pre-flight
    const existing = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      select: { id: true },
    });

    if (existing) {
      return jsonError('An account with this email already exists.', 409);
    }

    const hashedPassword = await hashPassword(password);

    let user;
    try {
      // Role Escalation Defense: ALWAYS create new users with 'CUSTOMER' role
      user = await prisma.user.create({
        data: {
          name: sanitizedName,
          email: sanitizedEmail,
          password: hashedPassword,
          phone: finalPhone,
          role: 'CUSTOMER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (dbError: any) {
      if (dbError?.code === 'P2002') {
        return jsonError('An account with this email already exists.', 409);
      }
      throw dbError;
    }

    // Create session token and set secure httpOnly cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSessionCookie(token);

    // Resolve guest token from body OR cookies
    const guestToken = bodyGuestToken || (await getCookieValue(GUEST_COOKIE_NAME, request));

    if (guestToken) {
      try {
        await mergeGuestCartIntoUserCart(guestToken, user.id);
      } catch (mergeError) {
        console.error('Non-blocking cart merge error on signup:', mergeError);
      }
      await clearGuestCookie();
    }

    return jsonSuccess({
      user,
      message: 'Account created successfully.',
    }, 201);
  } catch (error: any) {
    console.error('Signup error:', error);
    const message =
      process.env.NODE_ENV === 'development'
        ? `Signup failed: ${error?.message || 'Unknown server error'}`
        : 'An unexpected error occurred while creating your account.';
    return jsonError(message, 500);
  }
}
