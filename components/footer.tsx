import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div>
            <Brand />
            <p className="mt-4 text-sm text-muted-foreground">
              A little planning. A lot of possibility.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <Link
              href="/proposal"
              className="group flex w-fit items-center gap-5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              The Story{" "}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </nav>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-border pt-6 text-[11px] text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Routewise.</p>
          <p>Founded by Pavnoor Singh Grewal</p>
        </div>
        <p className="mt-4 max-w-lg text-[10px] leading-5 text-muted-foreground">
          Location data:{" "}
          <a
            href="https://www.geonames.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GeoNames
          </a>{" "}
          ·{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            © OpenStreetMap contributors
          </a>{" "}
          ·{" "}
          <a
            href="https://geocoding.geo.census.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            US Census
          </a>
        </p>
      </div>
    </footer>
  );
}
