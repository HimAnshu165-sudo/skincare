import { NextResponse } from 'next/server';
import { getAuthenticatedUser, requireAuthenticatedUser } from '@/lib/auth';
import { createOrder } from '@/lib/orders';
import { createRazorpayOrder } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import { isValidEmail, isValidPhone, sanitizeString, validateCartQuantity, jsonError, jsonSuccess } from '@/lib/validation';
import { checkDualRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Authentication required to place an order. Please sign in or create an account.', 401);
    }
    const user = auth.user;

    const ip = getClientIp(request);
    const rateCheck = await checkDualRateLimit(
      `razorpay:create:user:${user.id}`,
      10,
      60000,
      `razorpay:create:ip:${ip}`,
      10,
      60000
    );
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many order creation requests. Please try again later.');
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
      items,
      couponCode,
      notes,
    } = body || {};

    const sanitizedName = sanitizeString(customerName, 100);
    const sanitizedEmail = typeof customerEmail === 'string' ? customerEmail.trim().toLowerCase() : '';
    const sanitizedPhone = sanitizeString(customerPhone, 20);

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
      return jsonError('Your cart is empty. Please add formulations before checkout.', 400);
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

    // Create order transactionally in database
    const order = await createOrder({
      userId: user.id,
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
      paymentMethod: 'ONLINE',
      items: sanitizedItems,
      couponCode: couponCode ? sanitizeString(couponCode, 30) : null,
      notes: notes ? sanitizeString(notes, 500) : null,
    });

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(order.total, order.orderNumber);

    // Link Razorpay Order ID to our Order and Payment record
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholderKeyId';

    return jsonSuccess({
      keyId,
      razorpayOrder,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        items: order.items,
      },
    }, 201);
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return jsonError(error.message || 'Server error creating payment order.', 400);
  }
}
