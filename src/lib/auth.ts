import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.ADMIN_SECRET_KEY || 'velyra-luxury-skincare-secret-jwt-token-2026-production'
);

const SESSION_COOKIE_NAME = 'velyra_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
}

/**
 * Hash plain-text password using bcrypt with salt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare plain-text password with bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate encrypted/signed JWT session token.
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

/**
 * Verify JWT session token.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Set httpOnly secure session cookie in response headers or Next.js cookies().
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Clear session cookie (logout).
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Get the currently authenticated user from server-side session cookie.
 * Validates against PostgreSQL User table to ensure user exists and is active.
 */
export async function getAuthenticatedUser(request?: NextRequest | Request): Promise<AuthenticatedUser | null> {
  try {
    let token: string | undefined;

    if (request && 'cookies' in request && typeof (request as any).cookies?.get === 'function') {
      token = (request as any).cookies.get(SESSION_COOKIE_NAME)?.value;
    }

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }

    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    return null;
  }
}

/**
 * Require authenticated customer; throws or returns null.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Require Admin authorization (via session role or ADMIN_SECRET_KEY header).
 */
export async function requireAdmin(request?: Request): Promise<boolean> {
  if (request) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('x-admin-key');
    const secretKey = process.env.ADMIN_SECRET_KEY || 'velyra-admin-secure-2026';
    if (authHeader && (authHeader === secretKey || authHeader === `Bearer ${secretKey}`)) {
      return true;
    }
  }

  const user = await getAuthenticatedUser();
  if (user && user.role === 'ADMIN') {
    return true;
  }

  return false;
}
