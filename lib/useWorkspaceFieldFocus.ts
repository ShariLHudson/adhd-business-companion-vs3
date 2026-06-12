"use client";

import { useEffect, useRef } from "react";
import type { WorkspaceFieldId } from "./workspaceAwareness";

/** Highlight + scroll a workspace field once per focus stamp (avoids focus loops). */
export function useWorkspaceFieldFocus(
  fieldId: WorkspaceFieldId | null | undefined,
  focusStamp: number,
  elementId: string | null,
  extraDeps: unknown[] = [],
) {
  const lastApplied = useRef<string | null>(null);

  useEffect(() => {
    if (!fieldId || !elementId) return;
    const token = `${fieldId}:${focusStamp}`;
    if (lastApplied.current === token) return;
    lastApplied.current = token;

    const el = document.getElementById(elementId);
    if (!el) return;

    el.classList.add("workspace-field-highlight");
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (el instanceof HTMLElement && "focus" in el) {
      el.focus({ preventScroll: true });
    }
    const timer = window.setTimeout(
      () => el.classList.remove("workspace-field-highlight"),
      3200,
    );
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stamp gates re-focus
  }, [fieldId, focusStamp, elementId, ...extraDeps]);
}
