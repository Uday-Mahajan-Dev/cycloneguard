"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setIsDark(isCurrentlyDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);

    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("cycloneguard-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("cycloneguard-theme", "light");
    }

    // Broadcast theme change event so MapLibre can update Carto style seamlessly
    window.dispatchEvent(
      new CustomEvent("cycloneguard-theme-change", {
        detail: { isDark: newDark },
      })
    );
  };

  if (!mounted) {
    return (
      <div
        className={`w-7 sm:w-9 h-7 sm:h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 ${className}`}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-1.5 sm:p-2 rounded-lg transition-all duration-200 border cursor-pointer shrink-0 ${
        isDark
          ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300 shadow-sm"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
}
