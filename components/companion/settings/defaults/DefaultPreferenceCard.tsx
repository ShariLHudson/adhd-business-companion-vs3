"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  currentLabel: string;
  needsAttention: boolean;
  attentionMessage: string | null;
  expanded: boolean;
  onChangeClick: () => void;
  onChooseAnother?: () => void;
  children?: ReactNode;
  testId: string;
};

/**
 * Collapsed default group — current selection + Change.
 */
export function DefaultPreferenceCard({
  title,
  currentLabel,
  needsAttention,
  attentionMessage,
  expanded,
  onChangeClick,
  onChooseAnother,
  children,
  testId,
}: Props) {
  return (
    <div
      className="rounded-xl border border-[#e7dfd4] bg-white/85 px-4 py-4"
      data-testid={testId}
      data-needs-attention={needsAttention ? "true" : "false"}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#1f1c19]">{title}</p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Current default:{" "}
            <span className="font-semibold text-[#1f1c19]">{currentLabel}</span>
          </p>
          {needsAttention ? (
            <p
              className="mt-2 text-sm text-[#a85c4a]"
              role="status"
              data-testid={`${testId}-attention`}
            >
              {attentionMessage ??
                "This default needs attention because the service is no longer connected."}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={needsAttention && onChooseAnother ? onChooseAnother : onChangeClick}
          className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
          aria-expanded={expanded}
          data-testid={`${testId}-change`}
        >
          {needsAttention ? "Choose Another" : "Change"}
        </button>
      </div>
      {expanded ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
