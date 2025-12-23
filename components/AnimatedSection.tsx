"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use requestAnimationFrame for better performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            const timeoutId = setTimeout(() => {
              setIsVisible(true);
            }, delay);
            observer.disconnect();
            return () => clearTimeout(timeoutId);
          } else {
            setIsVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: '50px' } // Start animation slightly before visible
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
      style={{
        willChange: isVisible ? 'auto' : 'opacity, transform', // Optimize for animations
      }}
    >
      {children}
    </div>
  );
}
