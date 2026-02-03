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
          className="flex items-center gap-2"
        >
          <Image 
            src="/logo.png" 
            alt="n01.app" 
            width={36} 
            height={36} 
            className="rounded-lg"
          />
          <span className={`text-xl font-semibold tracking-tight transition-colors ${
            scrolled ? "text-foreground" : "text-white"
          }`}>
            n01<span className="text-accent">.app</span>
          </span>
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
            Services
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
