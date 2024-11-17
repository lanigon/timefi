import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/components/telegram/provider"
import React from "react";
import { TelegramProvider } from "@/components/telegram/provider";
import Head from "next/head";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FreepayFi",
  description: "Freepay",
};

export const generateViewport = () => ({
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  userScalable: 'no',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
          className="flex min-h-screen w-full justify-center md:bg-primary-50"
        >            
          <TelegramProvider>
            {children}
          </TelegramProvider>
        </body>
    </html>

  );
}
