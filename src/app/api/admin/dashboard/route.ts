import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { jsonError, jsonSuccess } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const LOW_STOCK_THRESHOLD = 20;

export async function GET(request: Request) {
  try {
    const auth = await requireAdminUser(request);
    if (auth.status !== 200) {
      return jsonError(auth.error || 'Unauthorized', auth.status);
    }

    // Start of today (00:00:00 local/UTC boundary)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Parallel database aggregation queries
    const [
      totalOrders,
      placedOrders,
      confirmedOrders,
      processingOrders,
      packedOrders,
      shippedOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalProducts,
      lowStockProductsCount,
      outOfStockProductsCount,
      todayOrdersList,
      allValidOrdersForRevenue,
      recentOrdersRaw,
      lowStockProductsRaw,
      recentCustomersRaw,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Orders by status
      prisma.order.count({ where: { orderStatus: 'PLACED' } }),
      prisma.order.count({ where: { orderStatus: 'CONFIRMED' } }),
      prisma.order.count({ where: { orderStatus: 'PROCESSING' } }),
      prisma.order.count({ where: { orderStatus: 'PACKED' } }),
      prisma.order.count({ where: { orderStatus: 'SHIPPED' } }),
      prisma.order.count({ where: { orderStatus: 'OUT_FOR_DELIVERY' } }),
      prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
      prisma.order.count({ where: { orderStatus: 'CANCELLED' } }),

      // Total customers
      prisma.user.count({ where: { role: 'CUSTOMER' } }),

      // Products metrics
      prisma.product.count(),
      prisma.product.count({
        where: {
          stockQuantity: { lte: LOW_STOCK_THRESHOLD, gt: 0 },
          inStock: true,
        },
      }),
      prisma.product.count({
        where: {
          OR: [{ stockQuantity: { lte: 0 } }, { inStock: false }],
        },
      }),

      // Today's orders
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfToday },
          orderStatus: { not: 'CANCELLED' },
          paymentStatus: { not: 'FAILED' },
        },
        select: { total: true },
      }),

      // All non-cancelled, non-failed orders for revenue calculation
      prisma.order.findMany({
        where: {
          orderStatus: { not: 'CANCELLED' },
          paymentStatus: { not: 'FAILED' },
        },
        select: {
          total: true,
          createdAt: true,
          paymentStatus: true,
          orderStatus: true,
        },
      }),

      // Recent 10 orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),

      // Low stock product list
      prisma.product.findMany({
        where: {
          stockQuantity: { lte: LOW_STOCK_THRESHOLD },
        },
        orderBy: { stockQuantity: 'asc' },
        take: 8,
        include: {
          productImages: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
      }),

      // Recent customers
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
    ]);

    // Calculate total revenue
    const totalRevenue = allValidOrdersForRevenue.reduce((sum, ord) => sum + (ord.total || 0), 0);
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList.reduce((sum, ord) => sum + (ord.total || 0), 0);

    // Calculate 7-day revenue trend
    const last7DaysMap = new Map<string, { date: string; revenue: number; orders: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      last7DaysMap.set(key, { date: dayLabel, revenue: 0, orders: 0 });
    }

    for (const order of allValidOrdersForRevenue) {
      const orderDateKey = new Date(order.createdAt).toISOString().split('T')[0];
      if (last7DaysMap.has(orderDateKey)) {
        const entry = last7DaysMap.get(orderDateKey)!;
        entry.revenue += order.total || 0;
        entry.orders += 1;
      }
    }

    const revenueTrend = Array.from(last7DaysMap.values());

    // Format recent orders
    const recentOrders = recentOrdersRaw.map((order) => {
      let parsedAddress = {};
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
        total: order.total,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        itemsCount: order.items?.length || 0,
        items: order.items,
        trackingNumber: order.trackingNumber,
        courierName: order.courierName,
        createdAt: order.createdAt,
      };
    });

    return jsonSuccess({
      metrics: {
        totalOrders,
        placedOrders,
        confirmedOrders,
        processingOrders,
        packedOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        pendingFulfillment: placedOrders + confirmedOrders + processingOrders + packedOrders,
        totalRevenue,
        todayOrders,
        todayRevenue,
        totalCustomers,
        totalProducts,
        lowStockProductsCount,
        outOfStockProductsCount,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
      },
      revenueTrend,
      recentOrders,
      lowStockProducts: lowStockProductsRaw.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        stockQuantity: p.stockQuantity,
        inStock: p.inStock,
        imageUrl: p.productImages?.[0]?.url || (typeof p.images === 'string' && p.images.startsWith('[') ? JSON.parse(p.images)[0] : '/products/sunscreen-hero.webp'),
      })),
      recentCustomers: recentCustomersRaw.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        createdAt: c.createdAt,
        ordersCount: c._count.orders,
      })),
    });
  } catch (error: any) {
    console.error('Error in /api/admin/dashboard:', error);
    return jsonError('Failed to load dashboard metrics from PostgreSQL.', 500);
  }
}
