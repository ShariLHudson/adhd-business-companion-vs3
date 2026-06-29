/**
 * User-visible memory profile — readable, editable summary.
 */

import { listAllForUser } from "./store";
import type { MemoryType, UserVisibleMemoryProfile } from "./types";

const TYPE_LABELS: Record<MemoryType, string> = {
  short_term_conversation: "Recent conversation",
  long_term_business: "Your business",
  communication_preference: "How you like to communicate",
  project: "Projects",
  goal: "Goals",
  relationship: "Relationships",
  learning: "Learning",
  estate: "Rooms & workflows",
  founder: "Founder (operator)",
};

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value ?? "");
}

export function buildMemoryProfile(userId: string): UserVisibleMemoryProfile {
  const active = listAllForUser(userId, false);
  const archived = listAllForUser(userId, true).filter(
    (r) => r.archivedAt || r.confidence === "archived",
  );

  const byType = new Map<MemoryType, typeof active>();
  for (const record of active) {
    const list = byType.get(record.memoryType) ?? [];
    list.push(record);
    byType.set(record.memoryType, list);
  }

  const sections = [...byType.entries()].map(([memoryType, items]) => ({
    memoryType,
    label: TYPE_LABELS[memoryType],
    items: items.map((r) => ({
      id: r.id,
      key: r.key.replace(/_/g, " "),
      displayValue: displayValue(r.value),
      confidence: r.confidence,
      editable: memoryType !== "founder",
    })),
  }));

  return {
    userId,
    generatedAt: new Date().toISOString(),
    sections,
    totalActive: active.length,
    totalArchived: archived.length,
  };
}
