import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { DemoBanner, SiteFooter, SiteHeader } from "@/components/shell";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const live = process.env.NEXT_PUBLIC_LIVE_BOOKING === "true";

export const metadata: Metadata = {
  title: {
    default: "Meridian · International flights",
    template: "%s · Meridian",
  },
  description: "Search, compare and book international flights. This deployment is a demonstration until airline and payment accounts are connected.",
  robots: live ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <DemoBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
