import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    const parsed = orders.map((o) => ({
      ...o,
      shippingAddress:
        typeof o.shippingAddress === 'string'
          ? JSON.parse(o.shippingAddress)
          : o.shippingAddress,
    }));

    return NextResponse.json({ success: true, orders: parsed });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin orders.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, orderStatus, paymentStatus, trackingNumber, courierName } =
      await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Missing orderId.' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(trackingNumber && { trackingNumber }),
        ...(courierName && { courierName }),
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status.' },
      { status: 500 }
    );
  }
}
