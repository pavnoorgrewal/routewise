'use client'

import { cn } from '@/lib/utils'
import {
  Coffee,
  Utensils,
  Zap,
  Camera,
  Bed,
  ShoppingBag,
  MapPin,
  Star,
  TreePine,
  Music,
  ArrowRight,
} from 'lucide-react'

export type RouteStopCategory =
  | 'food'
  | 'coffee'
  | 'fuel'
  | 'attraction'
  | 'lodging'
  | 'shopping'
  | 'scenic'
  | 'entertainment'
  | 'default'

const categoryConfig: Record<
  RouteStopCategory,
  { icon: React.ReactNode; label: string; iconBg: string; iconText: string; border: string; accent: string }
> = {
  food: {
    icon: <Utensils className="h-4 w-4" />,
    label: 'Food',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconText: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200/60 dark:border-orange-800/40',
    accent: 'bg-orange-500',
  },
  coffee: {
    icon: <Coffee className="h-4 w-4" />,
    label: 'Coffee',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    accent: 'bg-amber-500',
  },
  fuel: {
    icon: <Zap className="h-4 w-4" />,
    label: 'Charging',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    accent: 'bg-emerald-500',
  },
  attraction: {
    icon: <Star className="h-4 w-4" />,
    label: 'Attraction',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    iconText: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200/60 dark:border-yellow-800/40',
    accent: 'bg-yellow-500',
  },
  lodging: {
    icon: <Bed className="h-4 w-4" />,
    label: 'Lodging',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200/60 dark:border-violet-800/40',
    accent: 'bg-violet-500',
  },
  shopping: {
    icon: <ShoppingBag className="h-4 w-4" />,
    label: 'Shopping',
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    iconText: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200/60 dark:border-pink-800/40',
    accent: 'bg-pink-500',
  },
  scenic: {
    icon: <TreePine className="h-4 w-4" />,
    label: 'Scenic',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconText: 'text-green-600 dark:text-green-400',
    border: 'border-green-200/60 dark:border-green-800/40',
    accent: 'bg-green-500',
  },
  entertainment: {
    icon: <Music className="h-4 w-4" />,
    label: 'Entertainment',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
    accent: 'bg-indigo-500',
  },
  default: {
    icon: <MapPin className="h-4 w-4" />,
    label: 'Stop',
    iconBg: 'bg-muted',
    iconText: 'text-muted-foreground',
    border: 'border-border',
    accent: 'bg-muted-foreground',
  },
}

export interface RouteStopProps {
  name: string
  location: string
  category?: RouteStopCategory
  description?: string | null
  state?: 'input-streaming' | 'input-available' | 'output-available'
}

export function RouteStop({
  name,
  location,
  category = 'default',
  description,
  state = 'input-available',
}: RouteStopProps) {
  const config = categoryConfig[category] ?? categoryConfig.default

  if (state === 'input-streaming') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card animate-pulse min-w-56">
        <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-2.5 w-16 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 rounded-xl border bg-card hover:bg-muted/20 transition-colors min-w-56 max-w-xs group',
        config.border
      )}
    >
      {/* Left accent bar */}
      <div className={cn('w-0.5 self-stretch rounded-full shrink-0', config.accent)} />

      <div
        className={cn(
          'flex items-center justify-center h-9 w-9 rounded-full shrink-0',
          config.iconBg
        )}
      >
        <span className={config.iconText}>{config.icon}</span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-semibold text-foreground break-words">{name}</p>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
        <p className="text-xs text-muted-foreground break-words">{location}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
        <span
          className={cn(
            'mt-1.5 self-start inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
            config.iconBg,
            config.iconText
          )}
        >
          {config.icon}
          {config.label}
        </span>
      </div>
    </div>
  )
}

export interface RouteStopListProps {
  stops: Array<{
    name: string
    location: string
    category?: RouteStopCategory
    description?: string | null
  }>
  state?: 'input-streaming' | 'input-available' | 'output-available'
}

export function RouteStopList({ stops, state = 'input-available' }: RouteStopListProps) {
  return (
    <div className="flex flex-col gap-2">
      {stops.map((stop, i) => (
        <RouteStop key={i} {...stop} state={state} />
      ))}
    </div>
  )
}
