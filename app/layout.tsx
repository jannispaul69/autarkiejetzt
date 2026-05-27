import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Autarkie Jetzt – Kostenlose Solar-Beratung",
  description:
    "In 60 Sekunden zur kostenfreien Solar-Beratung von geprüften Fachbetrieben aus deiner Region. Unverbindlich, DSGVO-konform.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://autarkiejetzt.de"
  ),
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        {children}
        <Toaster richColors position="top-center" />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
