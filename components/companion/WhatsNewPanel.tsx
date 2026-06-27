"use client";

import { useMemo } from "react";
import { generateWhatsNewSummary } from "@/lib/trustSafeCommunication";

/**
 * Calm summary of recent companion improvements — trust-safe, benefit-focused.
 */
export function WhatsNewPanel() {
  const summary = useMemo(() => generateWhatsNewSummary(), []);

  return (
    <div className="px-5 pb-8">
      <p className="mb-4 text-sm leading-relaxed text-[#5a5248]">
        Quiet improvements behind the scenes — nothing you need to learn or set up.
      </p>
      <ul className="space-y-3" role="list">
        {summary.items.map((item) => (
          <li
            key={`${item.area}-${item.benefit.slice(0, 32)}`}
            className="rounded-xl border border-[#e7dfd4] bg-[#fffaf3] px-4 py-3 text-sm leading-relaxed text-[#3a342e]"
          >
            {item.benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}
