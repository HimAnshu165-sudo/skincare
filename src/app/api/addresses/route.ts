import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch addresses.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
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
    } = body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required address fields.' },
        { status: 400 }
      );
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
    const shouldBeDefault = isDefault || count === 0;

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2 ? addressLine2.trim() : null,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country || 'India',
        addressType: addressType || 'HOME',
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json({
      success: true,
      address,
      message: 'Address saved successfully.',
    });
  } catch (error: any) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save address.' },
      { status: 500 }
    );
  }
}
