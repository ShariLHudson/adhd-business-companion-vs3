"use client";

import { useMemo } from "react";
import { CLEAR_MY_MIND_SUGGESTIONS } from "@/lib/clearMyMindCopy";

type Props = {
  onPick: (suggestion: string) => void;
  seed?: number;
};

/** Never more than three gentle next steps. */
export function ClearMyMindCompanionSuggestions({ onPick, seed = 0 }: Props) {
  const suggestions = useMemo(() => {
    const start = Math.abs(seed) % CLEAR_MY_MIND_SUGGESTIONS.length;
    const picked: string[] = [];
    for (let i = 0; i < CLEAR_MY_MIND_SUGGESTIONS.length && picked.length < 3; i++) {
      const line = CLEAR_MY_MIND_SUGGESTIONS[(start + i) % CLEAR_MY_MIND_SUGGESTIONS.length]!;
      if (!picked.includes(line)) picked.push(line);
    }
    return picked;
  }, [seed]);

  return (
    <div className="clear-my-mind-suggestions" data-testid="clear-my-mind-suggestions">
      <p className="clear-my-mind-suggestions__label">When you're ready</p>
      <div className="clear-my-mind-suggestions__list">
        {suggestions.map((line) => (
          <button
            key={line}
            type="button"
            onClick={() => onPick(line)}
            className="clear-my-mind-suggestions__btn"
          >
            {line}
          </button>
        ))}
      </div>
    </div>
  );
}
