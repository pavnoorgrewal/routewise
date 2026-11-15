import { ExternalLink, Map } from "lucide-react";

type RouteMapProps = {
  origin: string;
  destination: string;
  stops: Array<{ name: string; location: string }>;
};

export function RouteMap({ origin, destination, stops }: RouteMapProps) {
  const waypoints = stops
    .map((stop) => [stop.name?.trim(), stop.location?.trim()].filter(Boolean).join(", "))
    .filter(Boolean);

  const directions = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints.length)
    directions.set("waypoints", waypoints.slice(0, 9).join("|"));

  const appleDirections = new URLSearchParams({
    source: origin,
    destination,
    mode: "driving",
  });
  for (const waypoint of waypoints) appleDirections.append("waypoint", waypoint);

  return (
    <div className="border-t border-border bg-secondary/20 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Map aria-hidden="true" className="h-4 w-4" />
          Route map
        </h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Open the complete route in Apple Maps to check directions, driving time, and every stop.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Check charging locations and availability before you drive.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={`https://maps.apple.com/directions?${appleDirections.toString()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="button-dark inline-flex items-center gap-2 px-4 py-3 text-xs font-medium"
        >
          Open full route in Apple Maps
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
        <a
          href={`https://www.google.com/maps/dir/?${directions.toString()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Open full route in Google Maps
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
