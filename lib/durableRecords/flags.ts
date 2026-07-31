/**
 * Rollout control for durable persistence slices.
 *
 * Saved Work durable persistence is OFF by default so production behavior is
 * unchanged until explicitly enabled. Enable via env
 * (NEXT_PUBLIC_DURABLE_SAVED_WORK=1) or a per-browser override
 * (localStorage "spark.flag.durableSavedWork" = "1").
 */

const SAVED_WORK_FLAG_KEY = "spark.flag.durableSavedWork";

let testOverride: boolean | null = null;

/** Test seam: force the flag on/off, or null to restore normal resolution. */
export function setSavedWorkDurableEnabledForTests(value: boolean | null): void {
  testOverride = value;
}

export function isSavedWorkDurableEnabled(): boolean {
  if (testOverride !== null) return testOverride;
  if (process.env.NEXT_PUBLIC_DURABLE_SAVED_WORK === "1") return true;
  if (typeof window !== "undefined") {
    try {
      return window.localStorage.getItem(SAVED_WORK_FLAG_KEY) === "1";
    } catch {
      return false;
    }
  }
  return false;
}
