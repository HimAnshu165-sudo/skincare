import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'velyra-luxury-skincare-secret-jwt-token-2026-production-key-signed'
);

export const SESSION_COOKIE_NAME = 'velyra_session';
export const GUEST_COOKIE_NAME = 'velyra_guest_token';
export const ADMIN_MFA_COOKIE_NAME = 'velyra_admin_mfa';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  mfaVerified?: boolean;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  hasMfaConfigured?: boolean;
  createdAt: Date;
}

export interface AdminAuthResult {
  user: AuthenticatedUser | null;
  status: 200 | 401 | 403;
  error?: string;
}

/**
 * Robust cookie value extraction from Request headers, NextRequest, or Next.js cookies()
 */
export async function getCookieValue(name: string, request?: Request | NextRequest): Promise<string | null> {
  if (request) {
    if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
      const val = (request as any).cookies.get(name)?.value;
      if (val) return val;
    }
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
      if (match) return decodeURIComponent(match[1]);
    }
  }
  try {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Hash plain-text password using bcrypt with salt rounds = 10.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare plain-text password with bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
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
 * Set httpOnly secure session cookie.
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
 * Clear guest token cookie after login/signup/logout.
 */
export async function clearGuestCookie() {
  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Get the currently authenticated user from server-side session cookie.
 * Validates against PostgreSQL User table on every request to ensure user exists and role is live.
 */
export async function getAuthenticatedUser(request?: NextRequest | Request): Promise<AuthenticatedUser | null> {
  try {
    const token = await getCookieValue(SESSION_COOKIE_NAME, request);
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
        adminMfaPin: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      hasMfaConfigured: Boolean(user.adminMfaPin),
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    return null;
  }
}

/**
 * Require authenticated customer; throws UNAUTHORIZED if not signed in.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Centralized Server-Side Admin Authorization.
 * Verifies:
 * 1. Authenticated session exists
 * 2. User exists in PostgreSQL
 * 3. user.role === 'ADMIN'
 * 
 * Returns:
 * - status: 401 for unauthenticated
 * - status: 403 for authenticated non-admin users
 * - status: 200 with authenticated Admin User
 */
export async function requireAdminUser(request?: Request | NextRequest): Promise<AdminAuthResult> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return {
      user: null,
      status: 401,
      error: 'Unauthorized: Authentication required. Please sign in.',
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      user,
      status: 403,
      error: 'Forbidden: Administrative access required. Your account role is CUSTOMER.',
    };
  }

  return {
    user,
    status: 200,
  };
}

/**
 * Backward compatibility boolean check.
 */
export async function requireAdmin(request?: Request | NextRequest): Promise<boolean> {
  const result = await requireAdminUser(request);
  return result.status === 200;
}
