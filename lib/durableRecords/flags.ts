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

/**
 * Saved Spark durable persistence (Slice 1).
 *
 * Unlike saved_work, this defaults ON: the required outcome is that a Spark is
 * durably saved to the authenticated member and no "saved" claim is shown until
 * the durable write is verified. A kill switch remains for safety —
 * NEXT_PUBLIC_DURABLE_SAVED_SPARK=0 (env) or localStorage
 * "spark.flag.durableSavedSpark" = "0" (per browser) — plus a test seam.
 */
const SAVED_SPARK_FLAG_KEY = "spark.flag.durableSavedSpark";

let savedSparkTestOverride: boolean | null = null;

/** Test seam: force on/off, or null to restore normal resolution. */
export function setSavedSparkDurableEnabledForTests(
  value: boolean | null,
): void {
  savedSparkTestOverride = value;
}

export function isSavedSparkDurableEnabled(): boolean {
  if (savedSparkTestOverride !== null) return savedSparkTestOverride;
  if (process.env.NEXT_PUBLIC_DURABLE_SAVED_SPARK === "0") return false;
  if (typeof window !== "undefined") {
    try {
      if (window.localStorage.getItem(SAVED_SPARK_FLAG_KEY) === "0") {
        return false;
      }
    } catch {
      /* ignore — default on */
    }
  }
  return true;
}

/**
 * Evidence Vault durable persistence.
 *
 * OFF by default, same rollout posture as saved_work: Evidence Vault (Tier A7)
 * is a full-object round-trip domain with many existing local-only call sites,
 * so it ships behind a flag until cross-device behavior is certified. Enable
 * via env (NEXT_PUBLIC_DURABLE_EVIDENCE_VAULT=1) or a per-browser override
 * (localStorage "spark.flag.durableEvidenceVault" = "1").
 */
const EVIDENCE_VAULT_FLAG_KEY = "spark.flag.durableEvidenceVault";

let evidenceVaultTestOverride: boolean | null = null;

/** Test seam: force the flag on/off, or null to restore normal resolution. */
export function setEvidenceVaultDurableEnabledForTests(
  value: boolean | null,
): void {
  evidenceVaultTestOverride = value;
}

export function isEvidenceVaultDurableEnabled(): boolean {
  if (evidenceVaultTestOverride !== null) return evidenceVaultTestOverride;
  if (process.env.NEXT_PUBLIC_DURABLE_EVIDENCE_VAULT === "1") return true;
  if (typeof window !== "undefined") {
    try {
      return window.localStorage.getItem(EVIDENCE_VAULT_FLAG_KEY) === "1";
    } catch {
      return false;
    }
  }
  return false;
}
