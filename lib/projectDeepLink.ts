/**
 * Deep-link targets between Projects, Time Blocks, and Tasks.
 * Launch-safe: projectId + blockId; taskId reserved for future notes/tasks model.
 */

export type ProjectDeepLinkTarget = {
  projectId: string;
  blockId?: string;
  taskId?: string;
  /** Scroll/highlight a project detail section (e.g. conversations, tasks). */
  detailSection?: string;
};

export function projectDeepLinkKey(target: ProjectDeepLinkTarget): string {
  return [
    target.projectId,
    target.blockId ?? "",
    target.taskId ?? "",
    target.detailSection ?? "",
  ].join(":");
}
