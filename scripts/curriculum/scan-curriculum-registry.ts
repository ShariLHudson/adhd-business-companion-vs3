/**
 * Scan docs/momentum-institute/curriculum/ and refresh curriculum-registry.json.
 *
 * Usage: npx tsx scripts/curriculum/scan-curriculum-registry.ts
 */

import fs from "node:fs";
import path from "node:path";

import { parseKnowledgeCardMarkdown } from "../../lib/momentumInstitute/curriculum/parseKnowledgeCard";
import type { CurriculumRegistry } from "../../lib/momentumInstitute/curriculum/types";

const ROOT = path.join(process.cwd(), "docs/momentum-institute/curriculum");
const MANIFEST = path.join(ROOT, "curriculum-registry.json");

function walkKnowledgeCards(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkKnowledgeCards(full));
      continue;
    }
    if (!entry.name.endsWith(".md") || entry.name.startsWith("_")) continue;
    results.push(path.relative(ROOT, full).replace(/\\/g, "/"));
  }
  return results.sort();
}

function main() {
  const paths = walkKnowledgeCards(path.join(ROOT, "knowledge-cards"));
  const knowledge_cards = paths.map((relativePath) => {
    const raw = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
    const doc = parseKnowledgeCardMarkdown(raw, relativePath);
    return {
      kind: "knowledge-card" as const,
      id: doc.metadata.id,
      path: relativePath,
      department: doc.metadata.department,
      drawer: doc.metadata.drawer,
      status: doc.metadata.status,
    };
  });

  const prior: CurriculumRegistry = fs.existsSync(MANIFEST) ?
    (JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as CurriculumRegistry)
  : {
      version: "1.0.0",
      updated_at: new Date().toISOString().slice(0, 10),
      knowledge_cards: [],
      business_mastery_minutes: [],
      apprenticeships: [],
      business_labs: [],
      simulations: [],
      challenges: [],
      worksheets: [],
    };

  const next: CurriculumRegistry = {
    ...prior,
    updated_at: new Date().toISOString().slice(0, 10),
    knowledge_cards,
  };

  fs.writeFileSync(MANIFEST, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(
    `Curriculum registry updated — ${knowledge_cards.length} knowledge card(s).`,
  );
}

main();
