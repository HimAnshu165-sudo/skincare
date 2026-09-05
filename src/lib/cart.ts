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
  if (product.productImages && product.productImages.length > 0) {
    const primary = product.productImages.find((img: any) => img.isPrimary) || product.productImages[0];
    return primary.url;
  }
  if (product.images) {
    const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    if (images && images.length > 0) return images[0];
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
    itemCount += item.quantity;
    subtotal += (product?.price || 0) * item.quantity;

    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: product?.id || item.productId,
        name: product?.name || 'Product',
        slug: product?.slug || '',
        price: product?.price || 0,
        mrp: product?.mrp || 0,
        volume: product?.volume || '',
        inStock: product?.inStock ?? true,
        stockQuantity: product?.stockQuantity ?? 100,
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
            product: {
              include: { productImages: { orderBy: { sortOrder: 'asc' } } },
            },
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
              product: {
                include: { productImages: { orderBy: { sortOrder: 'asc' } } },
              },
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
            product: {
              include: { productImages: { orderBy: { sortOrder: 'asc' } } },
            },
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
              product: {
                include: { productImages: { orderBy: { sortOrder: 'asc' } } },
              },
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
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || !product.inStock || product.isUpcoming) {
    throw new Error('Product is unavailable or out of stock.');
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
 * Update item quantity with stock validation.
 */
export async function updateCartItemQuantity(cartId: string, cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeCartItem(cartId, cartItemId);
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId },
    include: { product: true },
  });

  if (!item) {
    throw new Error('Cart item not found.');
  }

  if (quantity > item.product.stockQuantity) {
    throw new Error(`Only ${item.product.stockQuantity} units available in stock.`);
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return getCartById(cartId);
}

/**
 * Remove an item from cart.
 */
export async function removeCartItem(cartId: string, cartItemId: string) {
  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, cartId },
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
          product: {
            include: { productImages: { orderBy: { sortOrder: 'asc' } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return formatCart(cart);
}

/**
 * Merge guest cart into authenticated customer cart upon login/signup.
 */
export async function mergeGuestCartIntoUserCart(guestToken: string, userId: string) {
  if (!guestToken || !userId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { guestToken },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await getOrCreateCart(userId);
  if (!userCart) return;

  for (const guestItem of guestCart.items) {
    const product = await prisma.product.findUnique({
      where: { id: guestItem.productId },
    });

    if (!product || !product.inStock) continue;

    const userItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: userCart.id,
          productId: guestItem.productId,
        },
      },
    });

    if (userItem) {
      const mergedQty = Math.min(
        userItem.quantity + guestItem.quantity,
        product.stockQuantity
      );
      await prisma.cartItem.update({
        where: { id: userItem.id },
        data: { quantity: mergedQty },
      });
    } else {
      const initialQty = Math.min(guestItem.quantity, product.stockQuantity);
      if (initialQty > 0) {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: guestItem.productId,
            quantity: initialQty,
          },
        });
      }
    }
  }

  // Delete guest cart after successful merge
  await prisma.cart.delete({
    where: { id: guestCart.id },
  }).catch(() => null);
}
