"use client";

import type { RelationshipResponseUiTrace } from "@/lib/relationshipResponseTrace";

export function RelationshipResponseDevBadge({
  trace,
}: {
  trace: RelationshipResponseUiTrace;
}) {
  if (process.env.NODE_ENV !== "development") return null;

  const receiveMatchesRender =
    trace.firstParagraphAtApiReceive.slice(0, 80) ===
    trace.firstParagraphAtRender.slice(0, 80);

  return (
    <div
      className="mt-2 max-w-[90%] rounded-lg border border-dashed border-[#c9bfb0] bg-[#fff8ef]/90 px-3 py-2 font-mono text-[10px] leading-relaxed text-[#6b635a]"
      data-testid="relationship-response-dev-badge"
    >
      <p className="font-semibold uppercase tracking-wide text-[#9a8f82]">DEV trace</p>
      <p>Response ID: {trace.responseId}</p>
      <p>Rewritten: {String(trace.rewritten)}</p>
      <p>Enforcement ran: {String(trace.enforcementRan)}</p>
      <p>Memory confidence: {trace.memoryConfidence ?? "—"}</p>
      {trace.confidenceObservationsCount != null ? (
        <p>
          Confidence inputs: obs={trace.confidenceObservationsCount}, signals=
          {trace.confidenceSignalCount ?? 0}
          {trace.confidenceFloorApplied ? " (floor applied)" : ""}
        </p>
      ) : null}
      {trace.confidenceResultReason ? (
        <p>Confidence reason: {trace.confidenceResultReason}</p>
      ) : null}
      <p>Lead paragraph length: {trace.relationshipLeadParagraphLength}</p>
      {trace.enforcementSkipReason ? (
        <p>Skip reason: {trace.enforcementSkipReason}</p>
      ) : null}
      {trace.violationReason ? <p>Violation: {trace.violationReason}</p> : null}
      <p className="mt-1">API receive §1: {trace.firstParagraphAtApiReceive.slice(0, 120)}…</p>
      <p>After directives §1: {trace.firstParagraphAfterDirectives.slice(0, 120)}…</p>
      <p>UI render §1: {trace.firstParagraphAtRender.slice(0, 120)}…</p>
      {!receiveMatchesRender ? (
        <p className="mt-1 font-semibold text-[#a33]">
          MISMATCH: API receive ≠ UI render (client transform or stale state)
        </p>
      ) : null}
    </div>
  );
}
