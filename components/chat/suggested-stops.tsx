'use client'

import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RouteStopCategory } from './route-stop'
import {
  Coffee,
  Utensils,
  Zap,
  Bed,
  ShoppingBag,
  MapPin,
  Star,
  TreePine,
  Music,
} from 'lucide-react'

export interface SuggestedStopChip {
  id: string
  label: string
  sublabel?: string | null
  location?: string | null
  category?: RouteStopCategory | null
}

const stopTypes: Partial<Record<RouteStopCategory, string>> = {
  food: 'Restaurant', coffee: 'Coffee shop', fuel: 'EV charging', attraction: 'Attraction',
  lodging: 'Lodging', shopping: 'Shop', scenic: 'Scenic stop', entertainment: 'Entertainment',
  default: 'Place',
}

function chipDetails(chip: SuggestedStopChip): string | null {
  if (!chip.location) return chip.sublabel ?? null
  const parts = chip.location.split(',').map((part) => part.trim())
  if (parts.length < 3) return `${stopTypes[chip.category ?? 'default'] ?? 'Place'} · ${chip.location}`
  return `${stopTypes[chip.category ?? 'default'] ?? 'Place'} · ${parts.slice(-2).join(', ')}`
}

export interface SuggestedStopsProps {
  title?: string
  chips: SuggestedStopChip[]
  multiSelect?: boolean
  state?: 'input-streaming' | 'input-available' | 'output-available'
  selectedIds?: string[]
  selectedStops?: { id: string; label: string }[]
  onSelect?: (selected: SuggestedStopChip[]) => void
}

const categoryConfig: Partial<Record<RouteStopCategory, { icon: React.ReactNode; selectedBg: string; selectedText: string; selectedBorder: string; idleBg: string; idleText: string; idleBorder: string }>> = {
  food:          { icon: <Utensils className="h-3 w-3" />,  selectedBg: 'bg-blue-700',  selectedText: 'text-white', selectedBorder: 'border-blue-700',  idleBg: 'bg-blue-50 dark:bg-blue-950/30',  idleText: 'text-blue-700 dark:text-blue-400', idleBorder: 'border-blue-200 dark:border-blue-800' },
  coffee:        { icon: <Coffee className="h-3 w-3" />,    selectedBg: 'bg-green-700',   selectedText: 'text-white', selectedBorder: 'border-green-700',   idleBg: 'bg-green-50 dark:bg-green-950/30',    idleText: 'text-green-700 dark:text-green-400',  idleBorder: 'border-green-200 dark:border-green-800' },
  fuel:          { icon: <Zap className="h-3 w-3" />,       selectedBg: 'bg-amber-700', selectedText: 'text-white', selectedBorder: 'border-amber-700', idleBg: 'bg-amber-50 dark:bg-amber-950/30',idleText: 'text-amber-700 dark:text-amber-400',idleBorder: 'border-amber-200 dark:border-amber-800' },
  attraction:    { icon: <Star className="h-3 w-3" />,      selectedBg: 'bg-purple-700',  selectedText: 'text-white', selectedBorder: 'border-purple-700',  idleBg: 'bg-purple-50 dark:bg-purple-950/30',  idleText: 'text-purple-700 dark:text-purple-400', idleBorder: 'border-purple-200 dark:border-purple-800' },
  lodging:       { icon: <Bed className="h-3 w-3" />,       selectedBg: 'bg-violet-700',  selectedText: 'text-white', selectedBorder: 'border-violet-700',  idleBg: 'bg-violet-50 dark:bg-violet-950/30',  idleText: 'text-violet-700 dark:text-violet-400', idleBorder: 'border-violet-200 dark:border-violet-800' },
  shopping:      { icon: <ShoppingBag className="h-3 w-3" />,selectedBg: 'bg-pink-700',   selectedText: 'text-white', selectedBorder: 'border-pink-700',   idleBg: 'bg-pink-50 dark:bg-pink-950/30',      idleText: 'text-pink-700 dark:text-pink-400',    idleBorder: 'border-pink-200 dark:border-pink-800' },
  scenic:        { icon: <TreePine className="h-3 w-3" />,  selectedBg: 'bg-teal-700',   selectedText: 'text-white', selectedBorder: 'border-teal-700',  idleBg: 'bg-teal-50 dark:bg-teal-950/30',    idleText: 'text-teal-700 dark:text-teal-400',  idleBorder: 'border-teal-200 dark:border-teal-800' },
  entertainment: { icon: <Music className="h-3 w-3" />,     selectedBg: 'bg-indigo-700',  selectedText: 'text-white', selectedBorder: 'border-indigo-700', idleBg: 'bg-indigo-50 dark:bg-indigo-950/30',  idleText: 'text-indigo-700 dark:text-indigo-400',idleBorder: 'border-indigo-200 dark:border-indigo-800' },
  default:       { icon: <MapPin className="h-3 w-3" />,    selectedBg: 'bg-foreground',  selectedText: 'text-background', selectedBorder: 'border-foreground', idleBg: 'bg-background', idleText: 'text-foreground', idleBorder: 'border-border' },
}

export function SuggestedStops({
  title = 'Suggested stops',
  chips,
  multiSelect = true,
  state = 'input-available',
  selectedIds: controlledSelectedIds,
  selectedStops = [],
  onSelect,
}: SuggestedStopsProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>([])
  const [customStops, setCustomStops] = useState<string[]>([''])

  const isCommitted = state === 'output-available'
  const selectedIds = isCommitted ? controlledSelectedIds ?? [] : internalSelected
  const isSelectable = state === 'input-available'
  const namedStops = customStops.map((name, index) => ({
    id: `custom-stop-${index}`,
    label: name.trim(),
    category: 'default' as const,
  })).filter((stop) => stop.label)
  const selectionCount = internalSelected.length + namedStops.length

  const toggle = (chip: SuggestedStopChip) => {
    if (!isSelectable) return
    if (multiSelect) {
      setInternalSelected((prev) =>
        prev.includes(chip.id) ? prev.filter((id) => id !== chip.id) : [...prev, chip.id]
      )
    } else {
      setInternalSelected([chip.id])
      onSelect?.([chip])
    }
  }

  const confirm = () => {
    if (!isSelectable || selectionCount === 0) return
    onSelect?.([...chips.filter((c) => internalSelected.includes(c.id)), ...namedStops])
  }

  const skip = () => {
    if (!isSelectable) return
    setInternalSelected([])
    onSelect?.([])
  }

  if (state === 'input-streaming') {
    return (
      <div className="flex flex-col gap-2 max-w-lg">
        <div className="h-3 w-28 bg-muted rounded animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {[80, 100, 70, 90, 60, 110].map((w, i) => (
            <div key={i} className="h-8 rounded-full bg-muted animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
    )
  }

  if (isCommitted && selectedIds.length > 0) {
    const selected = selectedStops.length > 0
      ? selectedStops.map((stop) => chips.find((chip) => chip.id === stop.id) ?? { ...stop, category: 'default' as const })
      : chips.filter((c) => selectedIds.includes(c.id))
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <div className="flex flex-wrap gap-1.5">
          {selected.map((chip) => {
            const cfg = categoryConfig[chip.category ?? 'default'] ?? categoryConfig.default!
            return (
              <span
                key={chip.id}
                className={cn(
                  'inline-flex max-w-full flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border break-words',
                  cfg.selectedBg, cfg.selectedText, cfg.selectedBorder
                )}
              >
                {cfg.icon}
                {chip.label}
                {chipDetails(chip) && <span className="opacity-75 font-normal">{chipDetails(chip)}</span>}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  if (isCommitted) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">No extra stops selected</p>
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {title && <p className="text-sm font-semibold text-foreground text-balance">{title}</p>}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isSelected = selectedIds.includes(chip.id)
          const cfg = categoryConfig[chip.category ?? 'default'] ?? categoryConfig.default!

          return (
            <button
              key={chip.id}
              onClick={() => toggle(chip)}
              disabled={!isSelectable}
              aria-pressed={isSelected}
              className={cn(
                'inline-flex min-h-11 max-w-full flex-wrap items-center gap-1.5 px-3 py-2 rounded-2xl text-left text-xs font-semibold border transition-all break-words',
                isSelected
                  ? cn(cfg.selectedBg, cfg.selectedText, cfg.selectedBorder)
                  : cn(cfg.idleBg, cfg.idleText, cfg.idleBorder, isSelectable && 'hover:opacity-80'),
                !isSelectable && 'opacity-50 cursor-default',
                isSelectable && 'cursor-pointer active:scale-[0.96]'
              )}
            >
              {cfg.icon}
              {chip.label}
              {chipDetails(chip) && (
                <span className="opacity-70 font-normal">{chipDetails(chip)}</span>
              )}
            </button>
          )
        })}
      </div>
      {multiSelect && isSelectable && (
        <div className="rounded-2xl border border-border bg-white/70 p-3">
          <p className="mb-2 text-xs font-semibold text-foreground">Have a specific place in mind?</p>
          <div className="flex flex-col gap-2">
            {customStops.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label={`Specific stop ${index + 1}`}
                  placeholder="Restaurant or place name, city"
                  value={name}
                  maxLength={120}
                  disabled={!isSelectable}
                  onChange={(event) => setCustomStops((previous) => previous.map((stop, item) => item === index ? event.target.value : stop))}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-base sm:text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                />
                {customStops.length > 1 && (
                  <button type="button" aria-label={`Remove specific stop ${index + 1}`} onClick={() => setCustomStops((previous) => previous.filter((_, item) => item !== index))} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {customStops.length < 6 && (
            <button type="button" onClick={() => setCustomStops((previous) => [...previous, ''])} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-brand">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add stop
            </button>
          )}
        </div>
      )}
      {multiSelect && isSelectable && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={confirm}
            disabled={selectionCount === 0}
            className={cn(
              'inline-flex items-center gap-1.5 min-h-11 px-4 py-2 rounded-full text-xs font-semibold border transition-all',
              selectionCount > 0
                ? 'bg-foreground text-background border-foreground hover:bg-foreground/90 cursor-pointer'
                : 'bg-muted text-muted-foreground border-border cursor-not-allowed'
            )}
          >
            <Check className="h-3 w-3" />
            Confirm
            {selectionCount > 0 && (
              <span className="opacity-70">({selectionCount})</span>
            )}
          </button>
          {chips.length > 0 && <p className="text-xs text-muted-foreground">Pick as many as you like</p>}
        </div>
      )}
      {isSelectable && (
        <button
          type="button"
          onClick={skip}
          className="min-h-11 self-start text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          No extra stops
        </button>
      )}
    </div>
  )
}
