"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import DarkModeToggle from "./DarkModeToggle";

interface NavItem {
  href: string;
  label: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>([
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load navbar titles from content file
    fetch("/api/website-content")
      .then((res) => res.json())
      .then((data) => {
        setNavItems([
          { href: "/", label: data.home?.navbarTitle || "Home" },
          {
            href: "/portfolio",
            label: data.portfolio?.navbarTitle || "Portfolio",
          },
          { href: "/blog", label: data.blog?.navbarTitle || "Blog" },
          { href: "/about", label: data.about?.navbarTitle || "About" },
        ]);
      })
      .catch(() => {
        // Keep default values if fetch fails
      });
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="w-full border-b border-cyan-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm dark:shadow-gray-900/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-serif text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors whitespace-nowrap"
          >
            Juliana Karas
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navItems.map((item) => {
              const active = isActive(item.href);
              if (active) {
                return (
                  <span
                    key={item.href}
                    className="text-cyan-500 dark:text-cyan-400 font-semibold cursor-default"
                  >
                    {item.label}
                  </span>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-800 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              );
            })}
            <DarkModeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-cyan-200/50 dark:border-gray-700/50 hover:bg-cyan-50 dark:hover:bg-gray-700/80 transition-colors shadow-sm"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-gray-800 dark:text-gray-200"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-gray-800 dark:text-gray-200"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-cyan-200/50 dark:border-gray-800/50 pt-4">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => {
                const active = isActive(item.href);
                if (active) {
                  return (
                    <span
                      key={item.href}
                      className="text-cyan-500 dark:text-cyan-400 font-semibold cursor-default py-2"
                    >
                      {item.label}
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-800 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
