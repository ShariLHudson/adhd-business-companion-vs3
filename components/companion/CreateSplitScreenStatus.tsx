"use client";

import type { CreateBuilderPhase } from "@/lib/createBuilderChat";
import type { DraftStatus } from "@/lib/createWorkflow";
import { effectiveSubtypeLabel } from "@/lib/createTypePickers";

export function CreateSplitScreenStatus({
  itemType,
  selectedSubtype,
  customSubtype,
  builderPhase,
  draftStatus,
}: {
  itemType: string | null;
  selectedSubtype?: string | null;
  customSubtype?: string | null;
  builderPhase?: CreateBuilderPhase | null;
  draftStatus?: DraftStatus;
}) {
  const subtype = effectiveSubtypeLabel(selectedSubtype ?? null, customSubtype ?? null);
  const displayType = itemType?.trim() || null;
  const phase = builderPhase ?? (displayType ? "discovery" : "pick-type");

  let headline = "Create with Shari";
  let body =
    "Tell Shari in chat what you'd like to create — she'll gather the details there.";
  let detail =
    "Once enough information is collected, your draft will appear here.";

  if (displayType) {
    headline = `Creating: ${displayType}`;
    if (phase === "pick-type") {
      body = "Shari is getting oriented in chat.";
    } else if (phase === "readiness") {
      body = "Shari has enough to build your draft.";
      detail =
        "When you're ready, approve in chat — your draft will appear here.";
    } else if (phase === "generating" || draftStatus === "building") {
      body = `Creating your ${displayType}…`;
      detail = "Using everything you shared in chat.";
    } else if (phase === "revise-offer" || phase === "done") {
      body = "Your draft is ready in this workspace.";
      detail = "Ask Shari in chat if you'd like changes.";
    } else {
      body = "Shari is gathering the details in chat.";
      detail =
        "Once enough information is collected, your draft will appear here.";
    }
  }

  return (
    <div className="companion-fade-in mx-auto flex max-w-lg flex-1 flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-[#e7dfd4] bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#1f1c19]">{headline}</p>
        {subtype ? (
          <p className="mt-1 text-sm text-[#6b635a]">
            Type: <span className="font-semibold text-[#1f1c19]">{subtype}</span>
          </p>
        ) : null}
        <p className="mt-4 text-base text-[#4b463f]">{body}</p>
        <p className="mt-2 text-sm text-[#6b635a]">{detail}</p>
      </div>
    </div>
  );
}
