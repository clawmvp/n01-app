import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalChat from "@/components/GlobalChat";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://n01.app"),
  title: "n01.app | AI Development Agency",
  description: "We build intelligent solutions. AI-powered applications, blockchain integrations, and modern web experiences.",
  keywords: ["AI", "artificial intelligence", "web development", "blockchain", "Next.js", "React"],
  authors: [{ name: "n01.app" }],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "n01.app | AI Development Agency",
    description: "We build intelligent solutions. AI-powered applications, blockchain integrations, and modern web experiences.",
    url: "https://n01.app",
    siteName: "n01.app",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "n01.app - AI Development Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "n01.app | AI Development Agency",
    description: "We build intelligent solutions.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <GlobalChat />
      </body>
    </html>
  );
}
