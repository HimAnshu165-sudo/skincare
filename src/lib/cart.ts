import { prisma } from './prisma';

export interface FormattedCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    mrp: number;
    volume: string;
    inStock: boolean;
    stockQuantity: number;
    image: string;
  };
}

export interface FormattedCart {
  id: string;
  userId: string | null;
  guestToken: string | null;
  items: FormattedCartItem[];
  itemCount: number;
  subtotal: number;
}

/**
 * Helper to extract primary image URL for product.
 */
function getProductPrimaryImage(product: any): string {
  if (product?.productImages && product.productImages.length > 0) {
    const primary = product.productImages.find((img: any) => img.isPrimary) || product.productImages[0];
    return primary.url;
  }
  if (product?.images) {
    try {
      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(images) && images.length > 0) return images[0];
    } catch {
      // fallback
    }
  }
  return '/products/sunscreen-hero.webp';
}

/**
 * Format raw Prisma Cart into sanitized, calculated cart model.
 */
export function formatCart(cart: any): FormattedCart {
  if (!cart) {
    return {
      id: '',
      userId: null,
      guestToken: null,
      items: [],
      itemCount: 0,
      subtotal: 0,
    };
  }

  let itemCount = 0;
  let subtotal = 0;

  const items: FormattedCartItem[] = (cart.items || []).map((item: any) => {
    const product = item.product;
    const price = product?.price || 0;
    const qty = Math.max(1, item.quantity || 1);
    itemCount += qty;
    subtotal += price * qty;

    const availableStock = product?.stockQuantity ?? 0;
    const isAvailable = Boolean(product?.inStock && availableStock > 0);

    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      quantity: qty,
      product: {
        id: product?.id || item.productId,
        name: product?.name || 'Product',
        slug: product?.slug || '',
        price,
        mrp: product?.mrp || 0,
        volume: product?.volume || '',
        inStock: isAvailable,
        stockQuantity: availableStock,
        image: getProductPrimaryImage(product),
      },
    };
  });

  return {
    id: cart.id,
    userId: cart.userId || null,
    guestToken: cart.guestToken || null,
    items,
    itemCount,
    subtotal,
  };
}

const CART_PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  mrp: true,
  volume: true,
  inStock: true,
  stockQuantity: true,
  images: true,
  productImages: {
    select: { url: true, alt: true, isPrimary: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' as const },
  },
};

/**
 * Get or create Cart in PostgreSQL for an authenticated user or guest token.
 */
export async function getOrCreateCart(userId?: string | null, guestToken?: string | null) {
  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: CART_PRODUCT_SELECT },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: { select: CART_PRODUCT_SELECT },
            },
          },
        },
      });
    }

    return cart;
  }

  if (guestToken) {
    let cart = await prisma.cart.findUnique({
      where: { guestToken },
      include: {
        items: {
          include: {
            product: { select: CART_PRODUCT_SELECT },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { guestToken },
        include: {
          items: {
            include: {
              product: { select: CART_PRODUCT_SELECT },
            },
          },
        },
      });
    }

    return cart;
  }

  return null;
}

/**
 * Add an item to cart with atomic stock validation.
 */
export async function addItemToCart(cartId: string, productId: string, quantity = 1) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stockQuantity: true, inStock: true, isUpcoming: true },
  });

  if (!product || !product.inStock || product.isUpcoming) {
    throw new Error('Product is unavailable or out of stock.');
  }

  if (product.stockQuantity <= 0) {
    throw new Error('Product is currently out of stock.');
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: { cartId, productId },
    },
  });

  const targetQuantity = (existing?.quantity || 0) + quantity;

  if (targetQuantity > product.stockQuantity) {
    throw new Error(`Only ${product.stockQuantity} units available in stock.`);
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: targetQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
      },
    });
  }

  return getCartById(cartId);
}

/**
 * Update item quantity with stock validation and ownership verification.
 */
export async function updateCartItemQuantity(cartId: string, cartItemIdOrProductId: string, quantity: number) {
  if (quantity <= 0) {
    return removeCartItem(cartId, cartItemIdOrProductId);
  }

  const item = await prisma.cartItem.findFirst({
    where: {
      cartId,
      OR: [
        { id: cartItemIdOrProductId },
        { productId: cartItemIdOrProductId },
      ],
    },
    include: { product: { select: { stockQuantity: true } } },
  });

  if (!item) {
    throw new Error('Cart item not found in your cart.');
  }

  if (quantity > item.product.stockQuantity) {
    throw new Error(`Only ${item.product.stockQuantity} units available in stock.`);
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  return getCartById(cartId);
}

/**
 * Remove an item from cart strictly scoped to the cart.
 */
export async function removeCartItem(cartId: string, cartItemIdOrProductId: string) {
  await prisma.cartItem.deleteMany({
    where: {
      cartId,
      OR: [
        { id: cartItemIdOrProductId },
        { productId: cartItemIdOrProductId },
      ],
    },
  });

  return getCartById(cartId);
}

/**
 * Clear all items in cart.
 */
export async function clearCart(cartId: string) {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  });

  return getCartById(cartId);
}

/**
 * Retrieve cart with all product details.
 */
export async function getCartById(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: { select: CART_PRODUCT_SELECT },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return formatCart(cart);
}

/**
 * Merge guest cart into authenticated customer cart upon login/signup transactionally.
 * Batched to execute with minimum network round trips.
 */
export async function mergeGuestCartIntoUserCart(guestToken: string, userId: string) {
  if (!guestToken || !userId) return;

  // Run in atomic transaction to prevent race conditions during concurrent merges
  await prisma.$transaction(async (tx) => {
    const guestCart = await tx.cart.findUnique({
      where: { guestToken },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      if (guestCart) {
        await tx.cart.delete({ where: { id: guestCart.id } }).catch(() => null);
      }
      return;
    }

    let userCart = await tx.cart.findUnique({
      where: { userId },
    });

    if (!userCart) {
      userCart = await tx.cart.create({
        data: { userId },
      });
    }

    const productIds = guestCart.items.map((i) => i.productId);

    // Batch fetch all products and existing user cart items in 2 parallel queries
    const [products, existingUserItems] = await Promise.all([
      tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stockQuantity: true, inStock: true },
      }),
      tx.cartItem.findMany({
        where: {
          cartId: userCart.id,
          productId: { in: productIds },
        },
      }),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const userItemMap = new Map(existingUserItems.map((ui) => [ui.productId, ui]));

    const itemOperations: Promise<any>[] = [];

    for (const guestItem of guestCart.items) {
      const product = productMap.get(guestItem.productId);
      if (!product || !product.inStock) continue;

      const userItem = userItemMap.get(guestItem.productId);

      if (userItem) {
        const mergedQty = Math.min(
          userItem.quantity + guestItem.quantity,
          product.stockQuantity
        );
        itemOperations.push(
          tx.cartItem.update({
            where: { id: userItem.id },
            data: { quantity: mergedQty },
          })
        );
      } else {
        const initialQty = Math.min(guestItem.quantity, product.stockQuantity);
        if (initialQty > 0) {
          itemOperations.push(
            tx.cartItem.create({
              data: {
                cartId: userCart.id,
                productId: guestItem.productId,
                quantity: initialQty,
              },
            })
          );
        }
      }
    }

    if (itemOperations.length > 0) {
      await Promise.all(itemOperations);
    }

    // Delete the guest cart items and guest cart in parallel
    await tx.cartItem.deleteMany({ where: { cartId: guestCart.id } });
    await tx.cart.delete({ where: { id: guestCart.id } });
  });
}
