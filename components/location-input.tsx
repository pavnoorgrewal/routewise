'use client'

import { useEffect, useId, useState } from 'react'
import { MapPin, Plane, Store, Trees } from 'lucide-react'

type Suggestion = {
  label: string
  detail: string
  value: string
  type: 'city' | 'airport' | 'park' | 'place' | 'business' | 'address'
}

type LocationInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
}

export function LocationInput({ value, onChange, placeholder, label }: LocationInputProps) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!open) return

    if (value.trim().length === 1) {
      setSuggestions([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setSuggestions([])
    setLoading(true)
    setFailed(false)

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/locations?q=${encodeURIComponent(value.trim())}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Location search failed')
        setSuggestions((await response.json()) as Suggestion[])
      } catch {
        if (!controller.signal.aborted) setFailed(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, value.trim() ? 350 : 0)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [value, open])

  function select(suggestion: Suggestion) {
    onChange(suggestion.value)
    setOpen(false)
    setActiveIndex(-1)
  }

  return (
    <div className="relative min-w-0 flex-1">
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false)
            setActiveIndex(-1)
          } else if (event.key === 'ArrowDown' && suggestions.length) {
            event.preventDefault()
            setOpen(true)
            setActiveIndex((index) => (index + 1) % suggestions.length)
          } else if (event.key === 'ArrowUp' && suggestions.length) {
            event.preventDefault()
            setOpen(true)
            setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1))
          } else if (event.key === 'Enter' && open && activeIndex >= 0) {
            event.preventDefault()
            select(suggestions[activeIndex])
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        className="w-full bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={`${label} suggestions`}
          aria-busy={loading}
          className="absolute left-[-2.75rem] right-[-1rem] top-full z-50 mt-3 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-xl"
        >
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.type === 'airport' ? Plane : suggestion.type === 'park' ? Trees : suggestion.type === 'business' ? Store : MapPin
            return (
              <button
                key={`${suggestion.type}-${suggestion.value}`}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onPointerDown={(event) => {
                  event.preventDefault()
                  select(suggestion)
                }}
                onClick={() => select(suggestion)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent ${index === activeIndex ? 'bg-accent' : ''}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-foreground">{suggestion.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{suggestion.detail}</span>
                </span>
              </button>
            )
          })}
          {!loading && !suggestions.length && (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">
              {value.trim().length === 1
                ? 'Type at least 2 letters to search.'
                : failed
                  ? 'Suggestions are unavailable. You can still type a location.'
                  : /^\d/.test(value.trim())
                    ? 'No address match yet. Add a city and state, or enter it manually.'
                    : 'No matches. You can still type a location.'}
            </p>
          )}
          {loading && <p className="px-3 py-2.5 text-sm text-muted-foreground">Finding places...</p>}
        </div>
      )}
    </div>
  )
}
