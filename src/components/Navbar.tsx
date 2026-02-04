"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/95 backdrop-blur-md border-b border-foreground/10" 
          : "bg-transparent border-b border-white/10"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 group"
        >
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="n01.app" 
              width={42} 
              height={42} 
              className="rounded-xl transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-xl bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="#services" 
            className={`hidden sm:block text-sm transition-colors ${
              scrolled 
                ? "text-muted hover:text-foreground" 
                : "text-white/70 hover:text-white"
            }`}
          >
            How it works
          </Link>
          <Link 
            href="#team" 
            className={`hidden sm:block text-sm transition-colors ${
              scrolled 
                ? "text-muted hover:text-foreground" 
                : "text-white/70 hover:text-white"
            }`}
          >
            Team
          </Link>
          <Link 
            href="#work" 
            className={`hidden sm:block text-sm transition-colors ${
              scrolled 
                ? "text-muted hover:text-foreground" 
                : "text-white/70 hover:text-white"
            }`}
          >
            Work
          </Link>
          <Link 
            href="/pricing" 
            className={`hidden sm:block text-sm font-medium transition-colors ${
              scrolled 
                ? "text-accent hover:text-accent/80" 
                : "text-accent hover:text-accent/80"
            }`}
          >
            Pricing
          </Link>
          <ThemeToggle />
          <Link 
            href="#contact" 
            className={`text-sm px-4 py-2 rounded-full transition-all ${
              scrolled 
                ? "bg-foreground text-background hover:opacity-90" 
                : "bg-white text-black hover:bg-white/90"
            }`}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
