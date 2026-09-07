import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess, sanitizeString } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));
    const search = sanitizeString(searchParams.get('search') || '', 100);
    const orderStatus = searchParams.get('orderStatus') || searchParams.get('status') || 'ALL';
    const paymentStatus = searchParams.get('paymentStatus') || 'ALL';
    const paymentMethod = searchParams.get('paymentMethod') || 'ALL';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build Prisma filter query
    const where: any = {};

    if (orderStatus && orderStatus !== 'ALL') {
      where.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { customerPhone: { contains: search } },
        { trackingNumber: { contains: search } },
      ];
    }

    // Determine sort field
    let orderByField: any = { createdAt: sortOrder };
    if (sortBy === 'total') orderByField = { total: sortOrder };
    if (sortBy === 'orderNumber') orderByField = { orderNumber: sortOrder };

    const skip = (page - 1) * limit;

    const [totalOrders, ordersRaw] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          payments: { orderBy: { createdAt: 'desc' }, take: 1 },
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: orderByField,
        skip,
        take: limit,
      }),
    ]);

    const formattedOrders = ordersRaw.map((order) => {
      let parsedAddress: any = {};
      try {
        parsedAddress = typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
      } catch {
        parsedAddress = order.shippingAddress;
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: parsedAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        total: order.total,
        couponCode: order.couponCode,
        trackingNumber: order.trackingNumber,
        courierName: order.courierName,
        trackingUrl: order.trackingUrl,
        notes: order.notes,
        itemsCount: order.items?.length || 0,
        items: order.items,
        latestHistory: order.statusHistory?.[0] || null,
        latestPayment: order.payments?.[0] || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return jsonSuccess({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return jsonError('Failed to fetch admin orders from PostgreSQL.', 500);
  }
}
