export type ExperimentCustomKpi = {
  id: string;
  experimentId: string;
  label: string;
  value: number;
  unit?: string;
  threshold?: number;
  updatedAt: string;
};

const STORAGE_KEY = "founder-experiment-kpis-v1";

function loadAll(): ExperimentCustomKpi[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExperimentCustomKpi[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(kpis: ExperimentCustomKpi[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kpis.slice(0, 200)));
  } catch {
    /* quota */
  }
}

export function loadCustomKpisForExperiment(
  experimentId: string,
): ExperimentCustomKpi[] {
  return loadAll().filter((k) => k.experimentId === experimentId);
}

export function loadAllCustomKpis(): ExperimentCustomKpi[] {
  return loadAll();
}

export function upsertCustomKpi(
  input: Omit<ExperimentCustomKpi, "id" | "updatedAt"> & { id?: string },
): ExperimentCustomKpi[] {
  const now = new Date().toISOString();
  const all = loadAll();
  const kpi: ExperimentCustomKpi = {
    id: input.id ?? `kpi-${Date.now()}`,
    experimentId: input.experimentId,
    label: input.label.trim(),
    value: input.value,
    unit: input.unit,
    threshold: input.threshold,
    updatedAt: now,
  };
  const next = [
    kpi,
    ...all.filter(
      (k) => !(k.experimentId === kpi.experimentId && k.id === kpi.id),
    ),
  ];
  saveAll(next);
  return next.filter((k) => k.experimentId === kpi.experimentId);
}

export const DEFAULT_KPI_SUGGESTIONS = [
  "Task completion rate",
  "User engagement (sessions)",
  "Conversion lift %",
  "Time to first milestone",
  "API cost per outcome",
];
