"use client";

import type { CreateWorkspacePhase } from "@/lib/createBuild";
import { effectiveSubtypeLabel } from "@/lib/createTypePickers";

const PHASE_COPY: Record<
  CreateWorkspacePhase,
  { body: string; detail: string }
> = {
  gathering: {
    body: "Shari is gathering the details in chat.",
    detail:
      "Once enough information is collected, your draft will appear here.",
  },
  ready: {
    body: "Ready to build — approve in chat when you're set.",
    detail: "Your draft will appear here as soon as generation starts.",
  },
  generating: {
    body: "Creating your draft…",
    detail: "This usually takes a few seconds.",
  },
  "draft-ready": {
    body: "Your draft is ready in this workspace.",
    detail: "Ask Shari in chat if you'd like changes.",
  },
};

export function CreateSplitScreenStatus({
  itemType,
  selectedSubtype,
  customSubtype,
  workspacePhase = "gathering",
}: {
  itemType: string | null;
  selectedSubtype?: string | null;
  customSubtype?: string | null;
  workspacePhase?: CreateWorkspacePhase;
}) {
  const subtype = effectiveSubtypeLabel(selectedSubtype ?? null, customSubtype ?? null);
  const displayType = itemType?.trim() || null;
  const copy = PHASE_COPY[workspacePhase];

  const headline = displayType ? `Creating: ${displayType}` : "Create with Shari";

  return (
    <div className="companion-fade-in mx-auto flex max-w-lg flex-1 flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-[#e7dfd4] bg-white p-6 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          {workspacePhase === "gathering"
            ? "Gathering information"
            : workspacePhase === "ready"
              ? "Ready to build"
              : workspacePhase === "generating"
                ? "Generating draft"
                : "Draft ready"}
        </p>
        <p className="mt-2 text-lg font-semibold text-[#1f1c19]">{headline}</p>
        {subtype ? (
          <p className="mt-1 text-sm text-[#6b635a]">
            Type: <span className="font-semibold text-[#1f1c19]">{subtype}</span>
          </p>
        ) : null}
        <p className="mt-4 text-base text-[#4b463f]">{copy.body}</p>
        <p className="mt-2 text-sm text-[#6b635a]">{copy.detail}</p>
      </div>
    </div>
  );
}
