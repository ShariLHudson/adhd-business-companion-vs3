"use client";

import { resolveLivingChangeVisualStatus } from "@/lib/livingLifeEngine/livingChangeVisualStatus";
import type { LivingChangeSet } from "@/lib/livingLifeEngine/types";
import type { CompanionMotionKind } from "@/lib/companionEnvironmentIntelligence/types";

type Props = {
  livingChange?: LivingChangeSet | null;
  motionEnabled: CompanionMotionKind[];
  photographId?: string;
};

/** Development-only — confirms visible render matches resolved living change. */
export function LivingChangeVisualDebug({
  livingChange,
  motionEnabled,
  photographId,
}: Props) {
  if (process.env.NODE_ENV !== "development") return null;

  const status = resolveLivingChangeVisualStatus({
    livingChange,
    motionEnabled,
    photographId,
  });

  return (
    <aside
      className="living-change-visual-debug"
      data-testid="living-change-visual-debug"
      aria-label="Living change visual debug"
    >
      <p className="living-change-visual-debug__title">Living change render</p>
      <ul className="living-change-visual-debug__list">
        {status.entries.map((entry) => (
          <li key={entry.id}>
            <span>{entry.label}</span>
            <span
              data-rendered={entry.rendered ? "yes" : "no"}
              className={
                entry.rendered
                  ? "living-change-visual-debug__ok"
                  : "living-change-visual-debug__blocked"
              }
            >
              rendered: {entry.rendered ? "yes" : "no"}
            </span>
            {entry.suppressionReason ? (
              <span className="living-change-visual-debug__reason">
                {entry.suppressionReason}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <p
        className={
          status.allResolvedRendered
            ? "living-change-visual-debug__ok"
            : "living-change-visual-debug__blocked"
        }
      >
        {status.allResolvedRendered
          ? "All resolved changes render on screen."
          : "Some logic changes are not visible — check suppression reasons."}
      </p>
    </aside>
  );
}
