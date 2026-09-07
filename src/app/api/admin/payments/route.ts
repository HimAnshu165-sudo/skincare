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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = sanitizeString(searchParams.get('search') || '', 100);
    const status = searchParams.get('status');
    const method = searchParams.get('method');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (method && method !== 'ALL') {
      where.method = method;
    }

    if (search) {
      where.OR = [
        { razorpayOrderId: { contains: search } },
        { razorpayPaymentId: { contains: search } },
        { order: { orderNumber: { contains: search } } },
        { order: { customerName: { contains: search } } },
        { order: { customerEmail: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [totalPayments, paymentsRaw, paidTotalAgg, pendingTotalAgg] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerName: true,
              customerEmail: true,
              orderStatus: true,
              total: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
    ]);

    const formattedPayments = paymentsRaw.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order?.orderNumber || 'N/A',
      customerName: p.order?.customerName || 'Customer',
      customerEmail: p.order?.customerEmail || '',
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      status: p.status,
      razorpayOrderId: p.razorpayOrderId,
      razorpayPaymentId: p.razorpayPaymentId,
      orderStatus: p.order?.orderStatus || 'N/A',
      createdAt: p.createdAt,
    }));

    return jsonSuccess({
      payments: formattedPayments,
      summary: {
        totalPayments,
        totalPaidAmount: paidTotalAgg._sum.amount || 0,
        totalPendingAmount: pendingTotalAgg._sum.amount || 0,
      },
      pagination: {
        page,
        limit,
        total: totalPayments,
        totalPages: Math.ceil(totalPayments / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin payments:', error);
    return jsonError('Failed to fetch payment ledger from PostgreSQL.', 500);
  }
}
