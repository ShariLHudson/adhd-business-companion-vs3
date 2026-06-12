export type BusinessMetricsSnapshot = {
  payingUsers: number;
  trialUsers: number;
  conversions: number;
  churnRate: number;
  updatedAt: string;
  source: "manual" | "ghl" | "placeholder";
};

const STORAGE_KEY = "founder-business-metrics-v1";

function empty(): BusinessMetricsSnapshot {
  return {
    payingUsers: 0,
    trialUsers: 0,
    conversions: 0,
    churnRate: 0,
    updatedAt: new Date().toISOString(),
    source: "placeholder",
  };
}

export function loadBusinessMetricsSnapshot(): BusinessMetricsSnapshot {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as BusinessMetricsSnapshot;
    return { ...empty(), ...parsed };
  } catch {
    return empty();
  }
}

export function saveBusinessMetricsSnapshot(data: BusinessMetricsSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}
