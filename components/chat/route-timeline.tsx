'use client'

import { Bed, Coffee, Flag, MapPin, Music, ShoppingBag, Star, TreePine, Utensils, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RouteStopCategory } from './route-stop'

export interface TimelineStop {
  name: string
  location: string
  category?: RouteStopCategory | null
  durationFromPrev?: string | null
}

type TimelineNode = {
  kind: 'start' | 'stop' | 'finish'
  name: string
  location?: string
  category?: RouteStopCategory | null
  durationFromPrev?: string | null
  stopNumber?: number
}

const categoryStyles: Record<RouteStopCategory, { label: string; icon: React.ReactNode; colors: string }> = {
  food: { label: 'Food', icon: <Utensils className="h-4 w-4" />, colors: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950' },
  coffee: { label: 'Coffee', icon: <Coffee className="h-4 w-4" />, colors: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950' },
  fuel: { label: 'Charging', icon: <Zap className="h-4 w-4" />, colors: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950' },
  attraction: { label: 'Attraction', icon: <Star className="h-4 w-4" />, colors: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950' },
  lodging: { label: 'Lodging', icon: <Bed className="h-4 w-4" />, colors: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950' },
  shopping: { label: 'Shopping', icon: <ShoppingBag className="h-4 w-4" />, colors: 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950' },
  scenic: { label: 'Scenic', icon: <TreePine className="h-4 w-4" />, colors: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950' },
  entertainment: { label: 'Entertainment', icon: <Music className="h-4 w-4" />, colors: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950' },
  default: { label: 'Stop', icon: <MapPin className="h-4 w-4" />, colors: 'border-border bg-muted text-foreground' },
}

function RouteNode({ node, width, left, top }: { node: TimelineNode; width: string; left: string; top: number }) {
  const isStop = node.kind === 'stop'
  const category = categoryStyles[node.category ?? 'default']
  const label = node.kind === 'start' ? 'Start' : node.kind === 'finish' ? 'Finish' : `Stop ${node.stopNumber} · ${category.label}`
  const icon = node.kind === 'start' ? <MapPin className="h-4 w-4" /> : node.kind === 'finish' ? <Flag className="h-4 w-4" /> : category.icon

  return (
    <div
      className="absolute z-10 flex flex-col items-center text-center"
      style={{ left, top, width, transform: 'translateX(-50%)' }}
    >
      <span className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm',
        isStop ? category.colors : 'border-foreground bg-background text-foreground'
      )}>
        {icon}
      </span>
      <span className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="mt-0.5 w-full break-words text-xs font-semibold leading-4 text-foreground">{node.name}</span>
      {node.location && node.location !== node.name && (
        <span className="mt-0.5 w-full break-words text-[11px] leading-4 text-muted-foreground">{node.location}</span>
      )}
      {node.durationFromPrev && (
        <span className="mt-1 text-[10px] leading-4 text-muted-foreground">{node.durationFromPrev} from previous</span>
      )}
    </div>
  )
}

function TimelinePath({ nodes, columns, rowHeight, nodeWidth }: { nodes: TimelineNode[]; columns: number; rowHeight: number; nodeWidth: string }) {
  const rows = Math.ceil(nodes.length / columns)
  const height = rows * rowHeight
  const xAt = (column: number) => {
    if (columns === 1) return 500
    if (columns === 2) return 250 + column * 500
    if (columns === 3) return 150 + column * 350
    return 120 + column * (760 / (columns - 1))
  }
  const positions = nodes.map((_, index) => {
    const row = Math.floor(index / columns)
    const positionInRow = index % columns
    const column = row % 2 === 0 ? positionInRow : columns - 1 - positionInRow
    return { x: xAt(column), y: 40 + row * rowHeight }
  })
  const path = positions.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  return (
    <div className="relative w-full" style={{ height }}>
      <svg className="absolute inset-0 h-full w-full text-emerald-500/75" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {nodes.map((node, index) => (
        <RouteNode
          key={`${node.kind}-${index}`}
          node={node}
          width={nodeWidth}
          left={`${positions[index].x / 10}%`}
          top={positions[index].y - 20}
        />
      ))}
    </div>
  )
}

export function RouteTimeline({ origin, destination, stops }: { origin: string; destination: string; stops: TimelineStop[] }) {
  const nodes: TimelineNode[] = [
    { kind: 'start', name: origin },
    ...stops.map((stop, index) => ({ ...stop, kind: 'stop' as const, stopNumber: index + 1 })),
    { kind: 'finish', name: destination },
  ]
  const desktopColumns = stops.length >= 5 ? 4 : stops.length >= 3 ? 3 : nodes.length
  const desktopNodeWidth = desktopColumns === 4 ? '22%' : desktopColumns === 3 ? '28%' : '42%'

  return (
    <section aria-label="Trip stops in travel order" className="rounded-xl border border-border bg-muted/20 px-3 py-4 sm:px-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your route</p>
      <div className="sm:hidden">
        <TimelinePath nodes={nodes} columns={2} rowHeight={190} nodeWidth="42%" />
      </div>
      <div className="hidden sm:block">
        <TimelinePath nodes={nodes} columns={desktopColumns} rowHeight={190} nodeWidth={desktopNodeWidth} />
      </div>
    </section>
  )
}
