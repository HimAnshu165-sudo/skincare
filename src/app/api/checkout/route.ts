import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 70;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      items,
      couponCode,
    } = body;

    // Server-side validation
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !shippingAddress ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required order details.' },
        { status: 400 }
      );
    }

    // Recalculate price server-side from DB
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.inStock) {
        return NextResponse.json(
          {
            success: false,
            message: `Product ${item.productName || 'in cart'} is currently out of stock.`,
          },
          { status: 400 }
        );
      }

      calculatedSubtotal += product.price * item.quantity;
      validatedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        volume: product.volume,
      });
    }

    // Recalculate discount
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive) {
        if (!coupon.minOrderValue || calculatedSubtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
          } else {
            discount = coupon.discountValue;
          }
        }
      }
    }

    const shippingFee =
      calculatedSubtotal === 0 || calculatedSubtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : STANDARD_SHIPPING_FEE;
    const calculatedTotal = Math.max(0, calculatedSubtotal - discount + shippingFee);

    // Generate human-readable Indian order ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `VEL-${randomSuffix}`;

    // Create Order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
        orderStatus: 'PLACED',
        subtotal: calculatedSubtotal,
        discount,
        shippingFee,
        total: calculatedTotal,
        couponCode: couponCode || null,
        items: {
          create: validatedItems.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
            volume: i.volume,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        items: order.items,
      },
    });
  } catch (error: any) {
    console.error('Error creating checkout order:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing order.' },
      { status: 500 }
    );
  }
}
