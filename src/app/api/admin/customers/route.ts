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

    const where: any = {
      role: 'CUSTOMER',
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [totalCustomers, customersRaw] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { orders: true, addresses: true } },
          orders: {
            where: {
              orderStatus: { not: 'CANCELLED' },
              paymentStatus: { not: 'FAILED' },
            },
            select: { total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedCustomers = customersRaw.map((c) => {
      const totalSpent = c.orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        ordersCount: c._count.orders,
        addressesCount: c._count.addresses,
        totalSpent,
      };
    });

    return jsonSuccess({
      customers: formattedCustomers,
      pagination: {
        page,
        limit,
        total: totalCustomers,
        totalPages: Math.ceil(totalCustomers / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin customers:', error);
    return jsonError('Failed to fetch customers from database.', 500);
  }
}
