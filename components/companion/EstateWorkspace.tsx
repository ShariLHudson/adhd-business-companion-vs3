"use client";

import type { ReactNode } from "react";
import "@/app/companion/estate-workspace.css";

type EstateWorkspaceProps = {
  children: ReactNode;
  className?: string;
  variant?: "ivory" | "vault";
};

/** Universal centered frosted workspace for Growth estate rooms. */
export function EstateWorkspace({
  children,
  className = "",
  variant = "ivory",
}: EstateWorkspaceProps) {
  return (
    <div className="estate-workspace-stage">
      <article
        className={`estate-workspace companion-workspace-frosted estate-workspace--${variant}${className ? ` ${className}` : ""}`}
      >
        {children}
      </article>
    </div>
  );
}
