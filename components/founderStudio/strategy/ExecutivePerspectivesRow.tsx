"use client";

import { useState } from "react";

import type { StrategyPerspective } from "@/lib/founder/strategyCenter/types";

type ExecutivePerspectivesRowProps = {
  perspectives: StrategyPerspective[];
};

export function ExecutivePerspectivesRow({ perspectives }: ExecutivePerspectivesRowProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="strategy-perspectives" aria-labelledby="strategy-perspectives-heading">
      <h2 className="strategy-perspectives__heading" id="strategy-perspectives-heading">
        Executive Perspectives
      </h2>
      <div className="strategy-perspectives__track">
        {perspectives.map((perspective) => {
          const expanded = expandedId === perspective.id;
          return (
            <article
              key={perspective.id}
              className={`strategy-perspective${expanded ? " strategy-perspective--expanded" : ""}`}
            >
              <div className="strategy-perspective__initials" aria-hidden="true">
                {perspective.initials}
              </div>
              <h3 className="strategy-perspective__role">{perspective.role}</h3>
              <p className="strategy-perspective__question">{perspective.keyQuestion}</p>
              {expanded ? (
                <p className="strategy-perspective__insight">{perspective.insight}</p>
              ) : (
                <p className="strategy-perspective__insight strategy-perspective__insight--muted">
                  {perspective.insight}
                </p>
              )}
              <button
                type="button"
                className="strategy-perspective__expand"
                onClick={() => setExpandedId(expanded ? null : perspective.id)}
                aria-expanded={expanded}
              >
                {expanded ? "Close" : "Expand"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
