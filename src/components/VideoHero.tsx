"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax: video moves slower than scroll
  const parallaxOffset = scrollY * 0.5;
  const opacity = Math.max(0, 1 - scrollY / 700);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: `translateY(${parallaxOffset}px)`,
          willChange: 'transform'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute w-full h-full object-cover scale-110"
          poster="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1920"
        >
          {/* AI/Tech themed video from Pexels */}
          <source 
            src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10" />
      </div>

      {/* Content */}
      <div 
        className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-20"
        style={{ opacity }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm mb-8 border border-white/20">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          7 AI Agents Online
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6 text-white">
          The first
          <br />
          <span className="text-white/60">autonomous</span> AI agency
        </h1>
        
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
          A team of specialized AI agents that takes your project from concept to deployment. Fully autonomous. 24/7. No human bottlenecks.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="#contact"
            className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all hover:scale-105"
          >
            Start a project
          </Link>
          <Link 
            href="#work"
            className="px-8 py-4 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            View our work
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg 
            className="w-6 h-6 text-white/60" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </div>

      {/* Bottom gradient fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
    </section>
  );
}
