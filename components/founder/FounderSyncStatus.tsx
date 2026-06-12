"use client";

import type { FounderSyncStatus } from "@/lib/founderWorkspace/useFounderWorkspaceSync";

export function FounderSyncStatusBar({
  status,
  message,
  onRetry,
}: {
  status: FounderSyncStatus;
  message: string | null;
  onRetry?: () => void;
}) {
  let label = "";
  let className = "text-[#6b635a]";

  switch (status) {
    case "loading":
      label = "Loading…";
      break;
    case "syncing":
      label = "⟳ Syncing";
      className = "text-[#1e4f4f]";
      break;
    case "saved":
      label = "✓ Saved";
      className = "text-[#1e4f4f]";
      break;
    case "offline":
      label = "Saved locally";
      className = "text-[#7a5c00]";
      break;
    case "error":
      label = "Sync error";
      className = "text-[#a85c4a]";
      break;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={`font-medium ${className}`}>{label}</span>
      {message ? <span className="text-[#6b635a]">{message}</span> : null}
      {(status === "offline" || status === "error") && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="font-medium text-[#1e4f4f] underline"
        >
          Retry sync
        </button>
      ) : null}
    </div>
  );
}
