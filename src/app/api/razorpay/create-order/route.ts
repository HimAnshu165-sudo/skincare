import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createOrder } from '@/lib/orders';
import { createRazorpayOrder } from '@/lib/razorpay';
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
      items,
      couponCode,
      notes,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required order details.' },
        { status: 400 }
      );
    }

    // Create order transactionally in database
    const order = await createOrder({
      userId: user ? user.id : null,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingAddress,
      paymentMethod: 'ONLINE',
      items,
      couponCode: couponCode ? couponCode.trim() : null,
      notes: notes ? notes.trim() : null,
    });

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(order.total, order.orderNumber);

    // Link Razorpay Order ID to our Order and Payment record
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholderKeyId';

    return NextResponse.json({
      success: true,
      keyId,
      razorpayOrder,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        items: order.items,
      },
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error creating payment order.' },
      { status: 400 }
    );
  }
}
