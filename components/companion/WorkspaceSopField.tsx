"use client";

import { getCurrentSopStep, type WorkspaceSession } from "@/lib/workspaceSop";
import { useWorkspaceFieldFocus } from "@/lib/useWorkspaceFieldFocus";
import type { WorkspaceFieldId } from "@/lib/workspaceAwareness";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";

const PANEL_FIELDS = new Set<WorkspaceFieldId>([
  "workshop-audience",
  "workshop-problem",
  "workshop-sections",
  "workshop-story",
  "workshop-exercise",
  "workshop-offer",
  "project-horizon",
  "project-status",
  "create-audience",
  "create-hook",
  "create-main-point",
  "create-cta",
]);

export function isSopPanelField(fieldId: WorkspaceFieldId): boolean {
  return PANEL_FIELDS.has(fieldId);
}

export function WorkspaceSopField({
  session,
  focusField,
  focusStamp = 0,
  values,
  onChange,
}: {
  session: WorkspaceSession;
  focusField?: WorkspaceFieldId | null;
  focusStamp?: number;
  values: Record<string, string>;
  onChange: (stepId: string, value: string) => void;
}) {
  const step = getCurrentSopStep(session);
  if (!isSopPanelField(step.fieldId)) return null;

  const value = values[step.id] ?? "";

  useWorkspaceFieldFocus(
    focusField === step.fieldId ? step.fieldId : null,
    focusStamp,
    `workspace-field-${step.fieldId}`,
    [step.id],
  );

  return (
    <div className="mt-4 rounded-2xl border border-[#c9bfb0] bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
        {step.label}
      </p>
      <p className="mt-1 text-sm text-[#6b635a]">{step.coachQuestion}</p>
      <VoiceAnswerField
        id={`workspace-field-${step.fieldId}`}
        value={value}
        onChange={(v) => onChange(step.id, v)}
        placeholder="A sentence or two is enough."
        className="mt-3"
        micTitle={step.coachQuestion}
      />
    </div>
  );
}
