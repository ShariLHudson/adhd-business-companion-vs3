export type PanelNavigationFrame<T> = {
  snapshot: T;
  /** Destination name for the back button (without "Back to"). */
  backDestination: string;
};

export function pushPanelNavigationFrame<T>(
  frames: PanelNavigationFrame<T>[],
  snapshot: T,
  next: T,
  backDestination: string,
): { frames: PanelNavigationFrame<T>[]; snapshot: T } {
  return {
    frames: [
      ...frames,
      { snapshot, backDestination: backDestination.trim() },
    ],
    snapshot: next,
  };
}

export function popPanelNavigationFrame<T>(
  frames: PanelNavigationFrame<T>[],
): {
  frames: PanelNavigationFrame<T>[];
  snapshot: T | null;
} {
  if (frames.length === 0) return { frames, snapshot: null };
  const last = frames[frames.length - 1]!;
  return {
    frames: frames.slice(0, -1),
    snapshot: last.snapshot,
  };
}
