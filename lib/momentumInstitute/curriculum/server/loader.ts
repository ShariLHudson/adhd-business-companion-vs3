/**
 * Server-only curriculum loader — reads authored markdown from docs/.
 */

import "server-only";

import fs from "node:fs";
import path from "node:path";

import { mergeCurriculumIntoCatalog } from "../compiler";
import { parseKnowledgeCardMarkdown } from "../parseKnowledgeCard";
import {
  getCurriculumRegistry,
  registerCurriculumKnowledgeCard,
  setCurriculumRegistry,
} from "../registry";
import type { CurriculumRegistry } from "../types";
import { CURRICULUM_ROOT_SEGMENT } from "../types";
import type { MomentumInstituteCatalog } from "@/lib/sparkMomentumInstitute/types";

export function resolveCurriculumRoot(): string {
  return path.join(process.cwd(), CURRICULUM_ROOT_SEGMENT);
}

export function loadCurriculumRegistryManifest(): CurriculumRegistry | null {
  const manifestPath = path.join(resolveCurriculumRoot(), "curriculum-registry.json");
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const raw = fs.readFileSync(manifestPath, "utf8");
    return JSON.parse(raw) as CurriculumRegistry;
  } catch {
    return null;
  }
}

export function loadKnowledgeCardFromPath(
  relativePath: string,
): ReturnType<typeof parseKnowledgeCardMarkdown> | null {
  const fullPath = path.join(resolveCurriculumRoot(), relativePath);
  if (!fs.existsSync(fullPath)) return null;
  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    return parseKnowledgeCardMarkdown(raw, relativePath.replace(/\\/g, "/"));
  } catch {
    return null;
  }
}

export function scanKnowledgeCardFiles(): string[] {
  const root = path.join(resolveCurriculumRoot(), "knowledge-cards");
  if (!fs.existsSync(root)) return [];
  const results: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      if (entry.name.startsWith("_")) continue;
      const relative = path
        .relative(resolveCurriculumRoot(), full)
        .replace(/\\/g, "/");
      results.push(relative);
    }
  }

  walk(root);
  return results.sort();
}

export function bootstrapCurriculumFromDisk(): number {
  const manifest = loadCurriculumRegistryManifest();
  if (manifest) setCurriculumRegistry(manifest);

  const paths =
    manifest ?
      manifest.knowledge_cards.map((e) => e.path)
    : scanKnowledgeCardFiles();

  let loaded = 0;
  for (const relativePath of paths) {
    const doc = loadKnowledgeCardFromPath(relativePath);
    if (!doc) continue;
    registerCurriculumKnowledgeCard(doc);
    loaded += 1;
  }

  if (!manifest && loaded > 0) {
    setCurriculumRegistry(getCurriculumRegistry());
  }

  return loaded;
}

export function enrichCatalogWithCurriculum(
  base: MomentumInstituteCatalog,
  opts?: { publishedOnly?: boolean },
): MomentumInstituteCatalog {
  bootstrapCurriculumFromDisk();
  const docs = [...getCurriculumRegistry().knowledge_cards]
    .map((e) => loadKnowledgeCardFromPath(e.path))
    .filter((d): d is NonNullable<typeof d> => d != null);

  for (const doc of docs) {
    registerCurriculumKnowledgeCard(doc);
  }

  return mergeCurriculumIntoCatalog(base, docs, opts);
}
