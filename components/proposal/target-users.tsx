import Image from "next/image";
import { Sofa } from "lucide-react";

export function TargetUsers() {
  return (
    <section className="border-t border-border bg-secondary/30 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Target Users & Context
        </p>
        <h2 className="font-sans mt-3 text-balance text-3xl font-bold text-foreground">
          Who we are building for
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative h-48">
              <Image
                src="/images/persona-traveler.jpg"
                alt="Tech-savvy traveler using phone near an EV on a scenic road"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="font-sans text-xl font-bold text-card-foreground">
                Tech-Savvy Travelers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Young to middle-aged professionals or students who value
                efficiency and high-quality experiences. Comfortable using AI to
                optimize their time and prefer &ldquo;hidden gems&rdquo; over
                generic tourist traps.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative h-48">
              <Image
                src="/images/ev-charging.jpg"
                alt="Electric vehicle at a scenic charging station"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="font-sans text-xl font-bold text-card-foreground">
                EV Road Trippers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Travelers who face the unique constraint of &ldquo;range
                anxiety.&rdquo; Route planning is about the technical necessity
                of charging infrastructure as much as the view.
              </p>
            </div>
          </div>
        </div>

        {/* Context of Use */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sofa className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-card-foreground">
                Context of Use
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                <strong className="text-card-foreground">Pre-Trip Planning:</strong>{" "}
                Used on a couch or desk for high-level brainstorming. The environment is
                calm, allowing for &ldquo;what if&rdquo; scenarios (e.g., &ldquo;What if
                we took the coastal route instead?&rdquo;).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="font-sans mb-6 text-center text-xl font-bold text-foreground">
            Features
          </h3>
          <div className="rounded-2xl border border-border bg-card p-8">
            <div>
              <div className="grid w-full gap-4 md:grid-cols-3">
                {[
                  {
                    need: "Scenic over fastest",
                    pain: "Google Maps prioritizes the most boring route",
                  },
                  {
                    need: "Integrated EV stops",
                    pain: "Checking separate apps to see if a charger is near food or views",
                  },
                  {
                    need: "Curated quality",
                    pain: "Review sites are cluttered with noise and unreliable ratings",
                  },
                ].map((item) => (
                  <div
                    key={item.need}
                    className="rounded-xl border border-border p-4 text-center"
                  >
                    <p className="font-sans text-sm font-bold text-card-foreground">
                      {item.need}
                    </p>
                    <div className="my-2 mx-auto h-px w-8 bg-primary/40" />
                    <p className="text-xs text-muted-foreground">{item.pain}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
