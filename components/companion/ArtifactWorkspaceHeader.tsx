"use client";

import { useState } from "react";
import { ExportActions } from "@/components/companion/ExportActions";
import { SavedLocationPanel } from "@/components/companion/SavedLocationPanel";
import {
  formatSavedAt,
  formatSavedArtifactLocation,
  type SavedArtifactRecord,
} from "@/lib/savedArtifact";
import type { RefObject } from "react";

const btn =
  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors";
const btnPrimary = `${btn} bg-[#1e4f4f] text-white hover:bg-[#163a3a]`;
const btnSecondary = `${btn} border border-[#1e4f4f]/40 bg-white text-[#1e4f4f] hover:bg-[#f0f5f5]`;
const btnSaved = `${btn} border border-[#1e4f4f]/25 bg-[#1e4f4f]/10 text-[#1e4f4f]`;

export function ArtifactWorkspaceHeader({
  record,
  draft,
  title,
  onTitleChange,
  onEdit,
  onSave,
  onSaveAgain,
  onAddToProject,
  onShowLocation,
  onOpenSavedWork,
  onCopy,
  docButtonRef,
  printButtonRef,
  onGoogleDocCreated,
  onPrint,
  onBeforeExport,
  onMarkReady,
  googleFirst = false,
  flash,
  locationOpen,
  onLocationOpenChange,
}: {
  record: SavedArtifactRecord;
  draft: string;
  title: string;
  onTitleChange: (title: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onSaveAgain: () => void;
  onAddToProject: () => void;
  onShowLocation: () => void;
  onOpenSavedWork?: () => void;
  onCopy: () => void;
  docButtonRef?: RefObject<HTMLButtonElement | null>;
  printButtonRef?: RefObject<HTMLButtonElement | null>;
  onGoogleDocCreated?: (url: string) => void;
  onPrint?: () => void;
  onBeforeExport?: () => string | null;
  onMarkReady?: () => void;
  /** Google-first flow — hide internal save; emphasize "ready" export. */
  googleFirst?: boolean;
  flash?: string | null;
  locationOpen?: boolean;
  onLocationOpenChange?: (open: boolean) => void;
}) {
  const [localLocationOpen, setLocalLocationOpen] = useState(false);
  const showLocation = locationOpen ?? localLocationOpen;
  const setShowLocation = onLocationOpenChange ?? setLocalLocationOpen;

  const isSaved = record.savedStatus === "saved" || record.savedStatus === "exported";
  const lastSaved = formatSavedAt(record.lastEdited ?? record.savedAt);

  function guardedExport(action: () => void) {
    const err = onBeforeExport?.();
    if (err) {
      onShowLocation();
      return;
    }
    action();
  }

  return (
    <div className="sticky top-0 z-20 shrink-0 border-b border-[#1e4f4f]/15 bg-[#faf7f2]/98 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            {record.artifactType}
          </p>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={`Name this ${record.artifactType}`}
            className="mt-0.5 w-full border-0 bg-transparent p-0 text-lg font-semibold text-[#1f1c19] outline-none placeholder:text-[#9a8f82] focus:ring-0"
          />
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
            record.savedStatus === "exported"
              ? "bg-[#1e4f4f]/20 text-[#1e4f4f]"
              : isSaved
                ? "bg-[#1e4f4f]/15 text-[#1e4f4f]"
                : "bg-[#c08a3e]/15 text-[#8a5c2e]"
          }`}
        >
          {record.savedStatus === "exported"
            ? "Exported"
            : isSaved
              ? "Saved"
              : "Draft"}
        </span>
      </div>

      {!googleFirst ? (
        <p className="mt-1 text-sm text-[#6b635a]">
          <span className="font-semibold text-[#2d2926]">Saved in:</span>{" "}
          {formatSavedArtifactLocation(record)}
          {lastSaved ? (
            <>
              {" "}
              · <span className="font-semibold">Updated:</span> {lastSaved}
            </>
          ) : null}
        </p>
      ) : (
        <p className="mt-1 text-sm text-[#6b635a]">
          Review your draft below. You can edit it, copy it, send it to Google
          Docs, print it, or add it to a project.
        </p>
      )}

      {record.googleDocUrl ? (
        <p className="mt-1 text-sm">
          <a
            href={record.googleDocUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#1e4f4f] underline"
          >
            Open Google Doc
          </a>
        </p>
      ) : null}

      {flash ? (
        <p className="mt-2 text-sm font-semibold text-[#1e4f4f]">{flash}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onEdit} className={btnSecondary}>
          ✏️ Edit
        </button>
        {googleFirst ? (
          <>
            <button type="button" onClick={onCopy} className={btnSecondary}>
              📋 Copy
            </button>
            <button
              type="button"
              onClick={onMarkReady}
              className={btnPrimary}
            >
              ✓ It&apos;s ready
            </button>
          </>
        ) : (
          <>
            {isSaved ? (
              <>
                <span className={`${btnSaved} cursor-default`}>✓ Saved</span>
                <button type="button" onClick={onSaveAgain} className={btnPrimary}>
                  Save Again
                </button>
              </>
            ) : (
              <button type="button" onClick={onSave} className={btnPrimary}>
                💾 Save
              </button>
            )}
            <button type="button" onClick={onCopy} className={btnSecondary}>
              📋 Copy
            </button>
            <button type="button" onClick={onAddToProject} className={btnSecondary}>
              📁 Add to Project
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLocation(!showLocation);
                onShowLocation();
              }}
              className={btnSecondary}
            >
              📍 Where Is This Saved?
            </button>
          </>
        )}
      </div>

      {showLocation && !googleFirst ? (
        <SavedLocationPanel
          record={record}
          onOpenSavedWork={onOpenSavedWork}
          onAddToProject={onAddToProject}
          onCreateGoogleDoc={() =>
            guardedExport(() => docButtonRef?.current?.click())
          }
          onPrint={() => guardedExport(() => printButtonRef?.current?.click())}
          onCopy={onCopy}
        />
      ) : null}

      {!googleFirst ? (
        <ExportActions
          text={draft}
          title={title.trim() || record.artifactTitle}
          artifactType={record.artifactType}
          variant="workspace"
          docButtonRef={docButtonRef}
          printButtonRef={printButtonRef}
          onGoogleDocCreated={onGoogleDocCreated}
          onPrint={onPrint}
          onBeforeAction={onBeforeExport}
          compact
        />
      ) : null}
    </div>
  );
}
