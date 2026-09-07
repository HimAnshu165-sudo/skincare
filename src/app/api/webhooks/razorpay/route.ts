import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`webhook-razorpay:${ip}`, 120, 60000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Webhook rate limit exceeded.');
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholderWebhookSecret';

    // Verify webhook signature
    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'Missing x-razorpay-signature header.' },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid Razorpay webhook signature.' },
        { status: 400 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    const event = payload.event;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId },
        });

        if (!order) {
          return NextResponse.json({ status: 'ignored', message: 'Order not found' });
        }

        // Webhook Idempotency Guard: do not duplicate status transitions if already marked PAID
        if (order.paymentStatus === 'PAID') {
          return NextResponse.json({ status: 'ok', message: 'Payment already processed (idempotent)' });
        }

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
              title: 'Payment Captured (Webhook Verified)',
              description: `Automated cryptographic confirmation for payment ID ${razorpayPaymentId}.`,
            },
          }),
        ]);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json({ status: 'error', message: 'Webhook processing failed.' }, { status: 500 });
  }
}
