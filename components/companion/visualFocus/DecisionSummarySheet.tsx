"use client";

import { useState } from "react";
import {
  buildDecisionSummary,
  type DecisionSummary,
} from "@/lib/visualFocus/decisionSummary";
import type { VisualFocusMap } from "@/lib/visualFocus/types";

/**
 * Decision Summary — a calm one-page synthesis, generated only with
 * permission. First Spark asks; only after "Yes" does the summary appear.
 * Never auto-produced, never a report dump.
 */
export function DecisionSummarySheet({
  map,
  onClose,
}: {
  map: VisualFocusMap;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState<DecisionSummary | null>(null);

  function generate() {
    setSummary(buildDecisionSummary(map));
  }

  return (
    <div
      className="cartographers-learn-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Decision Summary"
      data-testid="decision-summary-sheet"
    >
      <div className="cartographers-learn-overlay__card cartographers-decision-summary">
        {summary === null ? (
          <>
            <p className="cartographers-learn-overlay__name">Decision Summary</p>
            <p className="cartographers-learn-overlay__tip">
              Would you like me to pull this together into a calm one-page
              summary — what you&rsquo;re deciding, what matters most, and a
              suggested next step?
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="cartographers-chrome-link cartographers-chrome-link--ink"
                data-testid="decision-summary-cancel"
                onClick={onClose}
              >
                Not now
              </button>
              <button
                type="button"
                className="cartographers-chrome-link cartographers-chrome-link--ink cartographers-chrome-link--strong"
                data-testid="decision-summary-generate"
                onClick={generate}
              >
                Yes, create it
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="cartographers-learn-overlay__name">
              {summary.deciding}
            </p>
            <dl
              className="cartographers-decision-summary__list"
              data-testid="decision-summary-content"
            >
              <SummaryRow
                label="What you're deciding"
                value={summary.deciding}
              />
              <SummaryRow
                label="What matters most"
                value={summary.mattersMost}
              />
              <SummaryRow
                label="Strongest opportunity"
                value={summary.strongestOpportunity}
              />
              <SummaryRow label="Biggest risk" value={summary.biggestRisk} />
              <SummaryRow
                label="Suggested next step"
                value={summary.nextStep}
              />
            </dl>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="cartographers-chrome-link cartographers-chrome-link--ink"
                data-testid="decision-summary-print"
                onClick={() => window.print()}
              >
                Print
              </button>
              <button
                type="button"
                className="cartographers-chrome-link cartographers-chrome-link--ink cartographers-chrome-link--strong"
                data-testid="decision-summary-close"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="cartographers-decision-summary__row">
      <dt className="cartographers-decision-summary__label">{label}</dt>
      <dd className="cartographers-decision-summary__value">
        {value?.trim() ? value : "Nothing stood out here yet."}
      </dd>
    </div>
  );
}
