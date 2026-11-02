"use client";

import {
  Clock,
  Navigation,
  Leaf,
  Zap,
  Star,
  Check,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RouteOption {
  id: string;
  name: string;
  description?: string | null;
  distance?: string | null;
  duration?: string | null;
  highlights?: string[] | null;
  tags?: Array<"scenic" | "fast" | "eco" | "popular"> | null;
}

export interface RouteOptionsProps {
  question?: string;
  options: RouteOption[];
  state?: "input-streaming" | "input-available" | "output-available";
  selectedId?: string | null;
  onSelect?: (option: RouteOption) => void;
}

const tagConfig = {
  scenic: {
    label: "Scenic",
    icon: <Star className="h-3 w-3" />,
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
  fast: {
    label: "Fastest",
    icon: <Zap className="h-3 w-3" />,
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-800",
  },
  eco: {
    label: "Eco",
    icon: <Leaf className="h-3 w-3" />,
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  popular: {
    label: "Popular",
    icon: <TrendingUp className="h-3 w-3" />,
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
};

// Muted accents distinguish routes while staying within the shared palette.
const optionAccents = [
  {
    bar: "bg-[#b94f2a]",
    selectedBorder: "border-[#b94f2a]/60",
    selectedBg: "bg-[#f8e9df]/40",
  },
  {
    bar: "bg-[#78936b]",
    selectedBorder: "border-[#78936b]/60",
    selectedBg: "bg-[#ecefe7]",
  },
  {
    bar: "bg-[#a18a65]",
    selectedBorder: "border-[#a18a65]/60",
    selectedBg: "bg-[#f3ede3]",
  },
];

export function RouteOptions({
  question = "Which route do you prefer?",
  options,
  state = "input-available",
  selectedId,
  onSelect,
}: RouteOptionsProps) {
  const isSelectable = state === "input-available";
  const selectedOption = options.find((o) => o.id === selectedId);

  if (state === "input-streaming") {
    return (
      <div className="flex flex-col gap-3 w-full">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 animate-pulse"
          >
            <div className="h-4 w-32 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted rounded mb-3" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-muted rounded-full" />
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (state === "output-available" && selectedOption) {
    const accent =
      optionAccents[options.indexOf(selectedOption) % optionAccents.length];
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted/40 text-sm w-full">
        <div className={cn("h-5 w-1 rounded-full shrink-0", accent.bar)} />
        <span className="text-muted-foreground shrink-0">Route chosen:</span>
        <span className="text-foreground font-semibold flex-1 min-w-0 truncate">
          {selectedOption.name}
        </span>
        <div className="h-6 w-6 rounded-full bg-foreground flex items-center justify-center shrink-0">
          <Check className="h-3.5 w-3.5 text-background" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-sm font-semibold text-foreground">{question}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((option, idx) => {
          const isSelected = option.id === selectedId;
          const accent = optionAccents[idx % optionAccents.length];

          return (
            <button
              key={option.id}
              onClick={() => isSelectable && onSelect?.(option)}
              disabled={!isSelectable}
              className={cn(
                "flex gap-0 p-0 rounded-xl border text-left transition-all w-full overflow-hidden",
                isSelected
                  ? cn("border-2", accent.selectedBorder, accent.selectedBg)
                  : "border-border bg-card hover:bg-muted/30 hover:border-foreground/20",
                !isSelectable && "opacity-60 cursor-default",
                isSelectable && "cursor-pointer",
              )}
            >
              {/* Left accent bar */}
              <div className={cn("w-1 shrink-0 self-stretch", accent.bar)} />

              <div className="flex flex-col gap-2 p-4 flex-1 min-w-0">
                {/* Name + check */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-foreground">
                    {option.name}
                  </p>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-background" />
                    </div>
                  )}
                </div>

                {option.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                )}

                {/* Distance + duration */}
                <div className="flex items-center gap-4">
                  {option.distance && (
                    <span className="text-xs font-medium text-foreground flex items-center gap-1">
                      <Navigation className="h-3 w-3 text-muted-foreground" />
                      {option.distance}
                    </span>
                  )}
                  {option.duration && (
                    <span className="text-xs font-medium text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {option.duration}
                    </span>
                  )}
                </div>

                {option.highlights && option.highlights.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {option.highlights.join(" · ")}
                  </p>
                )}

                {option.tags && option.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {option.tags.map((tag) => {
                      const cfg = tagConfig[tag];
                      if (!cfg) return null;
                      return (
                        <span
                          key={tag}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            cfg.bg,
                            cfg.text,
                            cfg.border,
                          )}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
