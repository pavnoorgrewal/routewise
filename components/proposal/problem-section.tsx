import { AlertTriangle, Clock, Brain, Search } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    title: "Logistics Fatigue",
    description:
      "Hours of manual research to line up scenic routes, EV charging, dining, and overnight stays turns vacation planning into a stressful management task.",
  },
  {
    icon: AlertTriangle,
    title: "Fragile Itineraries",
    description:
      "If a charging station is full or a road is closed, manual plans collapse. Users cope by over-planning or relying on trial-and-error during the drive.",
  },
  {
    icon: Search,
    title: "Information Overload",
    description:
      "Millions of reviews on Google and Yelp make it nearly impossible to find the perfect spot matching personal taste without scrolling for hours.",
  },
  {
    icon: Brain,
    title: "High Cognitive Load",
    description:
      "Syncing charging stops with meal breaks and scenic windows creates spreadsheet fatigue before the trip even starts.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Why chose us
        </p>
        <h2 className="font-sans mt-3 text-balance text-3xl font-bold text-foreground">
          Why road trip planning is broken
        </h2>
        <p className="mt-4 max-w-3xl text-pretty leading-relaxed text-muted-foreground">
          Planning a road trip currently requires hours of tedious manual
          research to line up variables like scenic routes, EV charging, and
          good dining and overnight stays. This &ldquo;logistics fatigue&rdquo;
          often turns a vacation into a stressful management task, particularly
          for EV drivers who must balance range anxiety with the desire for
          traveling by car.
        </p>
        <p className="mt-3 max-w-3xl text-pretty leading-relaxed text-muted-foreground">
          By leveraging AI to solve this complex problem, Routewise will replace
          manual itineraries with dynamic and intelligent plans. This transforms
          the traveler from stressed out into an explorer, simplifying the
          experience by automating the &ldquo;math&rdquo; of travel.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {painPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <point.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-sans text-lg font-bold text-card-foreground">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Visual diagram: The current broken workflow */}
        <div className="mt-16">
          <h3 className="font-sans mb-6 text-center text-xl font-bold text-foreground">
            Current Trip Planning Workflow
          </h3>
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-0">
              {[
                { step: "1", label: "Google Maps", sub: "Fastest route only" },
                { step: "2", label: "PlugShare / Tesla", sub: "Find chargers" },
                { step: "3", label: "Yelp / Google", sub: "Search dining" },
                { step: "4", label: "Booking.com", sub: "Find stays" },
                { step: "5", label: "Spreadsheet", sub: "Merge everything" },
              ].map((item, i) => (
                <div key={item.step} className="flex items-center gap-3 md:flex-1">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-sans text-sm font-bold text-primary">
                      {item.step}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-card-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden h-0.5 flex-1 bg-border md:block" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm font-medium text-foreground">
              5+ apps, hours of work, fragile results
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
