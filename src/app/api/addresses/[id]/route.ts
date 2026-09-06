import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { isValidPhone, isValidPostalCode, sanitizeString, jsonError, jsonSuccess } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    const { id } = await params;
    if (!id) {
      return jsonError('Address ID is required.', 400);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return jsonError('Address not found or unauthorized.', 404);
    }

    const updates: any = {};

    if (body.fullName !== undefined) {
      const name = sanitizeString(body.fullName, 100);
      if (name.length < 2) return jsonError('Name must be at least 2 characters.', 400);
      updates.fullName = name;
    }

    if (body.phone !== undefined) {
      const phone = sanitizeString(body.phone, 20);
      if (!isValidPhone(phone)) return jsonError('Please enter a valid phone number.', 400);
      updates.phone = phone;
    }

    if (body.addressLine1 !== undefined) {
      const addr1 = sanitizeString(body.addressLine1, 200);
      if (!addr1) return jsonError('Address line 1 cannot be empty.', 400);
      updates.addressLine1 = addr1;
    }

    if (body.addressLine2 !== undefined) {
      updates.addressLine2 = body.addressLine2 ? sanitizeString(body.addressLine2, 200) : null;
    }

    if (body.city !== undefined) {
      const city = sanitizeString(body.city, 100);
      if (!city) return jsonError('City cannot be empty.', 400);
      updates.city = city;
    }

    if (body.state !== undefined) {
      const state = sanitizeString(body.state, 100);
      if (!state) return jsonError('State cannot be empty.', 400);
      updates.state = state;
    }

    if (body.postalCode !== undefined) {
      const postal = sanitizeString(body.postalCode, 10);
      if (!isValidPostalCode(postal)) return jsonError('Please enter a valid 6-digit PIN code.', 400);
      updates.postalCode = postal;
    }

    if (body.addressType !== undefined) {
      updates.addressType = body.addressType === 'WORK' || body.addressType === 'OTHER' ? body.addressType : 'HOME';
    }

    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
      updates.isDefault = true;
    }

    const updated = await prisma.address.update({
      where: { id },
      data: updates,
    });

    return jsonSuccess({ address: updated });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return jsonError('Failed to update address.', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    const { id } = await params;
    if (!id) {
      return jsonError('Address ID is required.', 400);
    }

    // Verify ownership and delete
    const result = await prisma.address.deleteMany({
      where: { id, userId: user.id },
    });

    if (result.count === 0) {
      return jsonError('Address not found or unauthorized.', 404);
    }

    return jsonSuccess({ message: 'Address deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return jsonError('Failed to delete address.', 500);
  }
}
