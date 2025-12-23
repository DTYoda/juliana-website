import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juliana - Writer & Storyteller",
  description: "A cozy corner for stories, thoughts, and creative writing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var html = document.documentElement;
                  var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var initialTheme = theme || (systemPrefersDark ? 'dark' : 'light');
                  // Always remove dark class first
                  html.classList.remove('dark');
                  // Then add it only if needed
                  if (initialTheme === 'dark') {
                    html.classList.add('dark');
                  }
                  // Also set data attribute
                  html.setAttribute('data-theme', initialTheme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${playfair.variable} ${inter.variable} antialiased overflow-x-hidden`}>
        <ThemeProvider>
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
