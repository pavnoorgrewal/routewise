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

  const points = [origin, ...waypoints, destination];
  const mobileLegs: string[] = [];
  for (let start = 0; start < points.length - 1; start += 4) {
    const end = Math.min(start + 4, points.length - 1);
    const leg = new URLSearchParams({
      api: "1",
      origin: points[start],
      destination: points[end],
      travelmode: "driving",
    });
    if (end - start > 1) leg.set("waypoints", points.slice(start + 1, end).join("|"));
    mobileLegs.push(`https://www.google.com/maps/dir/?${leg.toString()}`);
  }

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
      {waypoints.length > 3 && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Google Maps on a phone may show only three intermediate stops. Open these connected legs to see every stop there:</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {mobileLegs.map((url, index) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline underline-offset-4">
                Leg {index + 1} of {mobileLegs.length}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
