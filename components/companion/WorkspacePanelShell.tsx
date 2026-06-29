"use client";

import type { ReactNode } from "react";
import { workspacePanelShellClass, workspaceFloatingCardShellClass } from "@/lib/workspaceLayoutTokens";
import type { WorkspacePanelWidth } from "@/lib/workspaceLayoutTokens";

/** Consistent inner shell for workspace panels (split or standalone). */
export function WorkspacePanelShell({
  children,
  width = "standard",
  inSplit = false,
  compact = false,
  presentation = "default",
  className = "",
  testId,
}: {
  children: ReactNode;
  width?: WorkspacePanelWidth;
  inSplit?: boolean;
  compact?: boolean;
  /** Floating frosted card in a static scene room (see workspace-layout rule). */
  presentation?: "default" | "floating-card";
  className?: string;
  testId?: string;
}) {
  const shellClass =
    presentation === "floating-card"
      ? workspaceFloatingCardShellClass({ width, inSplit, compact })
      : workspacePanelShellClass({ width, inSplit, compact });
  return (
    <div
      className={`${shellClass} ${className}`.trim()}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
