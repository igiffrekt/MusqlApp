import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { PWARegistration } from "@/components/pwa/PWARegistration";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Musql - Edzésmenedzsment",
  description: "Edzésmenedzsment rendszer harcművészeti és fitness edzőknek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D2F159" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Musql" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <Providers>
          {children}
          <PWAInstallPrompt />
          <PWARegistration />
        </Providers>
      </body>
    </html>
  );
}
