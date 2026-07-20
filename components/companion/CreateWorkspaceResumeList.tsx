"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listActiveCreationWorkspaces,
  type ActiveCreationWorkspaceSummary,
} from "@/lib/createEstate/listActiveCreationWorkspaces";
import { formatLastWorkedLabel } from "@/lib/activeWorkspaceRegistry/humanReadableIdentity";

type Props = {
  onResume: (
    workspace: ActiveCreationWorkspaceSummary,
  ) => void | { ok: boolean; acknowledgment?: string };
};

/**
 * 056 / 073 / 074 — Continue Existing Work by human-readable identity.
 * Resume feedback never claims success without verified ok.
 */
export function CreateWorkspaceResumeList({ onResume }: Props) {
  const [workspaces, setWorkspaces] = useState<ActiveCreationWorkspaceSummary[]>(
    [],
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setWorkspaces(listActiveCreationWorkspaces());
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  function handleResume(ws: ActiveCreationWorkspaceSummary) {
    setBusyId(ws.id);
    setFeedback("Reopening your workspace…");
    try {
      const result = onResume(ws);
      if (result && result.ok === false) {
        setFeedback(
          result.acknowledgment ||
            "I couldn't reopen that workspace yet. Please try again.",
        );
      } else {
        setFeedback(null);
      }
    } catch {
      setFeedback(
        "I couldn't reopen that workspace yet. Please try again — I will not claim it is open until it verifies.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (workspaces.length === 0) return null;

  return (
    <div
      className="rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm"
      data-testid="create-workspace-resume-list"
    >
      <ul className="flex flex-col gap-2">
        {workspaces.map((ws) => {
          const lastWorked =
            ws.lastWorkedLabel || formatLastWorkedLabel(ws.updatedAt);
          return (
            <li key={ws.id}>
              <button
                type="button"
                onClick={() => handleResume(ws)}
                disabled={busyId !== null}
                aria-busy={busyId === ws.id}
                className="w-full rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/80 px-3 py-3 text-left transition hover:border-[#c4b8a8] hover:bg-[#f5f0e8] disabled:cursor-wait disabled:opacity-70"
                data-testid={`create-workspace-resume-${ws.id}`}
                data-primary-action="resume"
              >
                <span className="block text-base font-semibold text-[#1f1c19]">
                  {busyId === ws.id ? "Reopening…" : ws.title}
                </span>
                <span className="mt-0.5 block text-sm text-[#6b635a]">
                  {ws.kindLabel}
                  {ws.statusLabel || ws.phaseLabel
                    ? ` · ${ws.statusLabel || ws.phaseLabel}`
                    : ""}
                </span>
                {ws.nextAction ? (
                  <span className="mt-1 block text-sm text-[#4b463f]">
                    {ws.nextAction}
                  </span>
                ) : null}
                {ws.progressSummary ? (
                  <span className="mt-0.5 block text-sm text-[#6b635a]">
                    {ws.progressSummary}
                  </span>
                ) : null}
                <span className="mt-0.5 block text-sm text-[#6b635a]">
                  Last worked: {lastWorked}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {feedback ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-3 text-sm leading-relaxed text-[#6b635a]"
          data-testid="create-workspace-resume-feedback"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
