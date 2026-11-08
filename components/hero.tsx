"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowDown,
  MapPin,
  Navigation,
  Zap,
  Mountain,
  Waves,
  Check,
} from "lucide-react";
import { LocationInput } from "@/components/location-input";

const inspirations = [
  {
    name: "Coast",
    icon: Waves,
    from: "San Francisco, CA",
    to: "Monterey, CA",
    image: "/images/scenic-route.jpg",
    title: "Take the coast.",
    caption: "Ocean air. A different pace.",
    label: "San Francisco → Monterey",
  },
  {
    name: "Mountains",
    icon: Mountain,
    from: "San Francisco, CA",
    to: "South Lake Tahoe, CA",
    image: "/images/tahoe-winter-road.jpg",
    title: "Find your elevation.",
    caption: "Fresh air. A little perspective.",
    label: "San Francisco → Lake Tahoe",
  },
];

export function Hero() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [scene, setScene] = useState(0);
  const inspiration = inspirations[scene];
  const canSubmit = from.trim().length > 0 && to.trim().length > 0;

  return (
    <section className="hero-section relative z-10 flex min-h-svh flex-col justify-center pt-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-16 pt-10 md:px-10 lg:grid-cols-[1.08fr_1fr] lg:gap-12 lg:py-20">
        <div className="hero-copy relative z-20">
          <p className="eyebrow entrance">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> A little
            planning. A lot of possibility.
          </p>
          <h1 className="entrance mt-7 text-[clamp(3.5rem,6.3vw,6rem)] font-medium leading-[1.02] tracking-[-0.065em] [animation-delay:70ms]">
            EV trips,
            <br />
            planned for{" "}
            <span className="font-serif italic font-normal tracking-[-0.055em] text-brand">
              You.
            </span>
          </h1>
          <form
            aria-label="Plan your road trip"
            onSubmit={(event) => {
              event.preventDefault();
              if (canSubmit)
                router.push(
                  `/chat?message=${encodeURIComponent(`Help me plan a trip from ${from.trim()} to ${to.trim()}`)}`,
                );
            }}
            className="trip-form entrance relative mt-10 max-w-[28rem] rounded-[22px] border border-black/[0.08] bg-white p-2 shadow-[0_4px_6px_-4px_#0000000a,0_20px_50px_-25px_#38302125] [animation-delay:140ms]"
          >
            <div className="relative z-20 flex items-center gap-3 px-3 py-3">
              <Navigation
                aria-hidden="true"
                className="h-[18px] w-[18px] shrink-0 text-brand"
              />
              <LocationInput
                value={from}
                onChange={setFrom}
                placeholder="Where are you starting?"
                label="Starting location"
              />
            </div>
            <div className="mx-3 h-px bg-border/70" />
            <div className="relative z-10 flex items-center gap-3 px-3 py-3">
              <MapPin
                aria-hidden="true"
                className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
              />
              <LocationInput
                value={to}
                onChange={setTo}
                placeholder="Where would you like to go?"
                label="Destination"
              />
              <button
                type="submit"
                disabled={!canSubmit}
                aria-label="Plan trip"
                className="button-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowRight className="h-[18px] w-[18px]" />
              </button>
            </div>
          </form>
        </div>

        <div className="hero-art entrance relative mx-auto w-full max-w-[520px] pb-8 pt-4 [animation-delay:180ms]">
          <div
            className="contour-field absolute -inset-7 -z-10 rounded-full opacity-60"
            aria-hidden="true"
          />
          <div className="travel-card relative overflow-hidden rounded-[30px] border border-white/90 bg-white p-2 shadow-[0_30px_80px_-25px_#413b2830,0_2px_5px_#00000005]">
            <div className="relative h-[300px] overflow-hidden rounded-[23px] sm:h-[380px]">
              {inspirations.map((item, index) => (
                <Image
                  key={item.name}
                  src={item.image}
                  alt={
                    index === 0
                      ? "A winding road along a sunlit coastline"
                      : "A winding road through snow-covered trees on the way to Lake Tahoe"
                  }
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 90vw, 500px"
                  className={`hero-landscape object-cover transition-[opacity,transform] duration-700 ${index === scene ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
              <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-2">
                <span className="rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-white backdrop-blur-xl">
                  Trip inspiration
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />{" "}
                  Scenic by nature
                </span>
              </div>
              <div
                key={scene}
                className="scene-copy absolute bottom-6 left-6 right-6 text-white"
              >
                <p className="mb-2 text-xs text-white/80">
                  {inspiration.caption}
                </p>
                <h2 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                  {inspiration.title}
                </h2>
              </div>
            </div>
            <div className="px-4 pb-4 pt-5 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Your next chapter
                  </p>
                  <p className="mt-1 text-sm font-medium tracking-tight">
                    {inspiration.label}
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f4eb] text-[#527548]">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <div
                className="preview-route relative my-5 flex items-center justify-between"
                aria-hidden="true"
              >
                <span className="h-2 w-2 rounded-full border-2 border-brand bg-white" />
                <span className="h-2 w-2 rounded-full bg-brand" />
                <span className="h-2 w-2 rounded-full bg-brand" />
                <span className="h-2 w-2 rounded-full border-2 border-brand bg-white" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex gap-1 rounded-full bg-secondary/80 p-1"
                  role="group"
                  aria-label="Trip inspiration"
                >
                  {inspirations.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      aria-pressed={scene === index}
                      onClick={() => setScene(index)}
                      className={`scene-tab flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${scene === index ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <item.icon className="h-3 w-3" />
                      {item.name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFrom(inspiration.from);
                    setTo(inspiration.to);
                  }}
                  className="group flex items-center gap-1.5 rounded-full py-2 text-xs font-medium text-brand"
                >
                  Try this trip{" "}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
          <div className="floating-note absolute -bottom-1 left-4 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/95 px-4 py-3 shadow-[0_12px_32px_-10px_#00000025] backdrop-blur-lg sm:-left-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf2e8] text-[#527548]">
              <Check className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium">
                Less planning. More possibility.
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                A route that feels like you.
              </p>
            </div>
          </div>
        </div>
      </div>
      <a
        href="#the-journey"
        className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Made for the journey <ArrowDown className="h-3 w-3" />
      </a>
    </section>
  );
}
