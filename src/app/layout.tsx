import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "POL Sandbox Dashboard - Enhanced Wallet Connection",
  description: "Protocol-Owned Liquidity Strategy Platform with intelligent wallet connection and price influence capabilities",
  keywords: ["POL", "Sandbox", "DeFi", "Wallet", "Blockchain", "Price Influence"],
  authors: [{ name: "POL Sandbox Team" }],
  openGraph: {
    title: "POL Sandbox Dashboard",
    description: "Intelligent wallet connection and price influence platform",
    url: "https://pol-sandbox.com",
    siteName: "POL Sandbox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "POL Sandbox Dashboard",
    description: "Intelligent wallet connection and price influence platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
