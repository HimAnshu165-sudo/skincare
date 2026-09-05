import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://velyra.in'),
  title: {
    default: "VELYRA — Elevated D2C Skincare & Photoprotection for India",
    template: "%s | VELYRA Skincare"
  },
  description: "Dermatologist-formulated photoprotection and barrier restoration crafted for Indian climates. Weightless, invisible, zero white cast sunscreens with modern European UV filters.",
  keywords: [
    "VELYRA", "Indian sunscreen", "sunscreen for Indian skin", "zero white cast sunscreen",
    "SPF 50 PA++++", "Tinosorb S sunscreen", "lightweight sunscreen India", "D2C skincare India"
  ],
  authors: [{ name: "VELYRA Skincare Essentials" }],
  creator: "VELYRA",
  publisher: "VELYRA Skincare Essentials",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://velyra.in",
    siteName: "VELYRA",
    title: "VELYRA — Everyday Protection, Elevated.",
    description: "Weightless broad-spectrum protection crafted specifically for Indian climates. Zero white cast, zero eye stinging.",
    images: [
      {
        url: "/products/sunscreen-hero.webp",
        width: 1200,
        height: 630,
        alt: "VELYRA Silk-Air Fluid Sunscreen SPF 50+",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VELYRA — Elevated D2C Skincare for India",
    description: "Everyday protection elevated. Dermatologist-formulated with next-generation UV filters.",
    images: ["/products/sunscreen-hero.webp"],
  },
  icons: {
    icon: "/brand/logo-icon.svg",
    apple: "/brand/logo-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VELYRA Skincare",
    "url": "https://velyra.in",
    "logo": "https://velyra.in/brand/logo.svg",
    "description": "Elevated D2C Skincare & Photoprotection formulated for Indian climates.",
    "sameAs": [
      "https://instagram.com/velyra.skin",
      "https://facebook.com/velyra.skin"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+919876543210",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    }
  };

  return (
    <html lang="en" className="bg-surface-base text-brand-charcoal">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        {/* Razorpay Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        {/* Google Analytics 4 Script */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-surface-base text-brand-charcoal antialiased selection:bg-brand-sand selection:text-brand-charcoal">
        <AuthProvider>
          <CartProvider>
            <AnnouncementBar />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <WhatsAppButton />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
