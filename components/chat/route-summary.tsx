'use client'

import { Zap, Coffee, Utensils, Bed, ShoppingBag, Star, TreePine, Music, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RouteStopCategory } from './route-stop'

export interface RouteSummaryStop {
  name: string
  location: string
  category?: RouteStopCategory | null
  durationFromPrev?: string | null
}

export interface RouteSummaryProps {
  origin: string
  destination: string
  stops?: RouteSummaryStop[]
  totalDistance?: string | null
  totalDuration?: string | null
  approximateEta?: string | null
  vehicleModel?: string | null
  routeTag?: string | null
  state?: 'input-streaming' | 'input-available' | 'output-available'
}

const stopCategoryConfig: Partial<
  Record<RouteStopCategory, { icon: React.ReactNode; bg: string; border: string }>
> = {
  food: {
    icon: <Utensils className="h-4 w-4" />,
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-orange-200 dark:border-orange-800',
  },
  coffee: {
    icon: <Coffee className="h-4 w-4" />,
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
  },
  fuel: {
    icon: <Zap className="h-4 w-4" />,
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  attraction: {
    icon: <Star className="h-4 w-4" />,
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
  },
  lodging: {
    icon: <Bed className="h-4 w-4" />,
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
  },
  shopping: {
    icon: <ShoppingBag className="h-4 w-4" />,
    bg: 'bg-pink-50 dark:bg-pink-950',
    border: 'border-pink-200 dark:border-pink-800',
  },
  scenic: {
    icon: <TreePine className="h-4 w-4" />,
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
  },
  entertainment: {
    icon: <Music className="h-4 w-4" />,
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  default: {
    icon: <MapPin className="h-4 w-4" />,
    bg: 'bg-muted',
    border: 'border-border',
  },
}


export function RouteSummary({
  origin,
  destination,
  stops = [],
  totalDistance,
  totalDuration,
  vehicleModel,
  routeTag = 'Fastest Route',
  state = 'input-available',
}: RouteSummaryProps) {
  if (state === 'input-streaming') {
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
    )
  }

  // Build the horizontal route bar nodes: origin dot, stop icons, destination dot
  const stopNodes = stops.map((stop) => {
    const config = stopCategoryConfig[stop.category ?? 'default'] ?? stopCategoryConfig.default!
    return config
  })

  const tripLabel = `${origin} to ${destination}`

  return (
    <div className="rounded-2xl border border-border bg-card w-full shadow-sm overflow-hidden">
      <div className="p-6 flex flex-col gap-5">

        {/* Top row: EV icon + route tag badge */}
        <div className="flex items-start justify-between">
          {/* Circular EV icon */}
          <div className="relative">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center border border-border">
              <Zap className="h-6 w-6 text-foreground" strokeWidth={2.5} />
            </div>

          </div>

          {/* Route tag */}
          {routeTag && (
            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              {routeTag}
            </span>
          )}
        </div>

        {/* Title + subtitle */}
        <div>
          <h2 className="text-xl font-bold text-foreground leading-tight text-balance">
            {tripLabel}
          </h2>
          {vehicleModel && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Optimized for {vehicleModel}
            </p>
          )}
        </div>

        {/* Horizontal route bar */}
        <div className="flex flex-col gap-1.5">
          {/* Origin / Destination labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{origin}</span>
            <span>{destination}</span>
          </div>

          {/* Bar with stop icons */}
          <div className="relative flex items-center gap-0">
            {/* Full-width track */}
            <div className="absolute inset-y-1/2 left-0 right-0 h-[3px] -translate-y-1/2 rounded-full overflow-hidden">
              {/* Green filled portion */}
              <div className="h-full w-1/3 bg-green-500 rounded-l-full" />
            </div>
            {/* Track remainder */}
            <div className="absolute inset-y-1/2 left-1/3 right-0 h-[3px] -translate-y-1/2 bg-border rounded-r-full" />

            {/* Origin dot */}
            <div className="relative z-10 h-3 w-3 rounded-full bg-foreground shrink-0" />

            {/* Stop icons evenly spaced */}
            {stopNodes.length > 0 && (
              <div className="flex-1 flex items-center justify-evenly px-2 relative z-10">
                {stopNodes.map((config, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-8 w-8 rounded-full border flex items-center justify-center text-foreground shrink-0',
                      config.bg,
                      config.border
                    )}
                  >
                    {config.icon}
                  </div>
                ))}
              </div>
            )}
            {stopNodes.length === 0 && <div className="flex-1" />}

            {/* Destination dot */}
            <div className="relative z-10 h-3 w-3 rounded-full bg-foreground shrink-0" />
          </div>


        </div>

        {/* Stats row */}
        {(totalDistance || totalDuration || stops.length > 0) && (
          <div className="grid grid-cols-3 gap-3">
            {totalDistance && (
              <StatBlock value={totalDistance} label="Total Distance" />
            )}
            {totalDuration && (
              <StatBlock value={totalDuration} label="Total Travel Time" />
            )}
            <StatBlock value={`${stops.length} Stop${stops.length !== 1 ? 's' : ''}`} label="Scheduled" />
          </div>
        )}



      </div>
    </div>
  )
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-muted/50 border border-border px-3 py-3 gap-0.5 text-center">
      <span className="text-base font-bold text-foreground leading-tight">{value}</span>
      <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
    </div>
  )
}
