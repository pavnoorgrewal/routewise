"use client";

import { Zap } from "lucide-react";
import { RouteStopCategory } from "./route-stop";
import { RouteMap } from "./route-map";
import { RouteTimeline } from "./route-timeline";

export interface RouteSummaryStop {
  name: string;
  location: string;
  category?: RouteStopCategory | null;
  durationFromPrev?: string | null;
}

export interface RouteSummaryProps {
  origin: string;
  destination: string;
  stops?: RouteSummaryStop[];
  totalDistance?: string | null;
  totalDuration?: string | null;
  approximateEta?: string | null;
  vehicleModel?: string | null;
  routeTag?: string | null;
  state?: "input-streaming" | "input-available" | "output-available";
}

export function RouteSummary({
  origin,
  destination,
  stops = [],
  totalDistance,
  totalDuration,
  vehicleModel,
  routeTag = "Fastest Route",
  state = "input-available",
}: RouteSummaryProps) {
  if (state === "input-streaming") {
    return (
      <div className="rounded-2xl border border-border bg-card w-full animate-pulse p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="h-14 w-14 rounded-full bg-muted" />
          <div className="h-6 w-28 rounded-full bg-muted" />
        </div>
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="h-3 w-52 bg-muted rounded" />
        <div className="h-3 w-full bg-muted rounded-full mt-4" />
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const tripLabel = `${origin} to ${destination}`;

  return (
    <div className="rounded-2xl border border-border bg-card w-full shadow-sm overflow-hidden">
      <div className="p-6 sm:p-7 flex flex-col gap-5">
        {/* Top row: EV icon + route tag badge */}
        <div className="flex items-start justify-between">
          {/* Circular EV icon */}
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-[#f8e9df] flex items-center justify-center border border-[#b94f2a]/10">
              <Zap className="h-5 w-5 text-brand" strokeWidth={1.8} />
            </div>
          </div>

          {/* Route tag */}
          {routeTag && (
            <span className="inline-flex items-center rounded-full bg-[#ecefe7] px-3 py-1 text-xs font-semibold text-[#46603d] border border-[#78936b]/20">
              {routeTag}
            </span>
          )}
        </div>

        {/* Title + subtitle */}
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Your journey, at a glance
          </p>
          <h2 className="text-2xl font-medium tracking-[-0.035em] text-foreground leading-tight text-balance">
            {tripLabel}
          </h2>
          {vehicleModel && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Optimized for {vehicleModel}
            </p>
          )}
        </div>

        <RouteTimeline
          origin={origin}
          destination={destination}
          stops={stops}
        />

        {/* Stats row */}
        {(totalDistance || totalDuration || stops.length > 0) && (
          <div className="grid grid-cols-3 gap-3">
            {totalDistance && (
              <StatBlock value={totalDistance} label="Total Distance" />
            )}
            {totalDuration && (
              <StatBlock value={totalDuration} label="Total Travel Time" />
            )}
            <StatBlock
              value={`${stops.length} Stop${stops.length !== 1 ? "s" : ""}`}
              label="Scheduled"
            />
          </div>
        )}
      </div>
      {origin && destination && (
        <RouteMap origin={origin} destination={destination} stops={stops} />
      )}
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-muted/50 border border-border px-3 py-3 gap-0.5 text-center">
      <span className="text-base font-semibold text-foreground leading-tight">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground leading-tight">
        {label}
      </span>
    </div>
  );
}
