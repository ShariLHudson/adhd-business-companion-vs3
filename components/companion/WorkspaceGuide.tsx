"use client";

/**
 * @deprecated Replaced by WorkspaceAreaWorksGuide ("How To Use [Area]").
 * Kept as a no-op so existing imports do not render duplicate help UI.
 */
export function WorkspaceGuide(_props: { section: string }) {
  return null;
}

/** @deprecated */
export function WorkspaceGuideInline(_props: {
  guide: { id: string; title: string };
}) {
  return null;
}
