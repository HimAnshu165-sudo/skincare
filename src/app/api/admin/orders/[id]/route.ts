import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await requireAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      orderStatus,
      paymentStatus,
      trackingNumber,
      courierName,
      trackingUrl,
      statusNote,
    } = body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const updates: any = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
    if (courierName !== undefined) updates.courierName = courierName;
    if (trackingUrl !== undefined) updates.trackingUrl = trackingUrl;

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: updates,
        include: {
          items: true,
          payments: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      }),
      ...(orderStatus && orderStatus !== order.orderStatus
        ? [
            prisma.orderStatusHistory.create({
              data: {
                orderId: id,
                status: orderStatus,
                title: getStatusTitle(orderStatus),
                description:
                  statusNote ||
                  `Order status updated to ${orderStatus}${trackingNumber ? ` (Tracking: ${trackingNumber})` : ''}.`,
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status.' },
      { status: 500 }
    );
  }
}

function getStatusTitle(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Order Confirmed';
    case 'PROCESSING':
      return 'Formulation & Lab Processing';
    case 'PACKED':
      return 'Dispatched to Fulfillment Center';
    case 'SHIPPED':
      return 'Handed over to Courier Partner';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Delivered Successfully';
    case 'CANCELLED':
      return 'Order Cancelled';
    default:
      return `Status: ${status}`;
  }
}
