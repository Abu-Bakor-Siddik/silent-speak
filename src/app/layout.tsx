'use client'
import { useEffect } from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

useEffect(() => {
  const stored = localStorage.getItem('silent-speak-storage')

  if (!stored) return

  const parsed = JSON.parse(stored)

  if (!parsed?.state?.currentUser) {
    window.location.href = '/login'
  }
}, [])

export const metadata: Metadata = {
  title: "SilentSpeak - Accessible Learning Platform",
  description:
    "An accessible learning platform designed for everyone. Real-time captions, text-to-speech, quick communication, and more — all built with accessibility at the core.",
  keywords: [
    "SilentSpeak",
    "accessible learning",
    "accessibility",
    "education",
    "text-to-speech",
    "speech-to-text",
    "live captions",
    "inclusive education",
    "disability",
    "color blind",
    "dyslexia",
  ],
  authors: [{ name: "SilentSpeak Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SilentSpeak - Accessible Learning Platform",
    description:
      "An accessible learning platform designed for everyone. Real-time captions, TTS, and quick communication.",
    type: "website",
    siteName: "SilentSpeak",
  },
  twitter: {
    card: "summary_large_image",
    title: "SilentSpeak - Accessible Learning Platform",
    description:
      "An accessible learning platform designed for everyone.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dyslexia-friendly font via Google Fonts CDN fallback */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Lexend:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
