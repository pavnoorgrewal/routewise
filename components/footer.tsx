import { Route } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight">
              <Route aria-hidden="true" className="h-5 w-5" />
              Routewise
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">Less planning. More of the journey.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
            <Link href="/proposal" className="text-muted-foreground transition-colors hover:text-foreground">The Story</Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Routewise.</p>
          <p>Founded by Pavnoor Singh Grewal</p>
        </div>
      </div>
    </footer>
  );
}
