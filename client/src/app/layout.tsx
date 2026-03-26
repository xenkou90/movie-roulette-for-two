import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Movie ROuletter for 2",
  description: "Swipe. Match. Watch.",
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