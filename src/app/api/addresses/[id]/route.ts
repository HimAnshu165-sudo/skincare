import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
    }

    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(body.fullName && { fullName: body.fullName.trim() }),
        ...(body.phone && { phone: body.phone.trim() }),
        ...(body.addressLine1 && { addressLine1: body.addressLine1.trim() }),
        ...(body.addressLine2 !== undefined && { addressLine2: body.addressLine2 ? body.addressLine2.trim() : null }),
        ...(body.city && { city: body.city.trim() }),
        ...(body.state && { state: body.state.trim() }),
        ...(body.postalCode && { postalCode: body.postalCode.trim() }),
        ...(body.addressType && { addressType: body.addressType }),
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      },
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json({ success: false, message: 'Failed to update address.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership and delete
    const result = await prisma.address.deleteMany({
      where: { id, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, message: 'Address not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Address deleted.' });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete address.' }, { status: 500 });
  }
}
