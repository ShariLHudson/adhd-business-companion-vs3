"use client";

import {
  formatSavedAt,
  type SavedArtifactRecord,
} from "@/lib/savedArtifact";

const btn =
  "rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]";

export function SavedLocationPanel({
  record,
  onOpenSavedWork,
  onAddToProject,
  onCreateGoogleDoc,
  onPrint,
  onCopy,
}: {
  record: SavedArtifactRecord;
  onOpenSavedWork?: () => void;
  onAddToProject?: () => void;
  onCreateGoogleDoc?: () => void;
  onPrint?: () => void;
  onCopy?: () => void;
}) {
  const lastSaved = formatSavedAt(record.lastEdited ?? record.savedAt);
  const exported = Boolean(record.googleDocUrl);

  return (
    <div className="mt-3 rounded-xl border border-[#1e4f4f]/20 bg-white/90 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        Saved to
      </p>
      <dl className="mt-2 space-y-1.5 text-sm text-[#2d2926]">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold text-[#6b635a]">Type</dt>
          <dd>{record.artifactType}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold text-[#6b635a]">Title</dt>
          <dd>{record.artifactTitle}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold text-[#6b635a]">Status</dt>
          <dd>
            {exported
              ? "Exported"
              : record.savedStatus === "saved"
                ? "Saved"
                : "Draft"}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold text-[#6b635a]">Location</dt>
          <dd>{record.savedLocationDetail || record.savedLocation}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold text-[#6b635a]">Project</dt>
          <dd>{record.projectName ?? "Not added yet"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-semibold text-[#6b635a]">Google Doc</dt>
          <dd>
            {record.googleDocUrl ? (
              <a
                href={record.googleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#1e4f4f] underline"
              >
                Open Google Doc
              </a>
            ) : (
              "Not created yet"
            )}
          </dd>
        </div>
        {lastSaved ? (
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 font-semibold text-[#6b635a]">Updated</dt>
            <dd>{lastSaved}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        {onOpenSavedWork ? (
          <button type="button" onClick={onOpenSavedWork} className={btn}>
            📂 Open Saved Work
          </button>
        ) : null}
        {onAddToProject ? (
          <button type="button" onClick={onAddToProject} className={btn}>
            📁 Add to Project
          </button>
        ) : null}
        {onCreateGoogleDoc ? (
          <button type="button" onClick={onCreateGoogleDoc} className={btn}>
            📝 Create Google Doc
          </button>
        ) : null}
        {onCopy ? (
          <button type="button" onClick={onCopy} className={btn}>
            📋 Copy
          </button>
        ) : null}
        {onPrint ? (
          <button type="button" onClick={onPrint} className={btn}>
            🖨 Print
          </button>
        ) : null}
      </div>
    </div>
  );
}
