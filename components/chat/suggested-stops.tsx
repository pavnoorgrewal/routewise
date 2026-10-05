'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
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
  category?: RouteStopCategory | null
}

export interface SuggestedStopsProps {
  title?: string
  chips: SuggestedStopChip[]
  multiSelect?: boolean
  state?: 'input-streaming' | 'input-available' | 'output-available'
  selectedIds?: string[]
  onSelect?: (selected: SuggestedStopChip[]) => void
}

const categoryConfig: Partial<Record<RouteStopCategory, { icon: React.ReactNode; selectedBg: string; selectedText: string; selectedBorder: string; idleBg: string; idleText: string; idleBorder: string }>> = {
  food:          { icon: <Utensils className="h-3 w-3" />,  selectedBg: 'bg-orange-500',  selectedText: 'text-white', selectedBorder: 'border-orange-500',  idleBg: 'bg-orange-50 dark:bg-orange-950/30',  idleText: 'text-orange-700 dark:text-orange-400', idleBorder: 'border-orange-200 dark:border-orange-800' },
  coffee:        { icon: <Coffee className="h-3 w-3" />,    selectedBg: 'bg-amber-500',   selectedText: 'text-white', selectedBorder: 'border-amber-500',   idleBg: 'bg-amber-50 dark:bg-amber-950/30',    idleText: 'text-amber-700 dark:text-amber-400',  idleBorder: 'border-amber-200 dark:border-amber-800' },
  fuel:          { icon: <Zap className="h-3 w-3" />,       selectedBg: 'bg-emerald-500', selectedText: 'text-white', selectedBorder: 'border-emerald-500', idleBg: 'bg-emerald-50 dark:bg-emerald-950/30',idleText: 'text-emerald-700 dark:text-emerald-400',idleBorder: 'border-emerald-200 dark:border-emerald-800' },
  attraction:    { icon: <Star className="h-3 w-3" />,      selectedBg: 'bg-yellow-500',  selectedText: 'text-white', selectedBorder: 'border-yellow-500',  idleBg: 'bg-yellow-50 dark:bg-yellow-950/30',  idleText: 'text-yellow-700 dark:text-yellow-400', idleBorder: 'border-yellow-200 dark:border-yellow-800' },
  lodging:       { icon: <Bed className="h-3 w-3" />,       selectedBg: 'bg-violet-500',  selectedText: 'text-white', selectedBorder: 'border-violet-500',  idleBg: 'bg-violet-50 dark:bg-violet-950/30',  idleText: 'text-violet-700 dark:text-violet-400', idleBorder: 'border-violet-200 dark:border-violet-800' },
  shopping:      { icon: <ShoppingBag className="h-3 w-3" />,selectedBg: 'bg-pink-500',   selectedText: 'text-white', selectedBorder: 'border-pink-500',   idleBg: 'bg-pink-50 dark:bg-pink-950/30',      idleText: 'text-pink-700 dark:text-pink-400',    idleBorder: 'border-pink-200 dark:border-pink-800' },
  scenic:        { icon: <TreePine className="h-3 w-3" />,  selectedBg: 'bg-green-500',   selectedText: 'text-white', selectedBorder: 'border-green-500',  idleBg: 'bg-green-50 dark:bg-green-950/30',    idleText: 'text-green-700 dark:text-green-400',  idleBorder: 'border-green-200 dark:border-green-800' },
  entertainment: { icon: <Music className="h-3 w-3" />,     selectedBg: 'bg-indigo-500',  selectedText: 'text-white', selectedBorder: 'border-indigo-500', idleBg: 'bg-indigo-50 dark:bg-indigo-950/30',  idleText: 'text-indigo-700 dark:text-indigo-400',idleBorder: 'border-indigo-200 dark:border-indigo-800' },
  default:       { icon: <MapPin className="h-3 w-3" />,    selectedBg: 'bg-foreground',  selectedText: 'text-background', selectedBorder: 'border-foreground', idleBg: 'bg-background', idleText: 'text-foreground', idleBorder: 'border-border' },
}

export function SuggestedStops({
  title = 'Suggested stops',
  chips,
  multiSelect = true,
  state = 'input-available',
  selectedIds: controlledSelectedIds,
  onSelect,
}: SuggestedStopsProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>([])

  const isCommitted = state === 'output-available'
  const selectedIds = isCommitted ? controlledSelectedIds ?? [] : internalSelected
  const isSelectable = state === 'input-available'

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
    if (!isSelectable || internalSelected.length === 0) return
    onSelect?.(chips.filter((c) => internalSelected.includes(c.id)))
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
    const selected = chips.filter((c) => selectedIds.includes(c.id))
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
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border',
                  cfg.selectedBg, cfg.selectedText, cfg.selectedBorder
                )}
              >
                {cfg.icon}
                {chip.label}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 max-w-lg">
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
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                isSelected
                  ? cn(cfg.selectedBg, cfg.selectedText, cfg.selectedBorder)
                  : cn(cfg.idleBg, cfg.idleText, cfg.idleBorder, isSelectable && 'hover:opacity-80'),
                !isSelectable && 'opacity-50 cursor-default',
                isSelectable && 'cursor-pointer active:scale-[0.96]'
              )}
            >
              {cfg.icon}
              {chip.label}
              {chip.sublabel && (
                <span className="opacity-60 font-normal">{chip.sublabel}</span>
              )}
            </button>
          )
        })}
      </div>
      {multiSelect && isSelectable && (
        <div className="flex items-center gap-2">
          <button
            onClick={confirm}
            disabled={internalSelected.length === 0}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all',
              internalSelected.length > 0
                ? 'bg-foreground text-background border-foreground hover:bg-foreground/90 cursor-pointer'
                : 'bg-muted text-muted-foreground border-border cursor-not-allowed'
            )}
          >
            <Check className="h-3 w-3" />
            Confirm
            {internalSelected.length > 0 && (
              <span className="opacity-70">({internalSelected.length})</span>
            )}
          </button>
          <p className="text-xs text-muted-foreground">Pick as many as you like</p>
        </div>
      )}
    </div>
  )
}
