import Image from "next/image";
import { TrendingUp, Leaf, Bot } from "lucide-react";

const trends = [
  {
    icon: Bot,
    title: "The Rise of Generative AI",
    description:
      "In 2026, GenAI is shifting from passive search to proactive service. Travelers, specifically Gen Z and Millennials, now expect AI to generate a full, executable journey from a single prompt.",
    source: "Deloitte Insights, 2026",
    image: "/images/ai-planning.jpg",
    imageAlt: "AI travel planning interface on a tablet in a cafe",
  },
  {
    icon: TrendingUp,
    title: "EV Proliferation",
    description:
      "The US EV market is projected to hit 11.8% of total vehicle sales in 2026. This creates a massive, underserved market of travelers who require route planning that treats charging time as an opportunity for experience time.",
    source: "S&P Global Mobility, 2025",
    image: "/images/ev-market.jpg",
    imageAlt: "Electric vehicles at a modern charging station plaza with solar panels",
  },
  {
    icon: Leaf,
    title: "Slow & Sustainable Travel",
    description:
      'There is a growing trend toward "off-peak" and "scenic" travel. Users are moving away from the fastest GPS routes in favor of "slow travel" experiences that prioritize the view over the ETA.',
    source: "Explore Worldwide, 2026",
    image: "/images/slow-travel.jpg",
    imageAlt: "Couple enjoying a scenic overlook during a road trip at sunset",
  },
];

export function IndustryTrends() {
  return (
    <section className="border-t border-border bg-secondary/30 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Industry Trends
        </p>
        <h2 className="font-sans mt-3 text-balance text-3xl font-bold text-foreground">
          The market is ready
        </h2>
        <p className="mt-4 max-w-3xl text-pretty leading-relaxed text-muted-foreground">
          Three converging macro trends make this the perfect moment for
          Routewise.
        </p>

        <div className="mt-12 flex flex-col gap-12">
          {trends.map((trend, index) => (
            <div
              key={trend.title}
              className={`flex flex-col gap-8 md:flex-row ${
                index % 2 !== 0 ? "md:flex-row-reverse" : ""
              } items-center`}
            >
              <div className="relative h-64 w-full overflow-hidden rounded-2xl md:w-80 md:shrink-0">
                <Image
                  src={trend.image || "/placeholder.svg"}
                  alt={trend.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <trend.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-sans text-xl font-bold text-foreground">
                  {trend.title}
                </h3>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {trend.description}
                </p>
                <p className="mt-3 text-xs font-medium text-primary">
                  Source: {trend.source}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Market Size Callout */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h3 className="font-sans mb-6 text-center text-xl font-bold text-foreground">
            Market Opportunity
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <p className="font-sans text-3xl font-bold text-primary">
                $213.82B
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Global driving vacation market (2026)
              </p>
              <p className="mt-1 text-xs text-primary/70">
                The Business Research Company
              </p>
            </div>
            <div className="text-center">
              <p className="font-sans text-3xl font-bold text-primary">
                11.8%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Projected US EV market share (2026)
              </p>
              <p className="mt-1 text-xs text-primary/70">
                S&P Global Mobility
              </p>
            </div>
            <div className="text-center">
              <p className="font-sans text-3xl font-bold text-primary">
                #1
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                GenAI use case: travel planning
              </p>
              <p className="mt-1 text-xs text-primary/70">
                Deloitte Insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
