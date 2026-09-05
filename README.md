# VELYRA — Premium Indian D2C Skincare

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.11-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Vercel Blob](https://img.shields.io/badge/Vercel_Blob-Media_Storage-black?style=flat&logo=vercel)](https://vercel.com/docs/storage/vercel-blob)

> **VELYRA** is a luxury direct-to-consumer (D2C) skincare e-commerce platform designed for high-performance, climate-adaptive skincare in the Indian market. Built with an editorial aesthetic, ultra-fast performance, and a comprehensive headless backend.

---

## ✨ Features

- **Editorial Luxury Visual Identity**: Bespoke typography, warm travertine & warm ivory color palette, glassmorphism, and fluid micro-animations.
- **Hero Product Architecture**: Dedicated high-converting product detail page (PDP) for the launch hero: *Silk-Air Fluid Sunscreen SPF 50+ PA++++*.
- **Scalable D2C Catalog**: Extensible multi-product and routine bundles architecture (Sunscreen, Ceramide Cushion Cream, Amino Jelly Cleanser, Barrier Duo Set).
- **Interactive E-Commerce Experience**:
  - Interactive Texture & Finish Explorer (dewy, satin, matte comparison swatches).
  - UV Exposure & Climate Simulation Widget tailored for Indian UV index and urban humidity.
  - Slide-over Cart Drawer with free shipping threshold progress bar and dynamic INR discount engine.
  - One-page Checkout flow with live coupon validation (`VELYRA10`, `GLOW20`, `WELCOME15`) and COD / Razorpay simulation.
- **Media & Asset Management System**:
  - Direct integration with **Vercel Blob** (`@vercel/blob`) with structured storage paths (`brand/`, `products/[slug]/`, `editorial/`).
  - Full-featured **Admin Media Library** (`/admin/media`) supporting drag-and-drop uploads, instant URL copying, and folder filtering.
  - **Product Gallery Manager** (`/admin/products/[id]/images`) for reordering packshots, setting primary badges, and editing SEO alt text.
- **Admin Operations Dashboard**: Real-time sales telemetry, order tracking with status transitions, and inventory metrics.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom luxury design token palette
- **Database & ORM**: [Prisma](https://www.prisma.io/) (SQLite local with seamless PostgreSQL/Neon parity)
- **Media Storage**: [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.17+ or 20+
- npm, yarn, or pnpm

### 2. Installation
```bash
git clone https://github.com/heptley/Velyra.git
cd Velyra
npm install
```

### 3. Environment Variables
Create a `.env` file from the example template:
```bash
cp .env.example .env
```

Configure your credentials in `.env`:
```env
# Database
DATABASE_URL="file:./dev.db"

# Vercel Blob Media Storage (from Vercel Dashboard -> Storage -> velyra-media)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Next.js Base URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
```bash
npx prisma db push
node scripts/seed.js
node scripts/sync-concept-media.js
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to explore the store.

---

## 📁 Key Routes

| Route | Description |
|---|---|
| `/` | Luxury Brand Homepage with Hero Reveal, Routine Builder, and UGC |
| `/products` | Curated Collection Catalog & Product Grid |
| `/products/silk-air-fluid-sunscreen-spf50` | Hero Product Detail Page (PDP) with interactive 4-angle gallery |
| `/checkout` | High-conversion one-page checkout with coupon engine |
| `/admin` | Store operations, sales charts, and order management |
| `/admin/media` | Vercel Blob media library and asset uploader |
| `/admin/products/prod_sunscreen_01/images` | Packshot gallery manager & image reordering |

---

## 📄 License
Private & Proprietary — VELYRA Skincare. All rights reserved.
