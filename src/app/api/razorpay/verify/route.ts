import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { success: false, message: 'Missing payment signature verification parameters.' },
        { status: 400 }
      );
    }

    // Cryptographic signature check
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      // Record failed payment
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: 'FAILED',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      });

      return NextResponse.json(
        { success: false, message: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // Update Order and Payment to PAID
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
          razorpayPaymentId: razorpay_payment_id,
        },
      }),
      prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: 'PAID',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: 'CONFIRMED',
          title: 'Payment Verified',
          description: `Payment of verified successfully via Razorpay (Payment ID: ${razorpay_payment_id}).`,
        },
      }),
    ]);

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true, statusHistory: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully.',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error verifying razorpay payment:', error);
    return NextResponse.json(
      { success: false, message: 'Server error verifying payment.' },
      { status: 500 }
    );
  }
}
