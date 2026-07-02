/**
 * Parse authored Knowledge Card™ markdown into structured curriculum documents.
 */

import type { KnowledgeDifficultyLevel } from "@/lib/sparkMomentumInstitute/types";
import { KNOWLEDGE_DIFFICULTY_IDS } from "@/lib/sparkMomentumInstitute/types";
import { parseFrontmatter } from "./parseFrontmatter";
import type {
  CurriculumCardStatus,
  CurriculumKnowledgeCardBody,
  CurriculumKnowledgeCardDocument,
  CurriculumKnowledgeCardMetadata,
  CurriculumRelatedCardRef,
} from "./types";
import { CURRICULUM_CARD_STATUSES } from "./types";

const SECTION_ALIASES: Record<keyof CurriculumKnowledgeCardBody, RegExp[]> = {
  essentialQuestion: [
    /^##\s*Essential [Qq]uestion/m,
    /^\*\*Essential question:\*\*/im,
  ],
  whyThisMatters: [/^##\s*Why [Tt]his [Mm]atters/m],
  corePrinciple: [/^##\s*Core [Pp]rinciple/m],
  keyIdeas: [/^##\s*Key [Ii]deas/m],
  realBusinessExample: [/^##\s*Real [Bb]usiness [Ee]xample/m],
  reflectionQuestions: [/^##\s*Reflection [Qq]uestions/m],
  makeItMine: [/^##\s*Make It Mine/m],
  tryItThisWeek: [/^##\s*Try It This Week/m],
  commonMistakes: [/^##\s*Common [Mm]istakes/m],
  relatedCompetencies: [/^##\s*Related [Cc]ompetenc/m],
  relatedKnowledgeCards: [/^##\s*Related [Kk]nowledge [Cc]ards/m],
  relatedApprenticeships: [/^##\s*Related [Aa]pprenticeships/m],
};

export function parseKnowledgeCardMarkdown(
  raw: string,
  sourcePath: string,
): CurriculumKnowledgeCardDocument {
  const { metadata: rawMeta, body } = parseFrontmatter(raw);
  const metadata = normalizeKnowledgeCardMetadata(rawMeta, sourcePath);
  const parsedBody = parseKnowledgeCardBody(body, metadata);

  return {
    kind: "knowledge-card",
    metadata,
    body: parsedBody,
    sourcePath,
    rawMarkdown: raw,
  };
}

function normalizeKnowledgeCardMetadata(
  raw: Record<string, unknown>,
  sourcePath: string,
): CurriculumKnowledgeCardMetadata {
  const id =
    stringField(raw, "id") ||
    inferIdFromPath(sourcePath) ||
    `kc-${Date.now()}`;
  const difficulty = normalizeDifficulty(raw.difficulty);
  const status = normalizeStatus(raw.status);

  return {
    id,
    title: stringField(raw, "title") || id,
    college: optionalString(raw, "college"),
    department: stringField(raw, "department") || "general",
    drawer: stringField(raw, "drawer") || "general",
    competencies: stringArray(raw, "competencies"),
    difficulty,
    estimated_time: numberField(raw, "estimated_time") ?? 8,
    related_cards: optionalStringArray(raw, "related_cards"),
    related_apprenticeships: optionalStringArray(raw, "related_apprenticeships"),
    related_business_labs: optionalStringArray(raw, "related_business_labs"),
    related_simulations: optionalStringArray(raw, "related_simulations"),
    related_challenges: optionalStringArray(raw, "related_challenges"),
    status,
    author: stringField(raw, "author") || "Visual Spark Studios",
    version: stringField(raw, "version") || "1.0.0",
    last_updated:
      stringField(raw, "last_updated") || new Date().toISOString().slice(0, 10),
  };
}

function parseKnowledgeCardBody(
  markdown: string,
  metadata: CurriculumKnowledgeCardMetadata,
): CurriculumKnowledgeCardBody {
  const sections = splitMarkdownSections(markdown);

  return {
    essentialQuestion:
      sections.essentialQuestion ||
      extractInlineEssentialQuestion(markdown) ||
      "",
    whyThisMatters: sections.whyThisMatters || "",
    corePrinciple: sections.corePrinciple || "",
    keyIdeas: listItems(sections.keyIdeas),
    realBusinessExample: sections.realBusinessExample || "",
    reflectionQuestions: listItems(sections.reflectionQuestions),
    makeItMine: listItems(sections.makeItMine),
    tryItThisWeek: sections.tryItThisWeek?.trim() || "",
    commonMistakes: listItems(sections.commonMistakes),
    relatedCompetencies:
      listItems(sections.relatedCompetencies).length > 0 ?
        listItems(sections.relatedCompetencies)
      : metadata.competencies,
    relatedKnowledgeCards: parseRelatedCards(sections.relatedKnowledgeCards),
    relatedApprenticeships:
      listItems(sections.relatedApprenticeships).length > 0 ?
        listItems(sections.relatedApprenticeships)
      : (metadata.related_apprenticeships ?? []),
  };
}

function splitMarkdownSections(markdown: string): Record<string, string> {
  const lines = markdown.split("\n");
  const sectionStarts: { key: string; line: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    for (const [key, patterns] of Object.entries(SECTION_ALIASES)) {
      if (patterns.some((p) => p.test(line))) {
        sectionStarts.push({ key, line: i });
      }
    }
  }

  sectionStarts.sort((a, b) => a.line - b.line);
  const result: Record<string, string> = {};

  for (let i = 0; i < sectionStarts.length; i++) {
    const current = sectionStarts[i]!;
    const nextLine = sectionStarts[i + 1]?.line ?? lines.length;
    const content = lines
      .slice(current.line + 1, nextLine)
      .join("\n")
      .trim();
    result[current.key] = content;
  }

  return result;
}

function listItems(block?: string): string[] {
  if (!block?.trim()) return [];
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""))
    .filter(Boolean);
}

function parseRelatedCards(block?: string): CurriculumRelatedCardRef[] {
  return listItems(block).map((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+)\s*(?:[—–-]\s*(.+))?$/);
    if (match) {
      return { id: match[1]!, relationship: match[2]?.trim() };
    }
    return { id: line };
  });
}

function extractInlineEssentialQuestion(markdown: string): string | null {
  const match = markdown.match(/\*\*Essential question:\*\*\s*(.+)/i);
  return match?.[1]?.trim() ?? null;
}

function inferIdFromPath(sourcePath: string): string | null {
  const base = sourcePath.split("/").pop()?.replace(/\.md$/i, "");
  return base ?? null;
}

function stringField(raw: Record<string, unknown>, key: string): string {
  const v = raw[key];
  return typeof v === "string" ? v.trim() : "";
}

function optionalString(raw: Record<string, unknown>, key: string): string | undefined {
  const v = stringField(raw, key);
  return v || undefined;
}

function stringArray(raw: Record<string, unknown>, key: string): string[] {
  const v = raw[key];
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function optionalStringArray(
  raw: Record<string, unknown>,
  key: string,
): string[] | undefined {
  const arr = stringArray(raw, key);
  return arr.length ? arr : undefined;
}

function numberField(raw: Record<string, unknown>, key: string): number | null {
  const v = raw[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return null;
}

function normalizeDifficulty(value: unknown): KnowledgeDifficultyLevel {
  const v = String(value ?? "foundational").toLowerCase();
  return KNOWLEDGE_DIFFICULTY_IDS.includes(v as KnowledgeDifficultyLevel) ?
      (v as KnowledgeDifficultyLevel)
    : "foundational";
}

function normalizeStatus(value: unknown): CurriculumCardStatus {
  const v = String(value ?? "draft").toLowerCase();
  return CURRICULUM_CARD_STATUSES.includes(v as CurriculumCardStatus) ?
      (v as CurriculumCardStatus)
    : "draft";
}
