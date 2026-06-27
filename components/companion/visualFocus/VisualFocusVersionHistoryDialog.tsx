"use client";

import type { VisualFocusMap, VisualFocusMapVersion } from "@/lib/visualFocus/types";
import { sortVersionsNewestFirst } from "@/lib/visualFocus/lifecycle";

export function VisualFocusVersionHistoryDialog({
  open,
  map,
  onRestore,
  onSaveVersion,
  onClose,
}: {
  open: boolean;
  map: VisualFocusMap | null;
  onRestore: (versionId: string) => void;
  onSaveVersion: () => void;
  onClose: () => void;
}) {
  if (!open || !map) return null;

  const versions = sortVersionsNewestFirst(map.versions);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-history-title"
        className="flex max-h-[min(80vh,560px)] w-full max-w-md flex-col rounded-2xl border border-[#d4cdc3] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="visual-focus-version-history"
      >
        <div className="border-b border-[#e7dfd4] px-5 py-4">
          <h2
            id="version-history-title"
            className="text-lg font-semibold text-[#1f1c19]"
          >
            Version History
          </h2>
          <p className="mt-1 text-sm text-[#6b635a]">{map.title}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          <VersionRow
            label="Current"
            detail="Live version — what you see now"
            isCurrent
          />
          {versions.length === 0 ? (
            <p className="mt-3 text-sm text-[#6b635a]">
              No saved versions yet. Use Save Version to capture a snapshot.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {versions.map((version) => (
                <li key={version.id}>
                  <VersionRow
                    label={version.label}
                    detail={new Date(version.savedAt).toLocaleString()}
                    onRestore={() => onRestore(version.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[#e7dfd4] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onSaveVersion}
            className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
          >
            Save Version
          </button>
        </div>
      </div>
    </div>
  );
}

function VersionRow({
  label,
  detail,
  isCurrent,
  onRestore,
}: {
  label: string;
  detail: string;
  isCurrent?: boolean;
  onRestore?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2.5">
      <div>
        <p className="text-sm font-semibold text-[#1f1c19]">{label}</p>
        <p className="text-xs text-[#6b635a]">{detail}</p>
      </div>
      {isCurrent ? (
        <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-bold text-[#1e4f4f]">
          Current
        </span>
      ) : onRestore ? (
        <button
          type="button"
          onClick={onRestore}
          className="rounded-lg border border-[#1e4f4f] px-3 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-white"
        >
          Restore
        </button>
      ) : null}
    </div>
  );
}
