"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

export function ThemeToggle({ className = "", variant = "default" }: { className?: string; variant?: "default" | "compact" | "pill" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg bg-black/10 dark:bg-white/10 animate-pulse ${className}`} />
    );
  }

  const themes = [
    { id: "light", label: "Light", icon: "light_mode" },
    { id: "dark", label: "Dark", icon: "dark_mode" },
    { id: "system", label: "System", icon: "desktop_windows" },
  ];

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[2];

  if (variant === "pill") {
    return (
      <div className={`inline-flex items-center bg-card border border-border rounded-full p-1 shadow-sm ${className}`}>
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            aria-label={`Switch to ${t.label} theme`}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              theme === t.id
                ? "bg-primary text-primary-foreground shadow-sm scale-105"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-border text-foreground transition-all shadow-sm active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px] text-accent">{currentThemeObj.icon}</span>
        {variant !== "compact" && <span className="text-xs font-semibold">{currentThemeObj.label}</span>}
        <span className="material-symbols-outlined text-[14px] text-muted-foreground">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-card border border-border shadow-2xl py-1.5 z-[100] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors ${
                theme === t.id
                  ? "bg-accent/15 text-accent"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              <span>{t.label}</span>
              {theme === t.id && (
                <span className="material-symbols-outlined text-[14px] ml-auto">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
