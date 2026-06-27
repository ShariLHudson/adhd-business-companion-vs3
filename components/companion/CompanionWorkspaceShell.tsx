"use client";

import type { ReactNode } from "react";
import { SceneRenderer } from "@/components/companion/scene/SceneRenderer";
import { createSceneState, type SceneWorkspaceId } from "@/lib/sceneRenderContract";

type Props = {
  roomId?: "clear-my-mind" | "planning-table" | "default";
  /** Overrides room-derived workspace when set */
  workspaceId?: SceneWorkspaceId;
  signatureId?: string;
  objectId?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  banner?: ReactNode;
  /** Hide resolver-driven header when workspace renders its own */
  hideHeader?: boolean;
};

const ROOM_TO_WORKSPACE: Record<string, SceneWorkspaceId> = {
  "clear-my-mind": "clear-my-mind",
  "planning-table": "plan-my-day",
  default: "default",
};

/**
 * Companion Workspace Standard v1 — delegates to Scene Render Contract.
 * SceneLayoutEngine overrides any conflicting v1 layout rules.
 */
export function CompanionWorkspaceShell({
  roomId = "default",
  workspaceId: workspaceIdOverride,
  title,
  subtitle,
  children,
  className = "",
  banner,
  hideHeader = false,
}: Props) {
  const workspaceId =
    workspaceIdOverride ??
    (roomId === "clear-my-mind" ? "clear-my-mind" : ROOM_TO_WORKSPACE[roomId] ?? "default");

  const scene = createSceneState({
    workspaceId,
    copyOverrides:
      title || subtitle
        ? { title: title ?? "", subtitle }
        : undefined,
  });

  return (
    <SceneRenderer scene={scene} className={className} banner={banner} hideHeader={hideHeader}>
      {children}
    </SceneRenderer>
  );
}
