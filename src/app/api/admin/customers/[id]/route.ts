import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200 || !auth.user) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    const { id } = await params;
    if (!id) {
      return jsonError('Customer ID is required.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            payments: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!user) {
      return jsonError('Customer not found.', 404);
    }

    const validOrders = user.orders.filter(
      (o) => o.orderStatus !== 'CANCELLED' && o.paymentStatus !== 'FAILED'
    );
    const totalSpent = validOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

    const formattedOrders = user.orders.map((ord) => {
      let parsedAddress: any = {};
      try {
        parsedAddress = typeof ord.shippingAddress === 'string'
          ? JSON.parse(ord.shippingAddress)
          : ord.shippingAddress;
      } catch {
        parsedAddress = ord.shippingAddress;
      }

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        createdAt: ord.createdAt,
        orderStatus: ord.orderStatus,
        paymentMethod: ord.paymentMethod,
        paymentStatus: ord.paymentStatus,
        subtotal: ord.subtotal,
        discount: ord.discount,
        shippingFee: ord.shippingFee,
        total: ord.total,
        itemsCount: ord.items?.length || 0,
        items: ord.items,
        shippingAddress: parsedAddress,
        trackingNumber: ord.trackingNumber,
      };
    });

    return jsonSuccess({
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        addresses: user.addresses,
        totalOrders: user.orders.length,
        totalSpent,
        orders: formattedOrders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin customer detail:', error);
    return jsonError('Failed to fetch customer details.', 500);
  }
}
