import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholderWebhookSecret';

    // Verify webhook signature if configured
    if (webhookSecret !== 'placeholderWebhookSecret' && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId },
        });

        if (order && order.paymentStatus !== 'PAID') {
          await prisma.$transaction([
            prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'PAID',
                orderStatus: 'CONFIRMED',
                razorpayPaymentId,
              },
            }),
            prisma.payment.updateMany({
              where: { orderId: order.id },
              data: {
                status: 'PAID',
                razorpayPaymentId,
                rawPayload: JSON.stringify(paymentEntity),
              },
            }),
            prisma.orderStatusHistory.create({
              data: {
                orderId: order.id,
                status: 'CONFIRMED',
                title: 'Payment Captured (Webhook)',
                description: `Webhook confirmation received for payment ID ${razorpayPaymentId}.`,
              },
            }),
          ]);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
