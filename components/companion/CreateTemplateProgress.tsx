import {
  catalogLabelToCreateType,
  getRequiredFields,
  hasGuidedTemplateFields,
} from "@/lib/createTemplateFields";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { resolvedTypeLabel } from "@/lib/createWorkflow";

export function CreateTemplateProgress({
  workflow,
}: {
  workflow: CreateWorkflowState;
}) {
  const typeLabel = resolvedTypeLabel(workflow);
  if (!hasGuidedTemplateFields(typeLabel)) return null;

  const guidedType = catalogLabelToCreateType(typeLabel);
  if (!guidedType) return null;

  const fields = getRequiredFields(guidedType);

  return (
    <div className="rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[#1f1c19]">Template Progress</h3>
      <div className="mt-3 space-y-2">
        {fields.map((field) => {
          const value = workflow.discoveryAnswers[field.id];
          const done = Boolean(value?.trim());
          return (
            <div
              key={field.id}
              className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[#1f1c19]">
                  {done ? "✓" : "□"} {field.label}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#9a8f82]">
                  {done ? "Done" : "Open"}
                </span>
              </div>
              {done ? (
                <p className="mt-1 whitespace-pre-wrap text-[#4a443c]">
                  {value}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
