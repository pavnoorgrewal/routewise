"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand";

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="site-nav fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-background/80 backdrop-blur-2xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-10"
      >
        <Brand />
        <div className="flex items-center gap-5 sm:gap-8">
          <Link
            href="/proposal"
            aria-current={pathname === "/proposal" ? "page" : undefined}
            className="nav-story text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            The Story
          </Link>
        </div>
      </nav>
    </header>
  );
}
