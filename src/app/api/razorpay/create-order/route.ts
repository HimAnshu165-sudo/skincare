import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

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
      items,
      couponCode,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing order details.' },
        { status: 400 }
      );
    }

    // Server-side recalculations
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId || item.id },
      });

      if (!product || !product.inStock) {
        return NextResponse.json(
          {
            success: false,
            message: `Product ${item.name || 'in cart'} is currently out of stock.`,
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

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `VEL-${randomSuffix}`;

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // If live credentials are placeholder, use reliable verified test flow
    const isSimulation = !keyId || keyId.includes('placeholder');

    let razorpayOrder = null;
    if (!isSimulation) {
      try {
        const instance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        razorpayOrder = await instance.orders.create({
          amount: Math.round(calculatedTotal * 100), // in paise
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            customerName,
            customerEmail,
          },
        });
      } catch (rzpErr) {
        console.error('Razorpay API error, falling back to simulation:', rzpErr);
      }
    }

    // Create Order Record in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod: 'ONLINE',
        paymentStatus: isSimulation ? 'PAID' : 'PENDING',
        orderStatus: 'PLACED',
        subtotal: calculatedSubtotal,
        discount,
        shippingFee,
        total: calculatedTotal,
        couponCode: couponCode || null,
        razorpayOrderId: razorpayOrder ? razorpayOrder.id : `sim_rzp_${Date.now()}`,
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
      isSimulation: isSimulation || !razorpayOrder,
      keyId,
      razorpayOrder,
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
    console.error('Error in razorpay create-order:', error);
    return NextResponse.json(
      { success: false, message: 'Server error creating payment order.' },
      { status: 500 }
    );
  }
}
