import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Zap,
  MapPin,
  Coffee,
  Mountain,
  Route,
  Check,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

export function Features() {
  return (
    <section id="the-journey" className="scroll-mt-24 pb-8">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="border-t border-border pb-14 pt-20 md:pt-28">
          <p className="eyebrow">The journey, considered.</p>
          <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="section-heading max-w-2xl">
              Less figuring it out.
              <br />
              <span className="text-muted-foreground">
                More getting out there.
              </span>
            </h2>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              From the first idea to the final stop, everything comes together
              in one place.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Reveal className="feature-tile flex flex-col rounded-[28px] border border-black/[0.06] bg-white p-7 md:p-8">
            <span className="tile-number">01 / THE IDEA</span>
            <h3 className="mt-5 text-2xl font-medium tracking-[-0.04em]">
              Just say where.
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Tell us what you have in mind. Shape the route together, one easy
              conversation at a time.
            </p>
            <div
              className="mt-8 flex min-h-52 flex-col justify-center gap-4"
              aria-label="Example planning conversation"
            >
              <div className="ml-6 rounded-[18px] rounded-br-md bg-secondary/70 px-4 py-3 text-xs leading-5">
                A weekend away. Ocean views.
                <br />A really good coffee along the way.
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Sparkles className="h-3 w-3" />
                </span>
                <div>
                  <p className="text-xs leading-5">
                    Sounds like the coast is calling.
                    <br />
                    Where are we starting?
                  </p>
                  <div className="mt-3 flex gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-brand" />
                    <span className="h-1 w-1 rounded-full bg-brand/60" />
                    <span className="h-1 w-1 rounded-full bg-brand/30" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal
            delay={80}
            className="feature-tile flex flex-col rounded-[28px] border border-black/[0.06] bg-[#ecefe7] p-7 md:p-8"
          >
            <span className="tile-number">02 / THE RECHARGE</span>
            <h3 className="mt-5 text-2xl font-medium tracking-[-0.04em]">
              Range, taken into account.
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your EV range helps shape the charging plan. Make a little room to
              recharge, too.
            </p>
            <div className="mt-8 flex min-h-52 flex-col justify-center">
              <div
                className="mx-auto flex h-20 items-center gap-1.5 rounded-[20px] border border-[#527548]/20 bg-white/50 p-3 shadow-[inset_0_1px_1px_#ffffff]"
                aria-hidden="true"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`battery-cell h-full w-7 rounded-lg ${n < 5 ? "bg-[#78936b]" : "bg-[#78936b]/20"}`}
                    style={{ animationDelay: `${n * 90}ms` }}
                  />
                ))}
                <Zap className="ml-2 h-6 w-6 text-[#527548]" />
              </div>
              <div className="mt-7 flex items-center justify-center gap-2 text-xs text-[#46603d]">
                <Check className="h-3.5 w-3.5" /> Charging that fits the
                journey.
              </div>
            </div>
          </Reveal>
          <Reveal
            delay={160}
            className="feature-tile relative flex min-h-[440px] flex-col overflow-hidden rounded-[28px] bg-[#252e28] p-7 text-white md:col-span-2 md:p-8 lg:col-span-1"
          >
            <Image
              src="/images/hero-road.jpg"
              alt="Sunlight falling across a winding mountain road"
              fill
              sizes="(max-width: 1024px) 90vw, 400px"
              className="feature-image object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/50" />
            <div className="relative">
              <span className="tile-number text-white/70">03 / THE DETOUR</span>
              <h3 className="mt-5 text-2xl font-medium tracking-[-0.04em]">
                The good kind of
                <br />
                out of the way.
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/80">
                A scenic overlook. A local favorite. Or no extra stops at all.
                It’s your call.
              </p>
            </div>
            <div className="relative mt-auto flex flex-wrap gap-2 pt-12">
              {[
                { icon: Coffee, label: "Local flavors" },
                { icon: Mountain, label: "Better views" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[11px] backdrop-blur-md"
                >
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal className="my-20 grid overflow-hidden rounded-[32px] bg-[#242a25] text-white md:my-28 lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <p className="eyebrow text-white/60">
              A plan you can take with you
            </p>
            <h2 className="mt-6 text-[clamp(2.4rem,4.5vw,4rem)] font-medium leading-[1.07] tracking-[-0.055em]">
              One conversation.
              <br />
              <span className="font-serif font-normal italic text-[#d6dfc9]">
                A whole open road.
              </span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              Build your itinerary, see each stop, and open the whole route in
              Google Maps when you’re ready to go.
            </p>
            <Link
              href="/chat"
              className="button-light mt-8 inline-flex w-fit items-center gap-6 px-5 py-3 text-sm"
            >
              Let’s plan something <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative flex min-h-[350px] items-center justify-center overflow-hidden px-8 py-14 sm:px-14">
            <div
              className="dark-contours absolute inset-0 opacity-20"
              aria-hidden="true"
            />
            <div className="relative w-full max-w-sm rounded-[22px] border border-white/15 bg-[#343c34] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Route className="h-4 w-4 text-[#c5d3b8]" /> Your journey
                </span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-white/70">
                  Illustration
                </span>
              </div>
              <div className="my-7 space-y-6 border-l border-[#c5d3b8]/30 pl-5">
                {[
                  {
                    icon: MapPin,
                    name: "Start somewhere familiar",
                    detail: "Your starting point",
                  },
                  {
                    icon: Zap,
                    name: "A moment to recharge",
                    detail: "Charging, when you need it",
                  },
                  {
                    icon: Mountain,
                    name: "Arrive somewhere new",
                    detail: "Your next adventure",
                  },
                ].map((item) => (
                  <div key={item.name} className="relative">
                    <span className="absolute -left-[29px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#343c34] text-[#c5d3b8]">
                      <item.icon className="h-3 w-3" />
                    </span>
                    <p className="text-xs font-medium">{item.name}</p>
                    <p className="mt-1 text-[10px] text-white/50">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#d6dfc9]">
                <span>From idea to itinerary</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
