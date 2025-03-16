"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavigationSanity } from "@/components/navigation-sanity";
import { Footer } from "@/components/footer";
import ScrollToTop from "@/components/scrolltotop";
import { useEffect } from "react";
import Lenis from "lenis";
import AccentColor from "@/components/accentcolor";

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
  useEffect(() => {
    new Lenis({
      autoRaf: true,
    });
  }, []);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <NavigationSanity />
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
