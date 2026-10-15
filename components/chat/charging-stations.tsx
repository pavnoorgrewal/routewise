'use client'

import { Zap, Clock, Navigation, Plug, Coffee, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChargingStation {
  name: string
  location: string
  network?: string | null
  ports?: number | null
  maxKw?: number | null
  distanceFromRoute?: string | null
  estimatedChargingTime?: string | null
  amenitiesNearby?: string[] | null
}

export interface ChargingStationsProps {
  stations: ChargingStation[]
  title?: string
  state?: 'input-streaming' | 'input-available' | 'output-available'
}

const networkConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Tesla:            { bg: 'bg-red-50 dark:bg-red-950',     text: 'text-red-600 dark:text-red-400',     border: 'border-red-200 dark:border-red-800',     dot: 'bg-red-500' },
  Supercharger:     { bg: 'bg-red-50 dark:bg-red-950',     text: 'text-red-600 dark:text-red-400',     border: 'border-red-200 dark:border-red-800',     dot: 'bg-red-500' },
  'Electrify America': { bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
  Electrify:        { bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
  ChargePoint:      { bg: 'bg-sky-50 dark:bg-sky-950',     text: 'text-sky-600 dark:text-sky-400',     border: 'border-sky-200 dark:border-sky-800',     dot: 'bg-sky-500' },
  EVgo:             { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  Blink:            { bg: 'bg-teal-50 dark:bg-teal-950',   text: 'text-teal-600 dark:text-teal-400',   border: 'border-teal-200 dark:border-teal-800',   dot: 'bg-teal-500' },
}

const fallbackNetworkConfig = { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', dot: 'bg-muted-foreground' }

function getNetworkConfig(network?: string | null) {
  if (!network) return fallbackNetworkConfig
  for (const key of Object.keys(networkConfig)) {
    if (network.toLowerCase().includes(key.toLowerCase())) return networkConfig[key]
  }
  return fallbackNetworkConfig
}

function speedLabel(kw: number) {
  if (kw >= 250) return { label: 'Ultra-Fast', color: 'text-emerald-600 dark:text-emerald-400' }
  if (kw >= 150) return { label: 'DC Fast', color: 'text-sky-600 dark:text-sky-400' }
  if (kw >= 50)  return { label: 'Fast', color: 'text-amber-600 dark:text-amber-400' }
  return { label: 'Level 2', color: 'text-muted-foreground' }
}

const amenityIcons: Record<string, React.ReactNode> = {
  cafe:      <Coffee className="h-3 w-3" />,
  coffee:    <Coffee className="h-3 w-3" />,
  wifi:      <Wifi className="h-3 w-3" />,
  restroom:  <Plug className="h-3 w-3" />,
}

function AmenityIcon({ label }: { label: string }) {
  const key = Object.keys(amenityIcons).find((k) => label.toLowerCase().includes(k))
  return key ? <span className="text-muted-foreground">{amenityIcons[key]}</span> : null
}

export function ChargingStations({
  stations,
  title = 'Suggested charging stops',
  state = 'input-available',
}: ChargingStationsProps) {
  if (state === 'input-streaming') {
    return (
      <div className="flex flex-col gap-3 w-full">
        <div className="h-3.5 w-44 bg-muted rounded animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 flex gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3 w-28 bg-muted rounded" />
              <div className="h-2.5 w-20 bg-muted rounded" />
              <div className="h-2.5 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {stations.map((station, index) => {
          const net = getNetworkConfig(station.network)
          const speed = station.maxKw ? speedLabel(station.maxKw) : null

          return (
            <div
              key={index}
              className={cn(
                'rounded-xl border bg-card p-4 flex gap-3 hover:bg-muted/20 transition-colors',
                net.border
              )}
            >
              {/* Icon */}
              <div className={cn('flex items-center justify-center h-10 w-10 rounded-full shrink-0', net.bg)}>
                <Zap className={cn('h-4.5 w-4.5', net.text)} strokeWidth={2.5} />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                {/* Name + network badge */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground leading-tight">{station.name}</p>
                  {station.network && (
                    <span className={cn('shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', net.bg, net.text, net.border)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', net.dot)} />
                      {station.network}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">{station.location}</p>

                {/* Stats row */}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                  {station.maxKw && (
                    <span className={cn('text-xs font-semibold flex items-center gap-1', speed?.color)}>
                      <Zap className="h-3 w-3" />
                      {station.maxKw} kW{speed && <span className="font-normal text-muted-foreground">· {speed.label}</span>}
                    </span>
                  )}
                  {station.ports && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Plug className="h-3 w-3" />
                      {station.ports} ports
                    </span>
                  )}
                  {station.estimatedChargingTime && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{station.estimatedChargingTime}
                    </span>
                  )}
                  {station.distanceFromRoute && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {station.distanceFromRoute} off route
                    </span>
                  )}
                </div>

                {/* Amenities */}
                {station.amenitiesNearby && station.amenitiesNearby.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {station.amenitiesNearby.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                        <AmenityIcon label={a} />
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        These are planning suggestions. Confirm connector compatibility, location, and availability with the charging network before departure.
      </p>
    </div>
  )
}
