import { Check, X } from "lucide-react";

const competitors = [
  {
    name: "Roadtrippers",
    strengths: [
      'Vast database of "quirky" roadside attractions and scenic waypoints',
      'Strong focus on the "journey" experience',
    ],
    weaknesses: [
      "AI integration locked behind high-tier premium wall",
      "Route optimization feels rigid for real-time changes",
    ],
  },
  {
    name: "Wanderlog",
    strengths: [
      "Best for collaborative planning and document organization",
      "Handles flights, hotels, PDFs well",
    ],
    weaknesses: [
      "Lacks specialized EV (Tesla) integration",
      "Discovery is mostly manual, not proactive AI curation",
    ],
  },
  {
    name: "Tesla Trip Planner",
    strengths: [
      "Seamless vehicle integration and battery pre-conditioning",
      "Accurate range estimation",
    ],
    weaknesses: [
      "Highly utilitarian; prioritizes fastest route over scenic value",
      "Fails to curate high-quality dining or points of interest",
    ],
  },
];

export function CompetitorAnalysis() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Market Research
        </p>
        <h2 className="font-sans mt-3 text-balance text-3xl font-bold text-foreground">
          Competitor Analysis
        </h2>
        <p className="mt-4 max-w-3xl text-pretty leading-relaxed text-muted-foreground">
          Existing tools each solve a piece of the puzzle, but none provide the
          full picture.
        </p>

        <div className="mt-12 flex flex-col gap-6">
          {competitors.map((comp) => (
            <div
              key={comp.name}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="border-b border-border bg-secondary/50 px-6 py-4">
                <h3 className="font-sans text-lg font-bold text-card-foreground">
                  {comp.name}
                </h3>
              </div>
              <div className="grid gap-0 md:grid-cols-2">
                <div className="border-b border-border p-6 md:border-b-0 md:border-r">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                    Strengths
                  </p>
                  <ul className="flex flex-col gap-3">
                    {comp.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {s}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                    Shortcomings
                  </p>
                  <ul className="flex flex-col gap-3">
                    {comp.weaknesses.map((w) => (
                      <li key={w} className="flex items-start gap-2">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {w}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Routewise Advantage */}
        <div className="mt-12 rounded-2xl border-2 border-primary/30 bg-primary/5 p-8">
          <h3 className="font-sans text-center text-xl font-bold text-foreground">
            The Routewise Advantage
          </h3>
          <p className="mt-3 text-center text-muted-foreground">
            One intelligent platform that combines all of the above &mdash;
            scenic route planning, EV charging integration, curated dining,
            real-time adaptability &mdash; powered by AI.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { label: "AI Itineraries", available: true },
              { label: "EV Charging", available: true },
              { label: "Scenic Routes", available: true },
              { label: "Curated Dining", available: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-center gap-2 rounded-lg bg-card py-3 border border-primary/20"
              >
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-card-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
