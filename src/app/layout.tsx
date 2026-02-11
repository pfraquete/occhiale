import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { CookieBanner } from "@/components/lgpd/cookie-banner";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Occhiale - Plataforma Inteligente para Óticas",
    template: "%s | Occhiale",
  },
  description:
    "Plataforma SaaS premium para óticas brasileiras. E-commerce inteligente, agente de vendas IA via WhatsApp, CRM ótico preditivo e provador virtual AR.",
  keywords: [
    "ótica",
    "óculos",
    "lentes",
    "e-commerce ótica",
    "provador virtual",
    "óculos online",
  ],
  authors: [{ name: "Occhiale" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Occhiale",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <CookieBanner />
        <Suspense fallback={null}>
          <PostHogProvider />
        </Suspense>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
