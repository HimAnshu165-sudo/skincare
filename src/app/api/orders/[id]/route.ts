import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserOrderById, getAdminOrderById } from '@/lib/orders';
import { jsonError, jsonSuccess } from '@/lib/validation';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return jsonError('Order ID or order number is required.', 400);
    }

    // Strictly derive user identity from the server-side authenticated session
    // Never trust client userId, query userId, or request body userId
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonError('Unauthorized: Authentication required to track or view order details.', 401);
    }

    const rateCheck = await checkRateLimit(`orders:detail:${user.id}`, 60, 60000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many order status requests. Please try again later.');
    }

    let order = null;

    if (user.role === 'ADMIN') {
      // Authorized admin flow: can inspect orders across the system
      order = await getAdminOrderById(id);
    } else {
      // Authenticated customer: database ownership check (order.userId === session.userId)
      // Never returns another customer's order even if requestedOrderId/orderNumber is known
      order = await getUserOrderById(id, user.id);
    }

    if (!order) {
      return jsonError('Order not found or access denied.', 404);
    }

    let shippingAddress: any = {};
    try {
      shippingAddress =
        typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
    } catch {
      shippingAddress = order.shippingAddress;
    }

    // Expose only safe fields, strictly omitting internal payment signatures, raw payloads, or secrets
    return jsonSuccess({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        total: order.total,
        trackingNumber: order.trackingNumber,
        courierName: order.courierName,
        trackingUrl: order.trackingUrl,
        items: order.items,
        statusHistory: order.statusHistory,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error retrieving order:', error);
    return jsonError('Server error retrieving order.', 500);
  }
}
