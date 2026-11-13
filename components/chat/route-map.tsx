import { ExternalLink, Map } from "lucide-react";

type RouteMapProps = {
  origin: string;
  destination: string;
  stops: Array<{ name: string; location: string }>;
};

export function RouteMap({ origin, destination, stops }: RouteMapProps) {
  const waypoints = stops
    .map((stop) => stop.location?.trim() || stop.name?.trim())
    .filter(Boolean);

  const directions = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints.length)
    directions.set("waypoints", waypoints.slice(0, 9).join("|"));

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

  const embedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim();
  const embed = new URLSearchParams({
    key: embedKey ?? "",
    origin,
    destination,
    mode: "driving",
  });
  if (waypoints.length)
    embed.set("waypoints", waypoints.slice(0, 20).join("|"));

  return (
    <div className="border-t border-border bg-secondary/20 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Map aria-hidden="true" className="h-4 w-4" />
          Route map
        </h3>
      </div>
      {embedKey ? (
        <iframe
          title={`Driving route from ${origin} to ${destination}`}
          src={`https://www.google.com/maps/embed/v1/directions?${embed.toString()}`}
          className="aspect-video w-full rounded-xl border border-border bg-card"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Open the route in Google Maps to check directions, driving time, and
          stops.
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Check charging locations and availability before you drive.
      </p>
      <a
        href={`https://www.google.com/maps/dir/?${directions.toString()}`}
        target="_blank"
        rel="noopener noreferrer"
        className="button-dark mt-5 inline-flex items-center gap-2 px-4 py-3 text-xs font-medium"
      >
        Open full route in Google Maps
        <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
      </a>
      {waypoints.length > 3 && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p>On a phone, open these connected legs to see every stop:</p>
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
