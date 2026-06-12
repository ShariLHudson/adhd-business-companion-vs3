"use client";

import type { CursorPromptInput } from "@/lib/founderWorkspace/cursorPromptGenerator";
import type { FounderTrackedIssue } from "@/lib/founderWorkspace/tracking";
import { issueSeverityLabel } from "@/lib/founderWorkspace/tracking";

type FounderRetestQueuePanelProps = {
  open: boolean;
  pending: FounderTrackedIssue[];
  failed: FounderTrackedIssue[];
  onClose: () => void;
  onOpenIssue: (issue: FounderTrackedIssue) => void;
  onCursorPrompt?: (context: CursorPromptInput) => void;
};

function IssueRow({
  issue,
  onOpen,
  onCursorPrompt,
}: {
  issue: FounderTrackedIssue;
  onOpen: () => void;
  onCursorPrompt?: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-[#ebe4d9] bg-[#faf8f5] px-3 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium text-[#1f1c19]">{issue.title}</p>
        <p className="text-[11px] text-[#6b635a]">
          {issueSeverityLabel(issue.severity)}
          {issue.relatedProjectTitle
            ? ` · ${issue.relatedProjectTitle}`
            : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        {onCursorPrompt ? (
          <button
            type="button"
            onClick={onCursorPrompt}
            className="rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium hover:bg-white"
          >
            Cursor prompt
          </button>
        ) : null}
        <button
          type="button"
          onClick={onOpen}
          className="rounded-md border border-[#d4cdc3] px-2 py-1 text-[11px] font-medium hover:bg-white"
        >
          Open
        </button>
      </div>
    </li>
  );
}

export function FounderRetestQueuePanel({
  open,
  pending,
  failed,
  onClose,
  onOpenIssue,
  onCursorPrompt,
}: FounderRetestQueuePanelProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Retest queue"
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-[#1f1c19]">Retest queue</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#6b635a] hover:underline"
          >
            Close
          </button>
        </div>

        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase text-[#1e4f4f]">
            Pending retests ({pending.length})
          </h3>
          {pending.length === 0 ? (
            <p className="mt-2 text-sm text-[#6b635a]">Nothing waiting for retest.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {pending.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  onOpen={() => onOpenIssue(issue)}
                  onCursorPrompt={
                    onCursorPrompt
                      ? () => onCursorPrompt({ kind: "retest", issue })
                      : undefined
                  }
                />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-5 border-t border-[#ebe4d9] pt-4">
          <h3 className="text-xs font-semibold uppercase text-[#a85c4a]">
            Failed retests ({failed.length})
          </h3>
          {failed.length === 0 ? (
            <p className="mt-2 text-sm text-[#6b635a]">No failed retests.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {failed.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  onOpen={() => onOpenIssue(issue)}
                  onCursorPrompt={
                    onCursorPrompt
                      ? () => onCursorPrompt({ kind: "retest", issue })
                      : undefined
                  }
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
