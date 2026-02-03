import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "n01.app | AI Development Agency",
  description: "We build intelligent solutions. AI-powered applications, blockchain integrations, and modern web experiences.",
  keywords: ["AI", "artificial intelligence", "web development", "blockchain", "Next.js", "React"],
  authors: [{ name: "n01.app" }],
  openGraph: {
    title: "n01.app | AI Development Agency",
    description: "We build intelligent solutions. AI-powered applications, blockchain integrations, and modern web experiences.",
    url: "https://n01.app",
    siteName: "n01.app",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "n01.app | AI Development Agency",
    description: "We build intelligent solutions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
