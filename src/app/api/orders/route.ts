import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserOrders } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
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

    return NextResponse.json({ success: true, orders: formatted });
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve orders.' },
      { status: 500 }
    );
  }
}
