"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listActiveCreationWorkspaces,
  type ActiveCreationWorkspaceSummary,
} from "@/lib/createEstate/listActiveCreationWorkspaces";
import { formatLastWorkedLabel } from "@/lib/activeWorkspaceRegistry/humanReadableIdentity";
import { renameActiveWorkspaceTitleDurable } from "@/lib/activeWorkspaceRegistry";

type Props = {
  onResume: (
    workspace: ActiveCreationWorkspaceSummary,
  ) => void | { ok: boolean; acknowledgment?: string };
  /** Spec 129 — every Work item supports rename; immediate save. */
  onRename?: (workspaceId: string, title: string) => void | Promise<void>;
};

async function defaultRename(workspaceId: string, title: string): Promise<void> {
  const result = await renameActiveWorkspaceTitleDurable(workspaceId, title);
  if (!result.ok) {
    throw new Error(result.message);
  }
}

/**
 * 056 / 073 / 074 / 129 — Continue Existing Work by human-readable identity.
 * One resume CTA per Work · inline rename on title.
 */
export function CreateWorkspaceResumeList({
  onResume,
  onRename = defaultRename,
}: Props) {
  const [workspaces, setWorkspaces] = useState<ActiveCreationWorkspaceSummary[]>(
    [],
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);

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
    if (renameId === ws.id) return;
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

  async function commitRename(ws: ActiveCreationWorkspaceSummary) {
    const next = renameDraft.trim();
    if (!next || !onRename) {
      setRenameId(null);
      return;
    }
    if (next === ws.title) {
      setRenameId(null);
      return;
    }
    setRenameBusy(true);
    setFeedback(null);
    try {
      await Promise.resolve(onRename(ws.id, next));
      setRenameId(null);
      refresh();
    } catch {
      setFeedback("I couldn't rename that yet. Your title is still here — try again.");
    } finally {
      setRenameBusy(false);
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
          const renaming = renameId === ws.id;
          return (
            <li key={ws.id}>
              <div
                className="w-full rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/80 px-3 py-3 text-left transition hover:border-[#c4b8a8] hover:bg-[#f5f0e8]"
                data-testid={`create-workspace-resume-${ws.id}`}
              >
                {renaming ? (
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void commitRename(ws);
                    }}
                  >
                    <input
                      type="text"
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setRenameId(null);
                      }}
                      disabled={renameBusy}
                      autoFocus
                      aria-label="Rename this work"
                      className="w-full rounded-lg border border-[#cfc6b8] bg-white px-3 py-2 text-base font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                      data-testid={`create-workspace-rename-input-${ws.id}`}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={renameBusy}
                        className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-70"
                        data-testid={`create-workspace-rename-save-${ws.id}`}
                      >
                        {renameBusy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={renameBusy}
                        onClick={() => setRenameId(null)}
                        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#6b635a]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {onRename ? (
                      <button
                        type="button"
                        className="block w-full text-left text-base font-semibold text-[#1f1c19] hover:underline"
                        data-testid={`create-workspace-rename-trigger-${ws.id}`}
                        aria-label={`Rename ${ws.title}`}
                        onClick={() => {
                          setRenameId(ws.id);
                          setRenameDraft(ws.title);
                        }}
                      >
                        {ws.title}
                      </button>
                    ) : (
                      <span className="block text-base font-semibold text-[#1f1c19]">
                        {ws.title}
                      </span>
                    )}
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {ws.kindLabel}
                      {ws.statusLabel || ws.phaseLabel
                        ? ` · ${ws.statusLabel || ws.phaseLabel}`
                        : ""}
                    </span>
                    {ws.currentFocusTitle ? (
                      <span
                        className="mt-1 block text-sm font-medium text-[#1e4f4f]"
                        data-testid="create-workspace-current-focus"
                      >
                        Current Focus: {ws.currentFocusTitle}
                      </span>
                    ) : null}
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
                    <button
                      type="button"
                      onClick={() => handleResume(ws)}
                      disabled={busyId !== null}
                      aria-busy={busyId === ws.id}
                      className="mt-2 inline-block text-sm font-semibold text-[#1e4f4f] hover:underline disabled:cursor-wait disabled:opacity-70"
                      data-primary-action="resume"
                      data-testid={`create-workspace-continue-${ws.id}`}
                    >
                      {busyId === ws.id ? "Continuing…" : "Continue →"}
                    </button>
                  </>
                )}
              </div>
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
