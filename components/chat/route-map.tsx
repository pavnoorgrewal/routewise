import { ExternalLink, Map } from 'lucide-react'

type RouteMapProps = {
  origin: string
  destination: string
  stops: Array<{ name: string; location: string }>
}

export function RouteMap({ origin, destination, stops }: RouteMapProps) {
  const waypoints = stops
    .map((stop) => stop.location?.trim() || stop.name?.trim())
    .filter(Boolean)

  const directions = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode: 'driving',
  })
  if (waypoints.length) directions.set('waypoints', waypoints.slice(0, 9).join('|'))

  const embedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim()
  const embed = new URLSearchParams({
    key: embedKey ?? '',
    origin,
    destination,
    mode: 'driving',
  })
  if (waypoints.length) embed.set('waypoints', waypoints.slice(0, 20).join('|'))

  return (
    <div className="border-t border-border bg-secondary/20 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Map aria-hidden="true" className="h-4 w-4" />
          Route map
        </h3>
        <a
          href={`https://www.google.com/maps/dir/?${directions.toString()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          Open in Google Maps
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
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
          Open the route in Google Maps to check directions, driving time, and stops.
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Check charging locations and availability before you drive.
      </p>
    </div>
  )
}
