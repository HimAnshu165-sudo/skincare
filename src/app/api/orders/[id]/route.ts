import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserOrderById, getOrderForTracking } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);

    let order = null;

    if (user) {
      // Authenticated user querying order: strictly isolate by userId
      order = await getUserOrderById(id, user.id);
      if (!order && user.role === 'ADMIN') {
        // Admin fallback if viewing order directly
        order = await getOrderForTracking(id);
      }
    } else {
      // Guest tracking lookup: allow query by orderNumber or customerPhone
      order = await getOrderForTracking(id);
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found or unauthorized.' },
        { status: 404 }
      );
    }

    let shippingAddress = {};
    try {
      shippingAddress =
        typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
    } catch {
      shippingAddress = order.shippingAddress;
    }

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
