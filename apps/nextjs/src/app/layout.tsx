"use client";

import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { client } from "@/sanity/client";
import { urlForImage } from "@/sanity/image";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import ScrollToTop from "@/components/scrolltotop";
import AccentColor from "@/components/accentcolor";

interface Settings {
  websiteName: string;
  favicon: {
    asset: {
      _ref: string;
    };
  };
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await client.fetch<Settings>(`
          *[_type == "settings"][0] {
            websiteName,
            favicon
          }
        `);
        setSettings(data);
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchSettings();
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="darkreader-lock" />
        {settings?.favicon && (
          <link 
            rel="shortcut icon" 
            href={urlForImage(settings?.favicon)?.url() || "/favicon.ico"} 
          />
        )}
        <link rel="alternate" type="application/rss+xml" 
          title={`${settings?.websiteName || '...'} RSS Feed`}
          href="/feed.rss" />
        <title>{settings?.websiteName || '...'}</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <Navigation />
        <main className="container mx-auto min-h-screen max-w-4xl p-8 flex flex-col gap-4">
          <div className="prose">
            {children}
          </div>
        </main>
        <Footer />
        <ScrollToTop />
        <AccentColor />
      </body>
    </html>
  );
}
