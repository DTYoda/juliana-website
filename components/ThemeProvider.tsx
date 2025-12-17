"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with "light" to avoid hydration mismatch
  // The actual theme will be set in useEffect
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    // Remove dark class first to ensure clean state
    root.classList.remove("dark");
    if (newTheme === "dark") {
      root.classList.add("dark");
    }
    // Also set data attribute for additional compatibility
    root.setAttribute("data-theme", newTheme);
    // Force a reflow to ensure styles are applied
    void root.offsetHeight;
  }, []);

  useEffect(() => {
    // Check localStorage and system preference only on client
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme =
      storedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    // Listen for system preference changes (only if no stored theme)
    if (!storedTheme) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        applyTheme(newTheme);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      try {
        localStorage.setItem("theme", newTheme);
      } catch (e) {
        // Ignore localStorage errors
      }
      applyTheme(newTheme);
      return newTheme;
    });
  }, [applyTheme]);

  // Always provide the context, even before mounted
  // The script in layout.tsx handles the initial theme application
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

