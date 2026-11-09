import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Route, Zap, Compass, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AssistantLauncher } from "@/components/assistant-launcher";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Why use Routewise — EV trips made simple",
  description:
    "Plan an EV trip around your range and your pace. Find named stops, adjust your itinerary, and open your route in Google Maps.",
};

export default function ProposalPage() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-36 md:px-10 md:pb-20 md:pt-44">
        <p className="eyebrow entrance">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Why use Routewise
        </p>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <h1 className="entrance text-[clamp(2.8rem,7.5vw,7rem)] font-medium leading-[1.02] tracking-[-0.065em] [animation-delay:80ms]">
            Less planning.
            <br />
            <span className="font-serif font-normal italic text-brand">
              More going.
            </span>
          </h1>
          <div className="entrance [animation-delay:160ms]">
            <p className="max-w-sm text-lg leading-8 text-muted-foreground">
              An EV trip that fits your range, your pace, and your plans.
            </p>
            <Link
              href="/chat"
              className="button-dark mt-6 inline-flex items-center gap-3 px-5 py-3 text-sm"
            >
              Plan your trip{" "}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <div className="story-panorama relative mx-3 h-[360px] overflow-hidden rounded-[28px] sm:mx-6 md:h-[520px] md:rounded-[36px]">
        <Image
          src="/images/hero-road.jpg"
          alt="A winding road opening into a sunlit mountain valley"
          fill
          priority
          sizes="100vw"
          className="story-landscape object-cover object-[50%_57%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-24 left-7 right-7 flex items-end justify-between gap-4 text-white md:bottom-10 md:left-12 md:right-12">
          <p className="max-w-md text-3xl font-medium leading-tight tracking-[-0.04em] md:text-4xl">
            A better plan.
            <br />A little more freedom.
          </p>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] sm:block">
            Go where you feel.
          </span>
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <Reveal className="grid gap-10 md:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow">A simpler way to go</p>
            <span className="mt-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white">
              <Route className="h-6 w-6 text-brand" strokeWidth={1.5} />
            </span>
          </div>
          <div>
            <h2 className="section-heading">
              Your whole trip.
              <br />
              One conversation.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground">
              Tell us where you’re going and your EV’s range. Routewise brings
              the drive, charging stops, and places to visit into one plan.
            </p>
          </div>
        </Reveal>
        <div className="my-20 h-px bg-border md:my-28" />
        <Reveal>
          <p className="eyebrow">Built around you</p>
          <h2 className="section-heading mt-5">Your trip. Your way.</h2>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            {
              icon: Compass,
              title: "Stop on your terms.",
              description:
                "Find a restaurant, park, or great view. Or skip the extra stops and head straight there.",
            },
            {
              icon: Zap,
              title: "Charging, considered.",
              description:
                "Your EV’s range helps shape the route, with suggested charging stops when you need them.",
            },
            {
              icon: Sparkles,
              title: "Easy to change.",
              description:
                "New destination? Different mood? Adjust your trip with a message and keep the conversation going.",
            },
          ].map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 80}
              className="border-t border-border pt-7"
            >
              <item.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
              <h3 className="mt-5 text-xl font-medium tracking-[-0.035em]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-[#ecefe7] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-10 lg:grid-cols-2 lg:items-center">
          <Reveal className="relative aspect-[5/4] overflow-hidden rounded-[28px]">
            <Image
              src="/images/ev-charging.jpg"
              alt="An electric vehicle charging beside a mountain landscape"
              fill
              sizes="(max-width: 1024px) 90vw, 550px"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={100} className="lg:pl-10">
            <p className="eyebrow">From plan to pavement</p>
            <h2 className="section-heading mt-6">
              Know your stops.
              <br />See the whole route.
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
              Get place names and street addresses, then open your planned
              stops in Google Maps. Your next step is easy to find.
            </p>
            <Link
              href="/chat"
              className="button-dark mt-8 inline-flex items-center gap-3 px-5 py-3 text-sm"
            >
              Plan your trip{" "}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">The idea behind Routewise</p>
          <p className="mt-8 font-serif text-4xl font-normal leading-[1.2] tracking-tight md:text-5xl">
            Less time piecing a trip together.
            <br />
            More time looking forward to it.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-xs font-medium">
              PG
            </span>
            <div className="text-left">
              <p className="text-sm font-medium">Pavnoor Singh Grewal</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Founder, Routewise
              </p>
            </div>
          </div>
        </Reveal>
      </section>
      <Footer />
      <AssistantLauncher />
    </main>
  );
}
