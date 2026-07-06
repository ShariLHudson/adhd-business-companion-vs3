/** Storage layer — in-memory sample today; future persistence plugs in here. */
export type FounderIntelligenceStorageBackend = "sample" | "supabase" | "file";

export const FOUNDER_INTELLIGENCE_STORAGE: {
  backend: FounderIntelligenceStorageBackend;
  version: string;
} = {
  backend: "sample",
  version: "1.0.0",
};
