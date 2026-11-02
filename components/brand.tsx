import Link from "next/link";
import { Route } from "lucide-react";

export function Brand() {
  return (
    <Link
      href="/"
      aria-label="Routewise home"
      className="brand inline-flex shrink-0 items-center gap-2.5 rounded-lg text-xl font-semibold tracking-[-0.055em]"
    >
      <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-[10px] bg-foreground text-background">
        <Route
          aria-hidden="true"
          className="h-[18px] w-[18px]"
          strokeWidth={1.8}
        />
      </span>
      Routewise<span className="-ml-2 text-brand">.</span>
    </Link>
  );
}
