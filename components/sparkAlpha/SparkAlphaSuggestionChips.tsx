"use client";

import type { SparkAlphaSuggestion } from "@/lib/sparkAlpha/suggestionParser";

type SparkAlphaSuggestionChipsProps = {
  suggestions: SparkAlphaSuggestion[];
  disabled?: boolean;
  onChoose: (suggestion: SparkAlphaSuggestion) => void;
};

export function SparkAlphaSuggestionChips({
  suggestions,
  disabled,
  onChoose,
}: SparkAlphaSuggestionChipsProps) {
  if (!suggestions.length) return null;

  return (
    <div className="spark-alpha-suggestions" role="group" aria-label="Quick replies">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          className="spark-alpha-suggestions__chip"
          disabled={disabled}
          onClick={() => onChoose(suggestion)}
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
