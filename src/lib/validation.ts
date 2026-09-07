import { NextResponse } from 'next/server';

/**
 * Standard Email Regex matching common valid format
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates email format and length.
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Validates password strength (minimum 6 characters, string type).
 */
export function isValidPassword(password: unknown, minLength = 6): boolean {
  if (typeof password !== 'string') return false;
  return password.length >= minLength && password.length <= 128;
}

/**
 * Validates mobile phone number format (strictly 10 digits starting with 6, 7, 8, or 9).
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  const digitsOnly = phone.trim().replace(/\D/g, '');
  if (!digitsOnly) return false;
  // Standard 10-digit mobile number (starts with 6-9)
  if (digitsOnly.length === 10) return /^[6-9]\d{9}$/.test(digitsOnly);
  // 12-digit number with 91 country code prefix (10 digits starting with 6-9)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) return /^[6-9]\d{9}$/.test(digitsOnly.slice(2));
  // 11-digit number with 0 trunk prefix (10 digits starting with 6-9)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) return /^[6-9]\d{9}$/.test(digitsOnly.slice(1));
  return false;
}

/**
 * Normalizes phone number to standard 10-digit string.
 */
export function normalizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  const digitsOnly = phone.trim().replace(/\D/g, '');
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) return digitsOnly.slice(2);
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) return digitsOnly.slice(1);
  return digitsOnly.slice(-10);
}

/**
 * Validates Indian 6-digit PIN code.
 */
export function isValidPostalCode(code: unknown): boolean {
  if (typeof code !== 'string') return false;
  const trimmed = code.trim();
  return /^[1-9][0-9]{5}$/.test(trimmed);
}

/**
 * Sanitizes text string (trims, removes control characters, caps length).
 */
export function sanitizeString(val: unknown, maxLen = 255): string {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '').slice(0, maxLen);
}

/**
 * Validates and sanitizes a positive integer for cart quantity.
 */
export function validateCartQuantity(qty: unknown, maxStock = 99): { valid: boolean; quantity: number; error?: string } {
  const parsed = typeof qty === 'number' ? qty : parseInt(String(qty), 10);
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1) {
    return { valid: false, quantity: 1, error: 'Quantity must be a positive whole number.' };
  }
  if (parsed > maxStock) {
    return { valid: false, quantity: maxStock, error: `Quantity cannot exceed ${maxStock} units.` };
  }
  return { valid: true, quantity: parsed };
}

/**
 * Standardized API JSON error response.
 */
export function jsonError(message: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

/**
 * Standardized API JSON success response.
 */
export function jsonSuccess<T extends object>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status }
  );
}

/**
 * Validates and sanitizes redirect/next parameters to prevent Open Redirect vulnerabilities.
 * Only allows relative internal paths starting with a single '/' (e.g. '/admin', '/account').
 * Rejects protocol-relative URLs (e.g. '//evil.com'), absolute URLs ('https://evil.com'),
 * javascript: URIs, data: URIs, or backslash tricks ('/\\evil.com').
 */
export function sanitizeRedirectPath(
  url: string | null | undefined,
  defaultPath: string = '/'
): string {
  if (!url || typeof url !== 'string') return defaultPath;
  const trimmed = url.trim();

  // Must start with '/' but NOT '//' or '/\'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return defaultPath;
  }

  // Reject URL scheme indicators or backslashes
  if (trimmed.includes(':') || trimmed.includes('\\')) {
    return defaultPath;
  }

  return trimmed;
}

