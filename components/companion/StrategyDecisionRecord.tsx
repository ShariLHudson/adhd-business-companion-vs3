"use client";

import { useState } from "react";
import {
  DECISION_RECORD_OPTIONAL_LIST_KEYS,
  decisionRecordSectionHasContent,
} from "@/lib/strategyChamber/decisionRecord";
import type { StrategyDecisionRecordView } from "@/lib/strategyChamber/types";

type Props = {
  record: StrategyDecisionRecordView;
  className?: string;
};

const SECTIONS: {
  key: keyof StrategyDecisionRecordView;
  label: string;
  list?: boolean;
  optional?: boolean;
}[] = [
  { key: "whatYouWereDeciding", label: "What You Were Deciding" },
  { key: "whatIsHappeningNow", label: "What Is Happening Now" },
  { key: "directionYouChose", label: "The Direction You Chose" },
  { key: "whyThisDirectionFits", label: "Why This Direction Fits" },
  { key: "whatYouAreNotChoosing", label: "What You Are Not Choosing Right Now" },
  { key: "assumptionsToTest", label: "Assumptions to Test", list: true, optional: true },
  { key: "risksToWatch", label: "Risks to Watch", list: true, optional: true },
  {
    key: "howYouWillKnowItIsWorking",
    label: "How You Will Know It Is Working",
    list: true,
    optional: true,
  },
  { key: "whenToReview", label: "When to Review It" },
  { key: "nextHelpfulStep", label: "Your Next Helpful Step" },
];

/**
 * Concise, expandable Strategy Decision Record — not a long strategy document.
 * Empty optional list sections stay hidden.
 */
export function StrategyDecisionRecord({ record, className = "" }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    whatYouWereDeciding: true,
    directionYouChose: true,
    nextHelpfulStep: true,
  });

  const visibleSections = SECTIONS.filter((section) => {
    if (
      section.optional &&
      DECISION_RECORD_OPTIONAL_LIST_KEYS.includes(section.key)
    ) {
      return decisionRecordSectionHasContent(section.key, record);
    }
    return true;
  });

  return (
    <article
      className={`rounded-2xl border border-[#d4cdc3] bg-white/95 p-4 ${className}`}
      data-testid="strategy-decision-record"
    >
      <h2 className="text-xl font-semibold text-[#1f1c19]">
        Strategy Decision Record
      </h2>
      <p className="mt-1 text-sm text-[#6b635a]">
        A clear summary of the choice — expand any section for more detail.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {visibleSections.map((section) => {
          const value = record[section.key];
          const isList = section.list === true;
          const expanded = open[section.key] ?? false;
          return (
            <div
              key={section.key}
              className="rounded-xl border border-[#e7dfd4] bg-[#faf8f5]"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                aria-expanded={expanded}
                onClick={() =>
                  setOpen((m) => ({ ...m, [section.key]: !expanded }))
                }
                data-testid={`decision-record-${section.key}`}
              >
                <span className="text-sm font-semibold text-[#1f1c19]">
                  {section.label}
                </span>
                <span aria-hidden="true" className="text-xs font-bold text-[#1e4f4f]">
                  {expanded ? "−" : "+"}
                </span>
              </button>
              {expanded ? (
                <div className="border-t border-[#e7dfd4] px-3 py-2.5 text-sm leading-relaxed text-[#4b463f]">
                  {isList ? (
                    <ul className="list-disc space-y-1 pl-5">
                      {(value as string[]).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{String(value || "—")}</p>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}
