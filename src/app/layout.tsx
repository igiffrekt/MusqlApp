import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { PWARegistration } from "@/components/pwa/PWARegistration";
import { Providers } from "@/components/providers";
import { UpgradePromptGlobal } from "@/components/UpgradePrompt";

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

export const viewport: Viewport = {
  themeColor: "#D2F159",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://musql.app"),
  title: {
    default: "Musql - Edzésmenedzsment rendszer",
    template: "%s | Musql",
  },
  description: "Modern edzésmenedzsment szoftver harcművészeti egyesületeknek, jógastúdióknak és személyi edzőknek. Órarend, jelenlét, fizetések egy helyen.",
  keywords: ["edzésmenedzsment", "személyi edző", "harcművészet", "jóga", "fitness", "órarend", "jelenlét", "fizetés", "szoftver", "app"],
  authors: [{ name: "Musql" }],
  creator: "Musql",
  publisher: "Musql",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "https://musql.app",
    siteName: "Musql",
    title: "Musql - Edzésmenedzsment rendszer",
    description: "Modern edzésmenedzsment szoftver harcművészeti egyesületeknek, jógastúdióknak és személyi edzőknek.",
    images: [
      {
        url: "/img/musql_logo.png",
        width: 1200,
        height: 630,
        alt: "Musql - Edzésmenedzsment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Musql - Edzésmenedzsment rendszer",
    description: "Modern edzésmenedzsment szoftver harcművészeti egyesületeknek, jógastúdióknak és személyi edzőknek.",
    images: ["/img/musql_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/pwa-icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://musql.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Musql" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <Providers>
          {children}
          <PWAInstallPrompt />
          <PWARegistration />
          <UpgradePromptGlobal />
        </Providers>
      </body>
    </html>
  );
}
