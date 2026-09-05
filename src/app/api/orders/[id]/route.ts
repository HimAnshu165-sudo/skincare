import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = id.trim();

    // Query by orderNumber or id or customerPhone
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: query } },
          { id: { equals: query } },
          { customerPhone: { equals: query } },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }

    const shippingAddress =
      typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        shippingAddress,
      },
    });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { success: false, message: 'Server error retrieving order.' },
      { status: 500 }
    );
  }
}
