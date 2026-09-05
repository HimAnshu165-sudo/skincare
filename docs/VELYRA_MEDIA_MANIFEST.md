# VELYRA MEDIA & VERCEL BLOB MANIFEST
*Version 1.0.0 — Production-Ready D2C Media System*

---

## 1. Vercel Blob Store Architecture
- **Store Name**: `velyra-media`
- **Access Level**: `public` (Public Edge CDN distribution for fast worldwide and Pan-India delivery)
- **SDK**: `@vercel/blob` (Official SDK with `put`, `del`, `list`, `head`)
- **Environment Token**: `BLOB_READ_WRITE_TOKEN` (Managed via Vercel Project Environment Variables; never exposed to browser)

---

## 2. Blob Logical Directory Hierarchy
All assets in Vercel Blob follow a structured namespace hierarchy:

```
velyra-media (Root)
├── brand/
│   ├── logo.svg
│   ├── logo-icon.svg
│   └── brand-monogram.webp
├── products/
│   ├── silk-air-fluid-sunscreen-spf50/
│   │   ├── main.jpg          (Primary Packshot)
│   │   ├── texture.jpg       (Macro Texture Swatch)
│   │   ├── lifestyle.jpg     (Editorial / Sunlight Atmosphere)
│   │   └── box.svg           (Embossed Outer Carton)
│   ├── ceramide-barrier-cushion-cream/
│   │   ├── main.jpg          (Frosted Jar Packshot)
│   │   └── texture.svg       (Soufflé Emulsion Swatch)
│   ├── amino-jelly-balancing-cleanser/
│   │   ├── main.jpg          (Pump Bottle Packshot)
│   │   └── texture.svg       (Micellar Jelly Swatch)
│   └── the-daily-defense-duo/
│       └── main.svg          (Set Presentation)
├── homepage/
│   └── hero-banner.webp
├── editorial/
│   └── clinic-laboratory.webp
└── icons/
    └── certifications/
```

---

## 3. Database Data Model (`ProductImage`)
Product media is decoupled from binary database storage. PostgreSQL stores the metadata and edge CDN URL:

```prisma
model ProductImage {
  id          String   @id @default(cuid())
  productId   String?
  product     Product? @relation(fields: [productId], references: [id], onDelete: Cascade)
  url         String   // Vercel Blob CDN URL
  pathname    String   // e.g. "products/silk-air-fluid-sunscreen-spf50/main.jpg"
  alt         String   // SEO Alt description
  sortOrder   Int      @default(0)
  isPrimary   Boolean  @default(false)
  width       Int?
  height      Int?
  size        Int?     // bytes
  contentType String?  // e.g. "image/jpeg", "image/webp"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 4. Admin Media Workflow

### A. Uploading New Images
1. Navigate to `/admin/media`
2. Select target folder (`products/`, `brand/`, `homepage/`, `editorial/`, `icons/`)
3. If uploading for a product, pick the product slug
4. Enter descriptive SEO alt text
5. Drag and drop single or multiple image files (JPEG, PNG, WebP, AVIF, SVG up to 12MB)
6. Assets are uploaded via `@vercel/blob` and metadata is automatically persisted in PostgreSQL.

### B. Managing Product Gallery
1. Navigate to `/admin/products/[productId]/images`
2. Reorder packshots and texture swatches with **Move Up / Move Down**
3. Set the primary storefront packshot using **Set as Primary**
4. Edit SEO alt text inline
5. Delete unwanted images (removes from Blob & Database simultaneously).

---

## 5. Adding a New Product
To launch a new skincare formulation (e.g. *Niacinamide Radiance Serum*):
1. Create the product record in the database or via `/api/admin/products`.
2. Navigate to `/admin/media`, select `products/` and product slug `niacinamide-radiance-serum`.
3. Upload `main.jpg`, `texture.jpg`, `lifestyle.jpg`.
4. Set the primary packshot.
5. The product immediately renders with high-resolution next/image optimization on:
   - `/products`
   - `/products/niacinamide-radiance-serum`
   - Shopping bag and checkout summary.
*Zero frontend code modifications required.*

---

## 6. Image Optimization & SEO Rules
- **Image Delivery**: Handled via `next/image` using configured remotePatterns for `*.public.blob.vercel-storage.com`.
- **LCP Optimization**: Primary PDP and Hero images use `priority={true}`.
- **Alt Text**: Descriptive, brand-aligned alt text (e.g. *"VELYRA Silk-Air Fluid Sunscreen SPF 50+ Bottle Shot"*).
