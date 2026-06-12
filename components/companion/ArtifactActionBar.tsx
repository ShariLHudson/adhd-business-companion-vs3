"use client";

import type { ArtifactExportAction } from "@/lib/artifactType";

const ACTION_LABELS: Record<ArtifactExportAction, string> = {
  save: "Save Proposal",
  "google-doc": "Create Google Doc",
  print: "Print",
  copy: "Copy",
  "add-to-project": "Add to Project",
  "show-location": "Where Is This Saved?",
};

export function ArtifactActionBar({
  artifactType,
  line,
  actions,
  onAction,
  onDismiss,
}: {
  artifactType: string;
  line?: string;
  actions: ArtifactExportAction[];
  onAction: (action: ArtifactExportAction) => void;
  onDismiss: () => void;
}) {
  const labels: Record<ArtifactExportAction, string> = {
    save: `Save ${artifactType}`,
    "google-doc": "Create Google Doc",
    print: "Print",
    copy: "Copy",
    "add-to-project": "Add to Project",
    "show-location": "Where Is This Saved?",
  };

  return (
    <div
      className="mb-2 rounded-xl border border-[#1e4f4f]/25 bg-[#1e4f4f]/[0.06] px-3 py-2.5 shadow-sm"
      role="region"
      aria-label="Artifact actions"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e4f4f]/70">
        Ready to export
      </p>
      {line ? (
        <p className="mt-0.5 text-sm leading-snug text-[#6b635a]">{line}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onAction(action)}
            className="rounded-full bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          >
            {labels[action] ?? ACTION_LABELS[action]}
          </button>
        ))}
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
