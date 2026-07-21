"use client";

import type { CelebrationRecord } from "@/lib/progressRecognition";

type Props = {
  returnPath: NonNullable<CelebrationRecord["returnPath"]>;
  onReturn: (returnPath: NonNullable<CelebrationRecord["returnPath"]>) => void;
};

/**
 * 101 — Return to exact source Work / section after celebration.
 */
export function RecognitionReturnBar({ returnPath, onReturn }: Props) {
  const label =
    returnPath.sectionId && returnPath.workId
      ? "Return to your section"
      : returnPath.workId
        ? "Return to your work"
        : returnPath.projectId
          ? "Return to your project"
          : "Return to where you were";

  return (
    <div
      className="progress-return-bar"
      data-testid="recognition-return-bar"
      role="navigation"
      aria-label="Return to source"
    >
      <button
        type="button"
        className="progress-pulse-btn progress-pulse-btn-primary"
        data-testid="recognition-return-source"
        data-return-work-id={returnPath.workId ?? ""}
        data-return-section-id={returnPath.sectionId ?? ""}
        data-return-project-id={returnPath.projectId ?? ""}
        onClick={() => onReturn(returnPath)}
      >
        ← {label}
      </button>
    </div>
  );
}
