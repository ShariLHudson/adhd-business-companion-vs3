/**
 * Director's Studio — demo-only, never on by default.
 *
 * Open for presentations:
 *   /companion/hospitality-prototype?demo=1
 *   /companion/hospitality-prototype?studio=1  (legacy alias)
 *
 * Presentation drawer: add &present=1
 */

const DEMO_TRUTHY = new Set(["1", "true", "yes"]);

function isTruthyDemoParam(value: string | null | undefined): boolean {
  if (!value) return false;
  return DEMO_TRUTHY.has(value.trim().toLowerCase());
}

/** Whether the URL explicitly requests Director's Studio demo mode. */
export function isDirectorStudioDemoMode(
  ...params: Array<string | null | undefined>
): boolean {
  return params.some(isTruthyDemoParam);
}

/** Show Director's Studio UI — development only, requires ?demo=1 or ?studio=1. */
export function showDirectorStudio(
  studioParam?: string | null,
  demoParam?: string | null,
): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  return isDirectorStudioDemoMode(studioParam, demoParam);
}

export const DIRECTOR_STUDIO_DEMO_PATH =
  "/companion/hospitality-prototype?demo=1";
