"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Reveal once. Content stays visible without JS or when reduced motion is enabled. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || preference.matches || !("IntersectionObserver" in window))
      return;
    element.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.reveal = "visible";
        observer.disconnect();
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    const show = () => {
      if (preference.matches) {
        element.dataset.reveal = "visible";
        observer.disconnect();
      }
    };
    preference.addEventListener("change", show);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", show);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
