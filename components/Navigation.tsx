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

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="w-full border-b border-cyan-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm dark:shadow-gray-900/20">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-serif text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
          >
            Juliana Fernandes
          </Link>
          <div className="flex items-center gap-6">
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
        </div>
      </div>
    </nav>
  );
}
