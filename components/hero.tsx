"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import createGlobe from "cobe";
import { ArrowRight, MapPin, Navigation } from "lucide-react";
import { LocationInput } from "@/components/location-input";

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let animationFrame = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = canvas.offsetWidth;

    globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.2,
      dark: 0,
      diffuse: 1.1,
      mapSamples: 16000,
      mapBrightness: 4,
      mapBaseBrightness: 0.05,
      baseColor: [0.96, 0.96, 0.96],
      markerColor: [0.15, 0.15, 0.15],
      glowColor: [0.9, 0.9, 0.9],
      markers: [
        { location: [37.78, -122.44], size: 0.04 },
        { location: [40.71, -74.01], size: 0.04 },
        { location: [51.51, -0.13], size: 0.04 },
        { location: [35.68, 139.65], size: 0.04 },
        { location: [48.86, 2.35], size: 0.04 },
        { location: [-33.87, 151.21], size: 0.04 },
      ],
      opacity: 0.95,
    });

    function animate() {
      phi += 0.003;
      globe?.update({ phi });
      animationFrame = requestAnimationFrame(animate);
    }
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      globe?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="A globe showing destinations around the world"
      className="aspect-square w-full"
      style={{ contain: "layout paint size" }}
    />
  );
}

function TripForm() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const canSubmit = from.trim().length > 0 && to.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const prompt = encodeURIComponent(`Help me plan a trip from ${from.trim()} to ${to.trim()}`);
    router.push(`/chat?message=${prompt}`);
  };

  return (
    <form aria-label="Plan your road trip" onSubmit={handleSubmit} className="mt-8 w-full max-w-md">
      <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-foreground/20">
        {/* Start At */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Navigation className="h-4 w-4 shrink-0 text-muted-foreground" />
          <LocationInput
            value={from}
            onChange={setFrom}
            placeholder="Start at..."
            label="Starting location"
          />
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-border" />

        {/* Destination */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <LocationInput
            value={to}
            onChange={setTo}
            placeholder="Destination..."
            label="Destination"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Plan trip"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}

export function Hero() {
  return (
    <section className="relative z-10 flex min-h-screen items-center bg-background pt-16">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-24">
        {/* Text */}
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">A little planning. A lot of possibility.</p>
          <h1 className="font-serif text-balance text-5xl font-normal leading-[1.08] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            EV trips, planned by AI
          </h1>
          <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Scenic routes, thoughtful stops, and EV charging along the way.
            Start with where you want to go.
          </p>
          <TripForm />
        </div>

        {/* Globe */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <Globe />
          </div>
        </div>
      </div>
    </section>
  );
}
