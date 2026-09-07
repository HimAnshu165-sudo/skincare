import { prisma } from './prisma';

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 70;

export interface CreateOrderParams {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  paymentMethod: 'ONLINE' | 'COD';
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  couponCode?: string | null;
  notes?: string | null;
}

/**
 * Transactional Order Placement with Server-Side Recalculation and Stock Control.
 */
export async function createOrder(params: CreateOrderParams) {
  const {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    paymentMethod,
    items,
    couponCode,
    notes,
  } = params;

  if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || items.length === 0) {
    throw new Error('Incomplete order information.');
  }

  // Execute in atomic Prisma transaction
  return await prisma.$transaction(async (tx) => {
    let calculatedSubtotal = 0;
    const validatedItems = [];

    const validItems = items.filter((i) => i.quantity > 0);
    const productIds = validItems.map((i) => i.productId);

    // Batch fetch all ordered products in 1 query
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      include: { productImages: { orderBy: { sortOrder: 'asc' } } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of validItems) {
      const product = productMap.get(item.productId);

      if (!product || !product.inStock || product.isUpcoming) {
        throw new Error(`Product "${product?.name || 'Selected item'}" is currently unavailable.`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Only ${product.stockQuantity} remaining.`);
      }

      // Concurrency-safe atomic inventory decrement: strictly decrements by exact item.quantity
      const updateResult = await tx.product.updateMany({
        where: {
          id: product.id,
          stockQuantity: { gte: item.quantity },
        },
        data: {
          stockQuantity: { decrement: item.quantity },
        },
      });

      if (updateResult.count === 0) {
        throw new Error(`Insufficient stock for "${product.name}". The requested quantity is no longer available.`);
      }

      // Synchronize inStock flag based on authoritative post-decrement database quantity
      const updatedProduct = await tx.product.findUnique({
        where: { id: product.id },
        select: { stockQuantity: true },
      });

      if (updatedProduct && updatedProduct.stockQuantity <= 0) {
        await tx.product.update({
          where: { id: product.id },
          data: { inStock: false },
        });
      }

      // Resolve primary image for snapshot
      let imgUrl = '/products/sunscreen-hero.webp';
      if (product.productImages && product.productImages.length > 0) {
        imgUrl = product.productImages[0].url;
      } else if (product.images) {
        const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        if (parsed.length > 0) imgUrl = parsed[0];
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productSku: product.sku,
        imageUrl: imgUrl,
        quantity: item.quantity,
        price: product.price,
        volume: product.volume,
      });
    }

    if (validatedItems.length === 0) {
      throw new Error('No valid items in order.');
    }

    // Server-side discount calculation
    let discount = 0;
    if (couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
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

    // Shipping calculation
    const shippingFee =
      calculatedSubtotal >= FREE_SHIPPING_THRESHOLD || calculatedSubtotal === 0
        ? 0
        : STANDARD_SHIPPING_FEE;
    const grandTotal = Math.max(0, calculatedSubtotal - discount + shippingFee);

    // Human-readable Order ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `VEL-${randomSuffix}`;

    // Create Order with immutable snapshot
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod,
        paymentStatus: 'PENDING',
        orderStatus: paymentMethod === 'COD' ? 'CONFIRMED' : 'PLACED',
        subtotal: calculatedSubtotal,
        discount,
        shippingFee,
        total: grandTotal,
        couponCode: couponCode || null,
        notes: notes || null,
        items: {
          create: validatedItems,
        },
        statusHistory: {
          create: [
            {
              status: 'PLACED',
              title: 'Order Placed',
              description: `Order received via ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}.`,
            },
            ...(paymentMethod === 'COD'
              ? [
                  {
                    status: 'CONFIRMED',
                    title: 'Order Confirmed',
                    description: 'Cash on Delivery order verified and dispatched to fulfillment.',
                  },
                ]
              : []),
          ],
        },
        payments: {
          create: [
            {
              amount: grandTotal,
              currency: 'INR',
              method: paymentMethod,
              status: 'PENDING',
            },
          ],
        },
      },
      include: {
        items: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Clear user cart if authenticated
    if (userId) {
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    }

    return order;
  }, {
    maxWait: 10000,
    timeout: 20000,
  });
}

/**
 * Fetch orders for authenticated customer.
 */
export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      payments: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Fetch a single order for authenticated user with strict IDOR verification.
 */
export async function getUserOrderById(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderId, userId },
        { orderNumber: orderId, userId },
      ],
    },
    include: {
      items: true,
      payments: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });

  return order;
}

/**
 * Fetch order for public tracking by Order Number or Phone (Guest or Auth).
 */
export async function getOrderForTracking(query: string) {
  const trimmed = query.trim();
  return prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: { equals: trimmed } },
        { id: { equals: trimmed } },
        { customerPhone: { equals: trimmed } },
      ],
    },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });
}
