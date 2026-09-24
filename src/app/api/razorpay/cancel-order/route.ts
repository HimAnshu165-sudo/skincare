import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { jsonError, jsonSuccess } from '@/lib/validation';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`cancel-order:${ip}`, 30, 60000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many cancellation requests.');
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    const { orderId, reason } = body || {};
    if (!orderId || typeof orderId !== 'string') {
      return jsonError('Order ID is required.', 400);
    }

    const trimmedOrderId = orderId.trim();

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: trimmedOrderId },
      include: { items: true },
    });

    if (!order) {
      // Order may have already been cleaned up
      return jsonSuccess({ message: 'Order already resolved or not found.' });
    }

    // Safety guard: NEVER cancel an order that has already been verified and paid
    if (order.paymentStatus === 'PAID') {
      return jsonSuccess({ message: 'Order is already marked PAID. Cannot cancel.' });
    }

    // Only cancel unconfirmed/pending online orders
    if (order.paymentMethod === 'ONLINE' && order.paymentStatus === 'PENDING') {
      await prisma.$transaction(async (tx) => {
        // 1. Restore product inventory
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: item.quantity },
              inStock: true,
            },
          });
        }

        // 2. Remove the aborted pending order to prevent ghost order clutter
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        await tx.payment.deleteMany({ where: { orderId: order.id } });
        await tx.orderStatusHistory.deleteMany({ where: { orderId: order.id } });
        await tx.order.delete({ where: { id: order.id } });
      });

      console.log(`[Order Cancelled] Order #${order.orderNumber} cancelled (${reason || 'user exit'}). Stock restored.`);
    }

    return jsonSuccess({
      success: true,
      message: 'Pending order cancelled and inventory restored.',
    });
  } catch (error: any) {
    console.error('Error cancelling pending order:', error);
    return jsonError(error.message || 'Server error cancelling pending order.', 500);
  }
}
