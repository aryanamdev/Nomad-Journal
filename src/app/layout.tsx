import type { Metadata } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/source-serif-4/opsz.css";
import "@fontsource-variable/source-serif-4/opsz-italic.css";
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
        className="antialiased"
      >
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { background: "#1d2b36", color: "#fbfcf8", borderRadius: 6, fontSize: 14 },
          }}
        />
        {children}
      </body>
    </html>
  );
}
