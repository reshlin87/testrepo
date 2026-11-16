import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", weight: ["400", "500"], display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Shuga", template: "%s · Shuga" },
  description: "Gentle, simple diabetes tracking for South Africans — sugar, meals and mood, shared on WhatsApp.",
  applicationName: "Shuga",
  appleWebApp: { capable: true, title: "Shuga", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e9" },
    { media: "(prefers-color-scheme: dark)", color: "#131815" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
