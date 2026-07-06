import { sampleMemoryRepository } from "../repositories/sample";
import type {
  FounderMemorySearchResult,
  FounderMemorySearchScope,
} from "../types";

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matches(text: string, query: string): boolean {
  return text.toLowerCase().includes(query);
}

/** Sample text search — no embeddings, no vector store. */
export function searchFounderMemory(
  query: string,
  scope: FounderMemorySearchScope = "all",
): FounderMemorySearchResult[] {
  const q = normalizeQuery(query);
  if (!q) return [];

  const vault = sampleMemoryRepository.getVaultOverview();
  const results: FounderMemorySearchResult[] = [];

  const push = (
    scopeKey: FounderMemorySearchScope,
    id: string,
    kind: import("../types/links").FounderMemoryEntityKind,
    title: string,
    excerpt: string,
    occurredAt: string,
  ) => {
    if (scope !== "all" && scope !== scopeKey) return;
    if (!matches(title, q) && !matches(excerpt, q)) return;
    results.push({
      id,
      scope: scopeKey,
      title,
      excerpt,
      occurredAt,
      ref: { kind, id, label: title },
    });
  };

  for (const d of vault.decisions) {
    push(
      "decisions",
      d.id,
      "decision",
      d.title,
      `${d.reason} ${d.finalDecision}`,
      d.decidedAt,
    );
  }
  for (const i of vault.ideas) {
    push("ideas", i.id, "idea", i.title, i.summary, i.capturedAt);
  }
  for (const l of vault.lessons) {
    push("lessons", l.id, "lesson", l.title, l.summary, l.recordedAt);
  }
  for (const p of vault.productHistory) {
    push(
      "products",
      p.id,
      "product-history",
      `${p.productName}: ${p.event}`,
      p.summary,
      p.occurredAt,
    );
  }
  for (const r of vault.research) {
    push("research", r.id, "research", r.title, r.summary, r.discoveredAt);
  }
  for (const rm of vault.roadmapChanges) {
    push("roadmap", rm.id, "roadmap-change", rm.title, rm.reason, rm.changedAt);
  }
  for (const t of vault.timeline) {
    push("timeline", t.id, "timeline", t.title, t.summary, t.occurredAt);
  }
  for (const j of vault.journal) {
    push("journal", j.id, "journal", j.title, j.body, j.writtenAt);
  }

  return results.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

export const MEMORY_SEARCH_SCOPES: { id: FounderMemorySearchScope; label: string }[] =
  [
    { id: "all", label: "All memory" },
    { id: "decisions", label: "Decisions" },
    { id: "ideas", label: "Ideas" },
    { id: "lessons", label: "Lessons" },
    { id: "products", label: "Products" },
    { id: "research", label: "Research" },
    { id: "roadmap", label: "Roadmap" },
    { id: "timeline", label: "Timeline" },
    { id: "journal", label: "Journal" },
  ];
