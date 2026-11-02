"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
}

interface MultipleChoiceProps {
  question: string;
  options: Option[];
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  selectedId?: string;
  onSelect: (option: Option) => void;
}

// One consistent selection treatment keeps the choices calm and readable.
const optionAccents = [
  {
    selected: "bg-[#b94f2a] border-[#b94f2a] text-white",
    idle: "hover:border-[#b94f2a]/40 hover:bg-[#f8e9df]/40",
  },
];

export function MultipleChoice({
  question,
  options,
  state,
  selectedId,
  onSelect,
}: MultipleChoiceProps) {
  const isSelectable = state === "input-available";
  const isOptionalStopsQuestion =
    /\bstops?\b/i.test(question) && !/\bcharg(?:e|ing|er)\b/i.test(question);
  const hasSkipOption = options.some((option) =>
    /\b(?:no|none|skip|without|straight through)\b/i.test(option.label),
  );
  const visibleOptions =
    isOptionalStopsQuestion && !hasSkipOption
      ? [...options, { id: "no_extra_stops", label: "No extra stops" }]
      : options;
  const selectedOption = visibleOptions.find((o) => o.id === selectedId);

  if (state === "output-available" && selectedOption) {
    const selectedIdx = visibleOptions.indexOf(selectedOption);
    const accent = optionAccents[selectedIdx % optionAccents.length];
    return (
      <div className="flex flex-col gap-1.5 max-w-md">
        <p className="text-xs text-muted-foreground">{question}</p>
        <div
          className={cn(
            "inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-semibold border",
            accent.selected,
          )}
        >
          <Check className="h-3 w-3" />
          {selectedOption.label}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-lg w-full">
      <p className="text-sm font-semibold text-foreground text-balance">
        {question}
      </p>
      {state === "input-streaming" ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {visibleOptions.map((option, idx) => {
            const isSelected = option.id === selectedId;
            const accent = optionAccents[idx % optionAccents.length];
            return (
              <button
                key={option.id}
                onClick={() => isSelectable && onSelect(option)}
                disabled={!isSelectable}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium text-center transition-all",
                  isSelected
                    ? accent.selected
                    : cn(
                        "bg-card border-border text-foreground",
                        isSelectable && accent.idle,
                      ),
                  !isSelectable && "opacity-50 cursor-default",
                  isSelectable && "cursor-pointer active:scale-[0.97]",
                )}
              >
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
