"use client";

import type { ReactNode } from "react";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import type { WorkspacePanelWidth } from "@/lib/workspaceLayoutTokens";

/** Consistent inner shell for workspace panels (split or standalone). */
export function WorkspacePanelShell({
  children,
  width = "standard",
  inSplit = false,
  compact = false,
  className = "",
  testId,
}: {
  children: ReactNode;
  width?: WorkspacePanelWidth;
  inSplit?: boolean;
  compact?: boolean;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`${workspacePanelShellClass({ width, inSplit, compact })} ${className}`.trim()}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
