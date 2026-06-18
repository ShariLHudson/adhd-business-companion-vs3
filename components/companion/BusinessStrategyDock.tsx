"use client";

import type {
  BusinessStrategySession,
} from "@/lib/businessStrategyBuilder";

export function BusinessStrategyDock({
  session,
  draft,
  onTalkWithShari,
  onDismiss,
}: {
  session?: BusinessStrategySession | null;
  draft?: { typeLabel: string; draft: string } | null;
  onTalkWithShari?: () => void;
  onDismiss?: () => void;
}) {
  if (!session && !draft) return null;

  const label = draft?.typeLabel ?? session?.typeLabel ?? "Business Strategy";
  const building =
    session &&
    session.phase !== "coaching" &&
    session.phase !== "done" &&
    !draft;
  const answered = session
    ? session.questions.filter((q) => session.answers[q.id]?.trim()).length
    : 0;
  const total = session?.questions.length ?? 0;

  return (
    <div className="mb-4 rounded-2xl border border-[#1e4f4f]/25 bg-[#1e4f4f]/[0.06] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1e4f4f]">
            {building ? "Building with Shari" : "Your custom plan"}
          </p>
          <p className="mt-0.5 text-base font-semibold text-[#1f1c19]">{label}</p>
          {building && total > 0 ? (
            <p className="mt-1 text-sm text-[#6b635a]">
              {answered} of {total} basics answered — keep going in chat.
            </p>
          ) : (
            <p className="mt-1 text-sm text-[#6b635a]">
              Browse library strategies below anytime — your plan stays here.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {onTalkWithShari ? (
            <button
              type="button"
              onClick={onTalkWithShari}
              className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              {building ? "Answer in chat" : "Talk it out"}
            </button>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
            >
              Close plan
            </button>
          ) : null}
        </div>
      </div>
      {draft?.draft ? (
        <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#e7dfd4] bg-white p-3 text-xs leading-relaxed text-[#2d2926]">
          {draft.draft}
        </pre>
      ) : null}
    </div>
  );
}
