import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const siteUrl =
  process.env.DOMAIN || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Nomad Journal", template: "%s · Nomad Journal" },
  description: "A travel journal for your stories, places, moods and weather, viewable as a list, calendar or map.",
  openGraph: {
    title: "Nomad Journal",
    description: "Remember every trip, not just the photos.",
    images: ["/screenshots/dashboard.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Toaster position="bottom-center" />
        {children}
      </body>
    </html>
  );
}
