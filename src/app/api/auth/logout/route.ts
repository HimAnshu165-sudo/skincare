import { NextResponse } from 'next/server';
import { clearSessionCookie, clearGuestCookie } from '@/lib/auth';
import { jsonSuccess, jsonError } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await clearSessionCookie();
    await clearGuestCookie();
    return jsonSuccess({
      message: 'Logged out successfully.',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return jsonError('Failed to logout.', 500);
  }
}
