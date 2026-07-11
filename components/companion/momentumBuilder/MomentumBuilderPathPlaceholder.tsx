"use client";

import { momentumPathStoneCount } from "@/lib/momentumBuilderRoom/momentumPathHooks";

/**
 * Momentum Path — V2 stone garden placeholder (architecture only).
 */
export function MomentumBuilderPathPlaceholder() {
  const stones = momentumPathStoneCount();

  return (
    <div
      className="momentum-builder-room__momentum-path"
      data-testid="momentum-path-placeholder"
      aria-hidden
    >
      <p className="momentum-builder-room__momentum-path-label">Momentum Path</p>
      <div className="momentum-builder-room__momentum-path-stones">
        {Array.from({ length: Math.max(3, stones + 2) }).map((_, i) => (
          <span
            key={i}
            className={`momentum-builder-room__stone${
              i < stones ? " momentum-builder-room__stone--placed" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
