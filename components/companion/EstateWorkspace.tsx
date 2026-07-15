"use client";

import type { MouseEvent, ReactNode } from "react";
import "@/app/companion/estate-workspace.css";

type EstateWorkspaceProps = {
  children: ReactNode;
  className?: string;
  /** Extra class on the full-bleed stage around the frosted panel. */
  stageClassName?: string;
  variant?: "ivory" | "vault";
  /**
   * Click the room around the frosted panel to dismiss (not the panel itself).
   * Nested overlays inside the panel should close themselves first.
   */
  onDismissOutside?: () => void;
};

/** Universal centered frosted workspace for Growth estate rooms. */
export function EstateWorkspace({
  children,
  className = "",
  stageClassName = "",
  variant = "ivory",
  onDismissOutside,
}: EstateWorkspaceProps) {
  function handleStageClick(event: MouseEvent<HTMLDivElement>) {
    if (!onDismissOutside) return;
    if (event.target !== event.currentTarget) return;
    onDismissOutside();
  }

  return (
    <div
      className={`estate-workspace-stage${stageClassName ? ` ${stageClassName}` : ""}`}
      role={onDismissOutside ? "presentation" : undefined}
      title={
        onDismissOutside ? "Click outside the panel to close" : undefined
      }
      data-dismiss-outside={onDismissOutside ? "true" : undefined}
      onClick={onDismissOutside ? handleStageClick : undefined}
    >
      <article
        className={`estate-workspace companion-workspace-frosted estate-workspace--${variant}${className ? ` ${className}` : ""}`}
        onClick={
          onDismissOutside
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
        onMouseDown={
          onDismissOutside
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
      >
        {children}
      </article>
    </div>
  );
}
