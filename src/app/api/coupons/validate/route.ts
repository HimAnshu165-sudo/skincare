import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`coupon:validate:ip:${ip}`, 15, 60000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetSeconds, 'Too many coupon validation attempts. Please try again later.');
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ valid: false, message: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { code, subtotal } = body || {};
    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Please provide a coupon code.' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired coupon code.' },
        { status: 404 }
      );
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          valid: false,
          message: `This coupon requires a minimum cart value of ₹${coupon.minOrderValue}.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
      },
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { valid: false, message: 'Server error validating coupon.' },
      { status: 500 }
    );
  }
}
