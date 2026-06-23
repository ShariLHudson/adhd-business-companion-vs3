/**
 * One observational insight for Clear My Mind relief view.
 * Deterministic only — no AI, no advice, no actions.
 */

import type { ThoughtCluster } from "./brainDumpClusterModel";

const SAFE_HELD = "Everything you captured is safely held.";

export function generateMentalLandscapeInsight(
  clusters: ThoughtCluster[],
  totalThoughts: number,
): string {
  if (totalThoughts <= 0) return SAFE_HELD;
  if (totalThoughts === 1) return SAFE_HELD;

  const major = clusters.filter((c) => c.id !== "__more__");

  if (major.length === 1) {
    return "Most of what you captured seems connected.";
  }

  if (totalThoughts >= 2 && totalThoughts <= 3) {
    return "A few things are safely held here now.";
  }

  const sorted = [...major].sort((a, b) => b.count - a.count);
  const top = sorted[0];
  if (top && top.count / totalThoughts > 0.5) {
    return `Looks like your mind is carrying a lot around ${top.label} right now.`;
  }

  if (major.length >= 2) {
    return "You seem to be carrying a few different things at once today.";
  }

  return SAFE_HELD;
}
