import { Route, Zap, Brain, Navigation, MapPin, Battery, Coffee, Star } from "lucide-react";

const features = [
  {
    title: "AI-Powered Planning",
    description:
      "Describe your trip and get an itinerary with suggested stops, estimated timing, and charging plans.",
    mockup: (
      <div className="flex flex-col gap-3">
        <div className="rounded-lg bg-zinc-800 p-3">
          <p className="text-sm text-zinc-100">
            Plan a weekend trip from SF to Big Sur with EV charging stops
          </p>
        </div>
        <div className="text-sm text-zinc-300">
          Let me create your perfect coastal route...
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Navigation className="h-3.5 w-3.5" />
          <span>Found 3 scenic overlooks</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Battery className="h-3.5 w-3.5" />
          <span>2 charging stops planned</span>
        </div>
        <div className="mt-2 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          <p className="text-xs font-medium text-zinc-200">Your Itinerary</p>
          <p className="text-xs text-zinc-400">3 days, 240 miles</p>
        </div>
      </div>
    ),
  },
  {
    title: "Smart EV Routing",
    description:
      "Charge at scenic spots, not parking lots. We optimize stops around experiences.",
    mockup: (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
            <Zap className="h-4 w-4 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-zinc-200">Bixby Bridge Overlook</p>
            <p className="text-xs text-zinc-500">45 min charge · Ocean views</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
            <Coffee className="h-4 w-4 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-zinc-200">Carmel Coffee House</p>
            <p className="text-xs text-zinc-500">30 min charge · Top rated cafe</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
            <MapPin className="h-4 w-4 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-zinc-200">Point Lobos Reserve</p>
            <p className="text-xs text-zinc-500">60 min charge · Nature walk</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Scenic First",
    description:
      "Forget fastest. We surface coastal highways and mountain passes that make the journey the destination.",
    mockup: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Route Options</span>
        </div>
        <div className="rounded-lg border-2 border-zinc-600 bg-zinc-800/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-zinc-300" />
              <span className="text-sm font-medium text-zinc-200">Pacific Coast Highway</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-zinc-400">Scenic</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-zinc-500">4h 20min · 156 mi · Ocean views entire route</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3 opacity-60">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-400">US-101 Express</span>
          </div>
          <p className="mt-1 text-xs text-zinc-600">3h 10min · 142 mi · Mostly highway</p>
        </div>
      </div>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="bg-zinc-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-4xl italic text-zinc-100 md:text-5xl lg:text-6xl leading-tight">
            Everything you need.
            <br />
            Nothing in the way.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
            Routewise brings AI planning, EV routing, and scenic discovery into one focused experience.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col">
              {/* Title & Description above card */}
              <h3 className="text-lg font-semibold text-zinc-100">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
              
              {/* Mockup Card */}
              <div className="mt-4 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                {feature.mockup}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
