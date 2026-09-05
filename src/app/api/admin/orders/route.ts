import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const isAuthorized = await requireAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');

    const where: any = {};
    if (status && status !== 'ALL') where.orderStatus = status;
    if (paymentStatus && paymentStatus !== 'ALL') where.paymentStatus = paymentStatus;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const formatted = orders.map((order) => {
      let shippingAddress = {};
      try {
        shippingAddress = typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
      } catch {
        shippingAddress = order.shippingAddress;
      }

      return {
        ...order,
        shippingAddress,
      };
    });

    return NextResponse.json({ success: true, orders: formatted });
  } catch (error: any) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin orders.' },
      { status: 500 }
    );
  }
}
