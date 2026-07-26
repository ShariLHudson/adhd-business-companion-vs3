"use client";

import type { ReactNode } from "react";

/**
 * ContextualWorkspaceShell — the single vertical column that a Contextual
 * Workspace builder renders into (see ./README.md).
 *
 * It is deliberately transparent: the room background is supplied by the
 * surrounding room shell (WorkspaceShell / MyBusinessEstateRoomShell), and this
 * column lets that room fill the workspace while the content scrolls over it.
 * No opaque panel, no frosted card behind everything — only the individual
 * fields and the research panel carry their own translucent surfaces.
 */
export function ContextualWorkspaceShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  // No own scroll — the surrounding room shell provides the scroll container,
  // so the room fills the workspace and the content scrolls over it.
  return (
    <div
      className={`companion-fade-in relative z-10 mx-auto flex min-h-full max-w-xl flex-col px-6 py-8${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
}
