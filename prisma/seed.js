const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VELYRA database...');

  // Clear existing records
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  // 1. Seed Products
  const products = [
    {
      id: 'prod_sunscreen_01',
      name: 'Silk-Air Fluid Sunscreen SPF 50+ PA++++',
      slug: 'silk-air-fluid-sunscreen-spf50',
      tagline: 'Weightless broad-spectrum protection crafted for Indian humidity.',
      description: 'An ultra-refined, invisible fluid sunscreen engineered with next-generation UV filters. Dissolves instantaneously into skin with zero white cast, greasy residue, or eye stinging. Infused with Niacinamide and Indian Centella Asiatica to soothe heat stress and reinforce the skin barrier under intense tropical sun.',
      price: 899.0,
      mrp: 1099.0,
      inStock: true,
      stockQuantity: 250,
      sku: 'VEL-SUN-50ML',
      volume: '50 ml / 1.69 fl. oz.',
      spfRating: 'SPF 50+ • PA++++',
      finish: 'Invisible Velvet Dew',
      skinType: 'All Skin Types • Acne-Safe • Humidity-Resistant',
      images: JSON.stringify([
        '/products/sunscreen-hero.webp',
        '/products/sunscreen-texture.webp',
        '/products/sunscreen-lifestyle.webp',
        '/products/sunscreen-box.webp'
      ]),
      benefits: JSON.stringify([
        'Broad Spectrum UVA + UVB + Blue Light Shield',
        'Completely Invisible — Zero White Cast on all Indian Fitzpatrick skin tones',
        'Sweat & Humidity Resistant without clogging pores',
        'Calms sun-induced erythema & heat redness with Centella Asiatica',
        'Primes skin with a smooth velvet-dew finish for makeup or bare skin'
      ]),
      keyIngredients: JSON.stringify([
        { name: 'Tinosorb S & Uvinul A Plus', benefit: 'Photostable, ultra-modern organic UV filters that do not degrade or sting eyes.' },
        { name: '2% Pure Niacinamide', benefit: 'Controls sebum, minimizes enlarged pores, and prevents sun-induced hyperpigmentation.' },
        { name: 'Indian Centella Asiatica (Gotu Kola)', benefit: 'Potent botanical antioxidant that calms inflammation and strengthens skin barrier.' },
        { name: 'Hyaluronic Acid Complex', benefit: 'Delivers micro-hydration without heavy occlusion or stickiness.' }
      ]),
      fullIngredients: 'Aqua, Diethylamino Hydroxybenzoyl Hexyl Benzoate (Uvinul A Plus), Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine (Tinosorb S), Ethylhexyl Triazone, Niacinamide, Glycerin, Caprylic/Capric Triglyceride, Centella Asiatica Leaf Extract, Sodium Hyaluronate, Camellia Sinensis (Green Tea) Leaf Extract, Allantoin, Silica, Tocopherol (Vitamin E), Polyacrylate Crosspolymer-6, Phenoxyethanol, Ethylhexylglycerin.',
      howToUse: 'Dispense two finger-lengths of fluid onto clean fingertips. Gently press and smooth across face, neck, and ears as the final step of your morning skincare routine, 15 minutes before sun exposure. Reapply every 2-3 hours during prolonged sun exposure.',
      isFeatured: true,
      isUpcoming: false,
      category: 'Sunscreens'
    },
    {
      id: 'prod_moisturizer_02',
      name: 'Ceramide Barrier Cushion Cream',
      slug: 'ceramide-barrier-cushion-cream',
      tagline: 'Deep lipid restoration in a featherlight soufflé texture.',
      description: 'A barrier-replenishing moisture emulsion formulated with 5 essential ceramides, squalane, and oat extract. Replenishes moisture loss caused by air conditioning and pollution without feeling heavy.',
      price: 949.0,
      mrp: 1199.0,
      inStock: true,
      stockQuantity: 150,
      sku: 'VEL-CRM-50ML',
      volume: '50 ml / 1.69 fl. oz.',
      spfRating: null,
      finish: 'Soft Satin Cloud',
      skinType: 'Dry to Combination • Compromised Barrier',
      images: JSON.stringify([
        '/products/moisturizer-hero.webp',
        '/products/moisturizer-texture.webp'
      ]),
      benefits: JSON.stringify([
        'Restores skin lipid balance with 5 skin-identical ceramides',
        '24-Hour continuous moisture barrier defense',
        'Non-greasy, fast-absorbing cloud texture'
      ]),
      keyIngredients: JSON.stringify([
        { name: '5 Essential Ceramides (EOP, NP, AP, AS, NS)', benefit: 'Repairs the natural cellular matrix and locks in moisture.' },
        { name: 'Plant Squalane', benefit: 'Mimics natural skin sebum for weightless softening.' }
      ]),
      fullIngredients: 'Aqua, Squalane, Glycerin, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Avena Sativa (Oat) Kernel Extract, Carbomer, Sodium Hyaluronate, Ethylhexylglycerin.',
      howToUse: 'Warm a pea-sized amount between palms and gently press onto damp face and neck morning and evening.',
      isFeatured: false,
      isUpcoming: true,
      category: 'Moisturizers'
    },
    {
      id: 'prod_cleanser_03',
      name: 'Amino Jelly Balancing Cleanser',
      slug: 'amino-jelly-balancing-cleanser',
      tagline: 'Gentle low-pH gel that removes pollution without stripping.',
      description: 'A sulfate-free jelly cleanser formulated with apple amino acids, panthenol, and green tea. Sweeps away excess sebum, dust, and light sunscreen while leaving skin soft, hydrated, and calm.',
      price: 649.0,
      mrp: 799.0,
      inStock: true,
      stockQuantity: 180,
      sku: 'VEL-CLN-120ML',
      volume: '120 ml / 4.05 fl. oz.',
      spfRating: null,
      finish: 'Rinses Clean • Zero Tightness',
      skinType: 'All Skin Types • Sensitive & Acne-Prone',
      images: JSON.stringify([
        '/products/cleanser-hero.webp',
        '/products/cleanser-texture.webp'
      ]),
      benefits: JSON.stringify([
        'pH 5.5 balanced to protect acid mantle',
        'Transforms from soothing jelly to micro-foam',
        'Leaves zero residue or tight dry feeling'
      ]),
      keyIngredients: JSON.stringify([
        { name: 'Apple Amino Acid Surfactants', benefit: 'Ultra-mild cleansing agents derived from apples.' },
        { name: 'Panthenol (Pro-Vitamin B5)', benefit: 'Attracts water and calms skin during cleansing.' }
      ]),
      fullIngredients: 'Aqua, Sodium Cocoyl Apple Amino Acids, Glycerin, Panthenol, Camellia Sinensis (Green Tea) Extract, Coco-Glucoside, Xanthan Gum, Citric Acid, Phenoxyethanol.',
      howToUse: 'Massage 1-2 pumps onto damp face for 60 seconds in circular motions. Rinse thoroughly with lukewarm water.',
      isFeatured: false,
      isUpcoming: true,
      category: 'Cleansers'
    },
    {
      id: 'prod_duo_04',
      name: 'The Daily Defense Duo: Sunscreen + Cleanser',
      slug: 'the-daily-defense-duo',
      tagline: 'The essential morning shield and evening reset ritual.',
      description: 'Pairing the Silk-Air Fluid Sunscreen SPF 50+ with the Amino Jelly Cleanser for comprehensive daily photoprotection and gentle evening removal.',
      price: 1399.0,
      mrp: 1748.0,
      inStock: true,
      stockQuantity: 90,
      sku: 'VEL-SET-DUO',
      volume: '50ml + 120ml',
      spfRating: 'SPF 50+ PA++++',
      finish: 'Complete Daily Ritual',
      skinType: 'All Skin Types',
      images: JSON.stringify([
        '/products/set-duo-hero.webp',
        '/products/sunscreen-hero.webp'
      ]),
      benefits: JSON.stringify([
        'Comprehensive 2-step daily skincare routine',
        'Saves ₹349 vs purchasing separately',
        'Includes complimentary travel pouch'
      ]),
      keyIngredients: JSON.stringify([
        { name: 'Sunscreen UV Shield', benefit: 'Tinosorb S + Uvinul A Plus photostable protection.' },
        { name: 'Cleanser Amino Matrix', benefit: 'Gentle micellar surfactant rinse.' }
      ]),
      fullIngredients: 'See individual product listings for complete ingredient profiles.',
      howToUse: 'Use Amino Jelly Cleanser to start your day, follow with Silk-Air Sunscreen. Repeat cleanser in the evening.',
      isFeatured: false,
      isUpcoming: true,
      category: 'Sets'
    }
  ];

  for (const prod of products) {
    await prisma.product.create({ data: prod });
  }
  console.log(`Created ${products.length} products.`);

  // 2. Seed Coupons
  const coupons = [
    {
      code: 'VELYRA10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 500,
      isActive: true,
    },
    {
      code: 'FIRSTGLOW',
      discountType: 'FIXED',
      discountValue: 150,
      minOrderValue: 800,
      isActive: true,
    },
    {
      code: 'FREESHIP',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderValue: 499,
      isActive: true,
    }
  ];

  for (const coupon of coupons) {
    await prisma.coupon.create({ data: coupon });
  }
  console.log(`Created ${coupons.length} coupons.`);

  // 3. Seed Demo Order for tracking test
  const demoOrder = await prisma.order.create({
    data: {
      orderNumber: 'VEL-98241',
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav.sharma@example.com',
      customerPhone: '9876543210',
      shippingAddress: JSON.stringify({
        address: '402, Lotus Grandeur, Veera Desai Road',
        apartment: 'Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053'
      }),
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      orderStatus: 'SHIPPED',
      subtotal: 899.0,
      discount: 0,
      shippingFee: 0,
      total: 899.0,
      couponCode: null,
      trackingNumber: 'DEL-VEL-892193',
      courierName: 'Delhivery Express Air',
      items: {
        create: [
          {
            productId: 'prod_sunscreen_01',
            productName: 'Silk-Air Fluid Sunscreen SPF 50+ PA++++',
            quantity: 1,
            price: 899.0,
            volume: '50 ml / 1.69 fl. oz.'
          }
        ]
      }
    }
  });
  console.log('Created demo tracking order:', demoOrder.orderNumber);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
