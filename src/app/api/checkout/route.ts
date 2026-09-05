import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createOrder } from '@/lib/orders';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      items,
      couponCode,
      notes,
      saveAddressToAccount,
    } = body;

    // Server-side validation
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required order details.' },
        { status: 400 }
      );
    }

    // Call transactional order creation engine
    const order = await createOrder({
      userId: user ? user.id : null,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingAddress,
      paymentMethod: paymentMethod === 'ONLINE' ? 'ONLINE' : 'COD',
      items,
      couponCode: couponCode ? couponCode.trim() : null,
      notes: notes ? notes.trim() : null,
    });

    // Optionally save address to user's address book
    if (user && saveAddressToAccount) {
      try {
        const addressExists = await prisma.address.findFirst({
          where: {
            userId: user.id,
            addressLine1: shippingAddress.addressLine1,
            postalCode: shippingAddress.postalCode,
          },
        });

        if (!addressExists) {
          const count = await prisma.address.count({ where: { userId: user.id } });
          await prisma.address.create({
            data: {
              userId: user.id,
              fullName: shippingAddress.fullName || customerName,
              phone: shippingAddress.phone || customerPhone,
              addressLine1: shippingAddress.addressLine1,
              addressLine2: shippingAddress.addressLine2 || null,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country || 'India',
              addressType: shippingAddress.addressType || 'HOME',
              isDefault: count === 0,
            },
          });
        }
      } catch (err) {
        console.error('Failed to auto-save address:', err);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        items: order.items,
      },
    });
  } catch (error: any) {
    console.error('Error creating checkout order:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to place order.' },
      { status: 400 }
    );
  }
}
