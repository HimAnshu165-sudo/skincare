import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess, sanitizeString } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const VALID_ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const VALID_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const STATUS_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  PLACED: {
    title: 'Order Placed',
    description: 'Order received and logged in system.',
  },
  CONFIRMED: {
    title: 'Order Confirmed',
    description: 'Order payment / details confirmed and sent for fulfillment.',
  },
  PROCESSING: {
    title: 'Processing in Cleanroom',
    description: 'Items are being inspected and prepared in temperature-controlled cleanroom.',
  },
  PACKED: {
    title: 'Packed in Luxury Packaging',
    description: 'Items packaged in amber glass UV protective boxing with tamper-evident seal.',
  },
  SHIPPED: {
    title: 'Handed to Express Courier',
    description: 'Dispatched with express delivery partner with end-to-end tracking.',
  },
  OUT_FOR_DELIVERY: {
    title: 'Out for Delivery',
    description: 'Delivery agent is en route to customer destination address.',
  },
  DELIVERED: {
    title: 'Delivered',
    description: 'Order successfully delivered to customer.',
  },
  CANCELLED: {
    title: 'Order Cancelled',
    description: 'Order has been cancelled by customer or operations team.',
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { id } = await params;
    if (!id) {
      return jsonError('Order ID is required.', 400);
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                sku: true,
                stockQuantity: true,
                inStock: true,
                productImages: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
        payments: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            _count: { select: { orders: true } },
          },
        },
      },
    });

    if (!order) {
      return jsonError('Order not found in database.', 404);
    }

    let parsedAddress: any = {};
    try {
      parsedAddress = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
    } catch {
      parsedAddress = order.shippingAddress;
    }

    return jsonSuccess({
      order: {
        ...order,
        shippingAddress: parsedAddress,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin order detail:', error);
    return jsonError('Failed to fetch order details.', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const rateCheck = await checkRateLimit(`admin:orders:update:${auth.user.id}`, 40, 60000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Order update rate limit exceeded.');
    }

    const { id } = await params;
    if (!id) {
      return jsonError('Order ID is required.', 400);
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON body.', 400);
    }

    const {
      orderStatus,
      paymentStatus,
      trackingNumber,
      courierName,
      trackingUrl,
      notes,
      statusTitle,
      statusDescription,
      statusLocation,
    } = body || {};

    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return jsonError('Order not found.', 404);
    }

    // Validate order status if provided
    if (orderStatus && !VALID_ORDER_STATUSES.includes(orderStatus)) {
      return jsonError(`Invalid order status: ${orderStatus}. Must be one of ${VALID_ORDER_STATUSES.join(', ')}.`, 400);
    }

    // Validate payment status if provided
    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return jsonError(`Invalid payment status: ${paymentStatus}. Must be one of ${VALID_PAYMENT_STATUSES.join(', ')}.`, 400);
    }

    // Prepare update data
    const updateData: any = {};

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = sanitizeString(trackingNumber, 100) || null;
    }

    if (courierName !== undefined) {
      updateData.courierName = sanitizeString(courierName, 100) || null;
    }

    if (trackingUrl !== undefined) {
      updateData.trackingUrl = sanitizeString(trackingUrl, 500) || null;
    }

    if (notes !== undefined) {
      updateData.notes = sanitizeString(notes, 1000) || null;
    }

    if (paymentStatus && paymentStatus !== existingOrder.paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const isStatusChanged = orderStatus && orderStatus !== existingOrder.orderStatus;
    if (isStatusChanged) {
      updateData.orderStatus = orderStatus;

      // If marked as DELIVERED and was COD, automatically mark payment as PAID
      if (orderStatus === 'DELIVERED' && existingOrder.paymentMethod === 'COD' && existingOrder.paymentStatus !== 'PAID') {
        updateData.paymentStatus = 'PAID';
      }
    }

    // Execute updates and history logging in transactional atomic block
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update Order record
      const updated = await tx.order.update({
        where: { id: existingOrder.id },
        data: updateData,
        include: {
          items: true,
          payments: { orderBy: { createdAt: 'desc' } },
          statusHistory: { orderBy: { createdAt: 'asc' } },
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      // 2. If orderStatus changed, record OrderStatusHistory
      if (isStatusChanged) {
        const defaultInfo = STATUS_DESCRIPTIONS[orderStatus] || {
          title: `Order ${orderStatus}`,
          description: `Status updated to ${orderStatus}`,
        };

        const finalTitle = sanitizeString(statusTitle || defaultInfo.title, 150);
        const finalDescription = sanitizeString(
          statusDescription ||
            (orderStatus === 'SHIPPED' && (updateData.trackingNumber || existingOrder.trackingNumber)
              ? `Dispatched via ${updateData.courierName || existingOrder.courierName || 'Express Courier'} (AWB: ${updateData.trackingNumber || existingOrder.trackingNumber})`
              : defaultInfo.description),
          500
        );
        const finalLocation = sanitizeString(statusLocation || (orderStatus === 'PROCESSING' ? 'Cleanroom Lab' : 'Fulfillment Center'), 100);

        await tx.orderStatusHistory.create({
          data: {
            orderId: existingOrder.id,
            status: orderStatus,
            title: finalTitle,
            description: finalDescription,
            location: finalLocation,
          },
        });
      }

      // 3. If payment status changed, record/update payment entry
      if (updateData.paymentStatus && updateData.paymentStatus !== existingOrder.paymentStatus) {
        const existingPayment = await tx.payment.findFirst({
          where: { orderId: existingOrder.id },
          orderBy: { createdAt: 'desc' },
        });

        if (existingPayment) {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: { status: updateData.paymentStatus },
          });
        }
      }

      // 4. If order cancelled, restore inventory stock atomically
      if (isStatusChanged && orderStatus === 'CANCELLED' && existingOrder.orderStatus !== 'CANCELLED') {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: item.quantity },
              inStock: true,
            },
          });
        }
      }

      return updated;
    });

    // Re-fetch with fresh status history
    const finalOrder = await prisma.order.findUnique({
      where: { id: updatedOrder.id },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    let parsedAddress: any = {};
    try {
      parsedAddress = typeof finalOrder?.shippingAddress === 'string'
        ? JSON.parse(finalOrder.shippingAddress)
        : finalOrder?.shippingAddress;
    } catch {
      parsedAddress = finalOrder?.shippingAddress;
    }

    // Record administrative audit log
    await logAdminAction({
      adminUserId: auth.user.id,
      action: isStatusChanged ? 'ORDER_STATUS_CHANGED' : 'ORDER_STATUS_CHANGED',
      resourceType: 'ORDER',
      resourceId: existingOrder.id,
      metadata: {
        orderNumber: existingOrder.orderNumber,
        previousStatus: existingOrder.orderStatus,
        newStatus: updateData.orderStatus || existingOrder.orderStatus,
        previousPaymentStatus: existingOrder.paymentStatus,
        newPaymentStatus: updateData.paymentStatus || existingOrder.paymentStatus,
        trackingNumber: updateData.trackingNumber || existingOrder.trackingNumber,
      },
      request,
    });

    return jsonSuccess({
      message: 'Order updated successfully.',
      order: {
        ...finalOrder,
        shippingAddress: parsedAddress,
      },
    });
  } catch (error: any) {
    console.error('Error updating admin order:', error);
    return jsonError(error.message || 'Failed to update order.', 500);
  }
}
