import { NextResponse } from 'next/server';
import { getAuthenticatedUser, requireAuthenticatedUser } from '@/lib/auth';
import { getUserOrders, createOrder } from '@/lib/orders';
import { prisma } from '@/lib/prisma';
import { isValidEmail, isValidPhone, sanitizeString, validateCartQuantity, jsonError, jsonSuccess } from '@/lib/validation';
import { checkRateLimit, checkDualRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return jsonError('Unauthorized: Please sign in to view your orders.', 401);
    }

    const rateCheck = await checkRateLimit(`orders:list:${user.id}`, 60, 60000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many order history requests. Please try again later.');
    }

    const orders = await getUserOrders(user.id);

    const formatted = orders.map((order) => {
      let parsedAddress = {};
      try {
        parsedAddress = typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
      } catch {
        parsedAddress = order.shippingAddress;
      }

      return {
        ...order,
        shippingAddress: parsedAddress,
      };
    });

    return jsonSuccess({ orders: formatted });
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return jsonError('Failed to retrieve orders.', 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Authentication required to place an order.', auth.status);
    }
    const user = auth.user;

    const ip = getClientIp(request);
    const rateCheck = await checkDualRateLimit(
      `orders:create:user:${user.id}`,
      10,
      60000,
      `orders:create:ip:${ip}`,
      10,
      60000
    );
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many order requests. Please try again later.');
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON payload.', 400);
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      items,
      couponCode,
      notes,
    } = body || {};

    const sanitizedName = sanitizeString(customerName || user.name, 100);
    const sanitizedEmail = typeof customerEmail === 'string' ? customerEmail.trim().toLowerCase() : user.email;
    const sanitizedPhone = sanitizeString(customerPhone || user.phone || '', 20);

    if (!sanitizedName || sanitizedName.length < 2) {
      return jsonError('Please provide your full name.', 400);
    }

    if (!isValidEmail(sanitizedEmail)) {
      return jsonError('Please provide a valid email address.', 400);
    }

    if (!isValidPhone(sanitizedPhone)) {
      return jsonError('Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9.', 400);
    }

    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return jsonError('Please provide a complete shipping address.', 400);
    }

    const addrLine1 = sanitizeString(shippingAddress.addressLine1 || shippingAddress.address, 200);
    const addrCity = sanitizeString(shippingAddress.city, 100);
    const addrPostal = sanitizeString(shippingAddress.postalCode || shippingAddress.pincode, 10);

    if (!addrLine1 || !addrCity || !addrPostal) {
      return jsonError('Please complete all required delivery address fields.', 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return jsonError('Your cart is empty. Please add formulations to order.', 400);
    }

    const sanitizedItems: Array<{ productId: string; quantity: number }> = [];
    for (const item of items) {
      if (!item || !item.productId || typeof item.productId !== 'string') {
        return jsonError('Invalid product item in order.', 400);
      }
      const qtyCheck = validateCartQuantity(item.quantity, 99);
      if (!qtyCheck.valid) {
        return jsonError(`Invalid quantity for product ${item.productId}.`, 400);
      }
      sanitizedItems.push({
        productId: item.productId,
        quantity: qtyCheck.quantity,
      });
    }

    const order = await createOrder({
      userId: user.id, // Strictly derived from verified session
      customerName: sanitizedName,
      customerEmail: sanitizedEmail,
      customerPhone: sanitizedPhone,
      shippingAddress: {
        fullName: sanitizeString(shippingAddress.fullName || sanitizedName, 100),
        phone: sanitizeString(shippingAddress.phone || sanitizedPhone, 20),
        addressLine1: addrLine1,
        addressLine2: sanitizeString(shippingAddress.addressLine2 || shippingAddress.apartment, 200) || undefined,
        city: addrCity,
        state: sanitizeString(shippingAddress.state || 'India', 100),
        postalCode: addrPostal,
        country: sanitizeString(shippingAddress.country || 'India', 50),
      },
      paymentMethod: paymentMethod === 'ONLINE' ? 'ONLINE' : 'COD',
      items: sanitizedItems,
      couponCode: couponCode ? sanitizeString(couponCode, 30) : null,
      notes: notes ? sanitizeString(notes, 500) : null,
    });

    return jsonSuccess({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        items: order.items,
      },
    }, 201);
  } catch (error: any) {
    console.error('Error in POST /api/orders:', error);
    return jsonError(error.message || 'Failed to place order.', 400);
  }
}

