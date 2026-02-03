"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  // Apply theme to document
  const applyTheme = (resolvedTheme: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    setResolvedTheme(resolvedTheme);
  };

  useEffect(() => {
    setMounted(true);
    
    // Check saved preference
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    
    if (savedTheme && savedTheme !== "system") {
      setTheme(savedTheme);
      applyTheme(savedTheme as "light" | "dark");
    } else {
      // Use system preference
      setTheme("system");
      applyTheme(getSystemTheme());
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem("theme") as Theme | null;
      if (!currentTheme || currentTheme === "system") {
        applyTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const cycleTheme = () => {
    // Cycle: system -> light -> dark -> system
    let newTheme: Theme;
    if (theme === "system") {
      newTheme = "light";
    } else if (theme === "light") {
      newTheme = "dark";
    } else {
      newTheme = "system";
    }
    
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "system") {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(newTheme);
    }
  };

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center">
        <span className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="w-9 h-9 rounded-full border border-white/20 hover:border-white/40 flex items-center justify-center transition-colors group"
      aria-label={`Current: ${theme}. Click to change theme.`}
      title={`Theme: ${theme}`}
    >
      {theme === "system" ? (
        // System icon
        <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ) : theme === "light" ? (
        // Sun icon
        <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon
        <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
