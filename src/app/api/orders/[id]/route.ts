import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserOrderById, getOrderForTracking } from '@/lib/orders';
import { jsonError, jsonSuccess } from '@/lib/validation';

export const dynamic = 'force-dynamic';

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '****';
  return '******' + phone.slice(-4);
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [name, domain] = email.split('@');
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return jsonError('Order ID or query is required.', 400);
    }

    const user = await getAuthenticatedUser(request);

    let order = null;
    let isFullAccess = false;

    if (user) {
      if (user.role === 'ADMIN') {
        // Admin can inspect any order
        order = await getOrderForTracking(id);
        if (order) isFullAccess = true;
      } else {
        // Authenticated customer: strictly isolate by userId. Do NOT fall back to other users' orders.
        order = await getUserOrderById(id, user.id);
        if (!order) {
          return jsonError('Order not found or access denied.', 404);
        }
        isFullAccess = true;
      }
    } else {
      // Unauthenticated guest tracking lookup: only allow lookup by Order Number
      if (!id.startsWith('VEL-')) {
        return jsonError('Order not found or unauthorized.', 404);
      }
      order = await getOrderForTracking(id);
    }

    if (!order) {
      return jsonError('Order not found or unauthorized.', 404);
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

    // If unauthenticated public tracking, sanitize sensitive customer details
    const sanitizedCustomerPhone = isFullAccess
      ? order.customerPhone
      : maskPhone(order.customerPhone);

    const sanitizedCustomerEmail = isFullAccess
      ? order.customerEmail
      : maskEmail(order.customerEmail);

    const sanitizedAddress = isFullAccess
      ? shippingAddress
      : {
          address: shippingAddress.addressLine1 || shippingAddress.address || 'Delivered to address on file',
          apartment: shippingAddress.addressLine2 || shippingAddress.apartment || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          pincode: shippingAddress.postalCode || shippingAddress.pincode || '',
        };

    return jsonSuccess({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: isFullAccess ? order.customerName : (order.customerName ? `${order.customerName.split(' ')[0]} ***` : 'Customer'),
        customerEmail: sanitizedCustomerEmail,
        customerPhone: sanitizedCustomerPhone,
        shippingAddress: sanitizedAddress,
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
    console.error('Error tracking order:', error);
    return jsonError('Server error retrieving order.', 500);
  }
}
