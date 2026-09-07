import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, hashPassword, verifyPassword } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { checkRateLimit, checkDualRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import { jsonError, jsonSuccess } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const ip = getClientIp(request);
    const rateCheck = await checkDualRateLimit(
      `admin-mfa:ip:${ip}`,
      5,
      60000,
      `admin-mfa:user:${auth.user.id}`,
      5,
      60000
    );

    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many attempts. Please try again later.');
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    const { action, pin } = body || {};

    if (!pin || typeof pin !== 'string' || !/^\d{6}$/.test(pin.trim())) {
      return jsonError('Please provide a 6-digit numeric security PIN.', 400);
    }

    const trimmedPin = pin.trim();

    if (action === 'SET_PIN') {
      const hashedPin = await hashPassword(trimmedPin);
      await prisma.user.update({
        where: { id: auth.user.id },
        data: { adminMfaPin: hashedPin },
      });

      await logAdminAction({
        adminUserId: auth.user.id,
        action: 'ADMIN_MFA_VERIFIED',
        resourceType: 'AUTH',
        resourceId: auth.user.id,
        metadata: { event: 'MFA PIN successfully configured' },
        request,
      });

      return jsonSuccess({
        message: 'Admin 6-digit Security PIN successfully configured.',
        hasMfaConfigured: true,
      });
    } else if (action === 'VERIFY_PIN') {
      const userRecord = await prisma.user.findUnique({
        where: { id: auth.user.id },
        select: { adminMfaPin: true },
      });

      if (!userRecord?.adminMfaPin) {
        return jsonError('Admin MFA PIN has not been set yet. Please configure it first.', 400);
      }

      const isMatch = await verifyPassword(trimmedPin, userRecord.adminMfaPin);
      if (!isMatch) {
        await logAdminAction({
          adminUserId: auth.user.id,
          action: 'ADMIN_LOGIN_FAILED',
          resourceType: 'AUTH',
          resourceId: auth.user.id,
          metadata: { reason: 'Invalid MFA PIN attempt' },
          request,
        });
        return jsonError('Invalid Admin Security PIN.', 401);
      }

      await logAdminAction({
        adminUserId: auth.user.id,
        action: 'ADMIN_MFA_VERIFIED',
        resourceType: 'AUTH',
        resourceId: auth.user.id,
        metadata: { event: 'MFA PIN verified' },
        request,
      });

      return jsonSuccess({
        verified: true,
        message: 'Admin MFA step-up authentication successful.',
      });
    }

    return jsonError('Invalid action specified.', 400);
  } catch (error: any) {
    console.error('Admin MFA API error:', error);
    return jsonError('Server error processing Admin MFA.', 500);
  }
}
