"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Route } from "lucide-react";

const links = [
  { href: "/proposal", label: "The Story" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 rounded-md text-xl font-semibold tracking-tight">
          <Route aria-hidden="true" className="h-5 w-5" />
          Routewise
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${pathname === href ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>
              {label}
            </Link>
          ))}
        </div>
        <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </nav>
      {mobileOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {links.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={pathname === href ? "page" : undefined}
                className={`rounded-xl px-4 py-3 text-sm font-medium ${pathname === href ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
