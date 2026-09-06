import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { isValidPhone, isValidPostalCode, sanitizeString, jsonError, jsonSuccess } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return jsonSuccess({ addresses });
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return jsonError('Failed to fetch addresses.', 500);
  }
}

export async function POST(request: Request) {
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

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      addressType,
      isDefault,
    } = body || {};

    const sanitizedFullName = sanitizeString(fullName, 100);
    const sanitizedPhone = sanitizeString(phone, 20);
    const sanitizedAddressLine1 = sanitizeString(addressLine1, 200);
    const sanitizedAddressLine2 = addressLine2 ? sanitizeString(addressLine2, 200) : null;
    const sanitizedCity = sanitizeString(city, 100);
    const sanitizedState = sanitizeString(state, 100);
    const sanitizedPostalCode = sanitizeString(postalCode, 10);
    const sanitizedCountry = sanitizeString(country || 'India', 50);
    const sanitizedAddressType = addressType === 'WORK' || addressType === 'OTHER' ? addressType : 'HOME';

    if (!sanitizedFullName || sanitizedFullName.length < 2) {
      return jsonError('Please enter full recipient name.', 400);
    }

    if (!isValidPhone(sanitizedPhone)) {
      return jsonError('Please enter a valid phone number.', 400);
    }

    if (!sanitizedAddressLine1 || !sanitizedCity || !sanitizedState) {
      return jsonError('Please provide address line, city, and state.', 400);
    }

    if (!isValidPostalCode(sanitizedPostalCode)) {
      return jsonError('Please enter a valid 6-digit PIN code.', 400);
    }

    // If marked as default, unset other defaults for this user
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    // If first address, automatically make it default
    const count = await prisma.address.count({ where: { userId: user.id } });
    const shouldBeDefault = Boolean(isDefault) || count === 0;

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: sanitizedFullName,
        phone: sanitizedPhone,
        addressLine1: sanitizedAddressLine1,
        addressLine2: sanitizedAddressLine2,
        city: sanitizedCity,
        state: sanitizedState,
        postalCode: sanitizedPostalCode,
        country: sanitizedCountry,
        addressType: sanitizedAddressType,
        isDefault: shouldBeDefault,
      },
    });

    return jsonSuccess({
      address,
      message: 'Address saved successfully.',
    }, 201);
  } catch (error: any) {
    console.error('Error creating address:', error);
    return jsonError('Failed to save address.', 500);
  }
}
