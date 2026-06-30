"use client";

import type { ConservatoryStage } from "./types";
import { DocumentCanvas } from "./DocumentCanvas";
import { WorkspaceIconBar } from "./WorkspaceIconBar";

type FrostedWorkspaceProps = {
  stage: ConservatoryStage;
  answer: string;
  addedParagraph: string | null;
  focusMode: boolean;
  onAnswerChange: (value: string) => void;
  onAddToDocument: () => void;
  onCloseNotebook: () => void;
  onToggleFocus: () => void;
};

export function FrostedWorkspace({
  stage,
  answer,
  addedParagraph,
  focusMode,
  onAnswerChange,
  onAddToDocument,
  onCloseNotebook,
  onToggleFocus,
}: FrostedWorkspaceProps) {
  const open = stage === "workspace-open";
  const closing = stage === "closing";

  if (!open && !closing) return null;

  return (
    <div
      className={`cw-glass${open ? " cw-glass--open" : ""}${closing ? " cw-glass--closing" : ""}${focusMode ? " cw-glass--focus" : ""}`}
      role="region"
      aria-label="Workspace"
    >
      <div className="cw-glass__sheet">
        <DocumentCanvas
          answer={answer}
          addedParagraph={addedParagraph}
          onAnswerChange={onAnswerChange}
          onAddToDocument={onAddToDocument}
        />
        <WorkspaceIconBar
          onCloseNotebook={onCloseNotebook}
          focusMode={focusMode}
          onToggleFocus={onToggleFocus}
        />
      </div>
    </div>
  );
}
