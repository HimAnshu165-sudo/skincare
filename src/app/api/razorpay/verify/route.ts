import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // Signature verification
    if (keySecret && !keySecret.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, message: 'Invalid payment signature.' },
          { status: 400 }
        );
      }
    }

    // Update order status in DB
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, message: 'Server error verifying payment.' },
      { status: 500 }
    );
  }
}
