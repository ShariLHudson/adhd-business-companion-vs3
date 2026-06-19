"use client";

import { RESUME_ONLY_HINT, SAVE_LEVEL_COPY, type SaveLevel } from "@/lib/saveExportTrust";

export function SaveStatusBanner({
  level = "resume",
  className = "",
}: {
  level?: SaveLevel;
  className?: string;
}) {
  const copy = SAVE_LEVEL_COPY[level];
  return (
    <p
      className={`rounded-lg border border-[#d4cdc3] bg-[#faf8f5] px-3 py-2 text-xs leading-relaxed text-[#6b635a] ${className}`}
      data-testid="save-status-banner"
    >
      <span className="font-semibold text-[#1e4f4f]">{copy.label}:</span>{" "}
      {level === "resume" ? RESUME_ONLY_HINT : copy.description}
    </p>
  );
}
