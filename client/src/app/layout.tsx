import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Mono } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D9488"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Movie Roulette for 2",
  description: "Can't agree on what to watch? Swipe through movies together and we'll decide your movie night.",
  openGraph: {
    title: "Movie Roulette for 2",
    description: "Can't agree on what to watch? Swipe through movies together and we'll decide your movie night.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Movie Roulette for 2 — swipe, match, watch",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Movie Roulette for 2",
    description: "Can't agree on what to watch? Swipe through movies together and we'll decide your movie night.",
    images: ["/og-image.png"],
  },
};