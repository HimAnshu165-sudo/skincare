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

    // Parallel database aggregation queries (optimized DB execution, minimal transferred rows)
    const [
      ordersByStatusGroup,
      totalRevenueAgg,
      todayRevenueAgg,
      totalCustomers,
      [productStatsRow],
      revenueTrendRaw,
      recentOrdersRaw,
      lowStockProductsRaw,
      recentCustomersRaw,
    ] = await Promise.all([
      // 1. Grouped Order status counts in PostgreSQL
      prisma.order.groupBy({
        by: ['orderStatus'],
        _count: { id: true },
      }),

      // 2. All-time revenue & valid orders aggregate in PostgreSQL
      prisma.order.aggregate({
        where: {
          orderStatus: { not: 'CANCELLED' },
          paymentStatus: { not: 'FAILED' },
        },
        _sum: { total: true },
        _count: { id: true },
      }),

      // 3. Today's orders & revenue aggregate in PostgreSQL
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfToday },
          orderStatus: { not: 'CANCELLED' },
          paymentStatus: { not: 'FAILED' },
        },
        _sum: { total: true },
        _count: { id: true },
      }),

      // 4. Total customers count in PostgreSQL
      prisma.user.count({ where: { role: 'CUSTOMER' } }),

      // 5. Products stats aggregated directly in PostgreSQL (zero product rows transferred)
      prisma.$queryRaw<Array<{ total: bigint; out_of_stock: bigint; low_stock: bigint }>>`
        SELECT
          COUNT(*)::bigint AS total,
          COUNT(*) FILTER (WHERE "inStock" = false OR "stockQuantity" <= 0)::bigint AS out_of_stock,
          COUNT(*) FILTER (WHERE "inStock" = true AND "stockQuantity" > 0 AND "stockQuantity" <= ${LOW_STOCK_THRESHOLD})::bigint AS low_stock
        FROM "Product"
      `,

      // 6. Last 7 days revenue trend aggregated directly in PostgreSQL by day (transfers max 7 rows)
      prisma.$queryRaw<Array<{ day: Date; revenue: number | null; orders: bigint }>>`
        SELECT
          DATE_TRUNC('day', "createdAt") AS day,
          SUM("total")::float AS revenue,
          COUNT(*)::bigint AS orders
        FROM "Order"
        WHERE "createdAt" >= ${sevenDaysAgo}
          AND "orderStatus" != 'CANCELLED'
          AND "paymentStatus" != 'FAILED'
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY day ASC
      `,

      // 7. Recent 10 orders (lean projection)
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: {
              id: true,
              productName: true,
              quantity: true,
              price: true,
              imageUrl: true,
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
      }),

      // 8. Low stock product list (top 8)
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

      // 9. Recent customers (top 5)
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

    // Parse status counts from groupBy
    const statusCountMap: Record<string, number> = {};
    let totalOrders = 0;
    for (const group of ordersByStatusGroup) {
      statusCountMap[group.orderStatus] = group._count.id;
      totalOrders += group._count.id;
    }

    const placedOrders = statusCountMap['PLACED'] || 0;
    const confirmedOrders = statusCountMap['CONFIRMED'] || 0;
    const processingOrders = statusCountMap['PROCESSING'] || 0;
    const packedOrders = statusCountMap['PACKED'] || 0;
    const shippedOrders = statusCountMap['SHIPPED'] || 0;
    const outForDeliveryOrders = statusCountMap['OUT_FOR_DELIVERY'] || 0;
    const deliveredOrders = statusCountMap['DELIVERED'] || 0;
    const cancelledOrders = statusCountMap['CANCELLED'] || 0;

    // Parse product stats from native PostgreSQL aggregation
    const totalProducts = Number(productStatsRow?.total ?? 0);
    const outOfStockProductsCount = Number(productStatsRow?.out_of_stock ?? 0);
    const lowStockProductsCount = Number(productStatsRow?.low_stock ?? 0);

    const totalRevenue = totalRevenueAgg._sum.total || 0;
    const todayOrders = todayRevenueAgg._count.id || 0;
    const todayRevenue = todayRevenueAgg._sum.total || 0;

    // Build 7-day revenue trend from aggregated daily rows
    const last7DaysMap = new Map<string, { date: string; revenue: number; orders: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      last7DaysMap.set(key, { date: dayLabel, revenue: 0, orders: 0 });
    }

    for (const row of revenueTrendRaw) {
      const orderDateKey = new Date(row.day).toISOString().split('T')[0];
      if (last7DaysMap.has(orderDateKey)) {
        const entry = last7DaysMap.get(orderDateKey)!;
        entry.revenue += Number(row.revenue || 0);
        entry.orders += Number(row.orders ?? 0);
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
