import { NextResponse } from 'next/server';
import { getAuthenticatedUser, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeString, isValidPhone, normalizePhone, isValidPassword, jsonError, jsonSuccess } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, user: null },
        { status: 200 }
      );
    }

    return jsonSuccess({
      authenticated: true,
      user,
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    return jsonError('Server error checking session.', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    const { name, phone, password } = body || {};

    const dataToUpdate: any = {};

    if (name !== undefined) {
      const sanitizedName = sanitizeString(name, 100);
      if (sanitizedName.length < 2) {
        return jsonError('Name must be at least 2 characters.', 400);
      }
      dataToUpdate.name = sanitizedName;
    }

    if (phone !== undefined) {
      const sanitizedPhone = sanitizeString(phone, 20);
      if (sanitizedPhone && !isValidPhone(sanitizedPhone)) {
        return jsonError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.', 400);
      }
      dataToUpdate.phone = sanitizedPhone ? normalizePhone(sanitizedPhone) : null;
    }

    if (password !== undefined) {
      if (!isValidPassword(password, 6)) {
        return jsonError('Password must be at least 6 characters.', 400);
      }
      dataToUpdate.password = await hashPassword(password);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return jsonError('No valid fields to update.', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return jsonSuccess({
      user: updatedUser,
      message: 'Profile updated successfully.',
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return jsonError('Failed to update profile.', 500);
  }
}
