/**
 * My Institute Cabinet™ — reference-only archive. Never duplicates lesson content.
 */

import type { InstituteCabinetItem } from "../types";
import { getDrawerById, getKnowledgeCardById } from "./catalog/provider";

const STORAGE_KEY = "companion-institute-cabinet-v1";

export const INSTITUTE_CABINET_UPDATED_EVENT =
  "companion-institute-cabinet-updated";

function newId(): string {
  return `cab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): InstituteCabinetItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as InstituteCabinetItem[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: InstituteCabinetItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(INSTITUTE_CABINET_UPDATED_EVENT));
}

export function listCabinetItems(): InstituteCabinetItem[] {
  return readAll().sort(
    (a, b) => new Date(b.filedAt).getTime() - new Date(a.filedAt).getTime(),
  );
}

export function listCabinetItemsForDrawer(drawerId: string): InstituteCabinetItem[] {
  return listCabinetItems().filter((item) => item.drawerId === drawerId);
}

export function isKnowledgeCardInCabinet(knowledgeCardId: string): boolean {
  return readAll().some((item) => item.knowledgeCardId === knowledgeCardId);
}

export function getCabinetItemById(id: string): InstituteCabinetItem | null {
  return readAll().find((item) => item.id === id) ?? null;
}

export type FileInCabinetInput = {
  knowledgeCardId: string;
  experienceDefinitionId?: string;
  learningExperienceId?: string;
  label?: string;
  journalEntryId?: string;
};

export function fileInCabinet(input: FileInCabinetInput): InstituteCabinetItem {
  const card = getKnowledgeCardById(input.knowledgeCardId);
  if (!card) {
    throw new Error(`Unknown knowledge card: ${input.knowledgeCardId}`);
  }

  const drawer = getDrawerById(card.drawerId);
  const now = new Date().toISOString();

  const item: InstituteCabinetItem = {
    kind: "institute-cabinet-item",
    id: newId(),
    createdAt: now,
    updatedAt: now,
    knowledgeCardId: card.id,
    experienceDefinitionId: input.experienceDefinitionId,
    learningExperienceId: input.learningExperienceId,
    topicId: card.topicId,
    drawerId: card.drawerId,
    departmentId: card.departmentId,
    label: input.label ?? card.title,
    journalEntryId: input.journalEntryId,
    filedAt: now,
    originatedFromId: input.learningExperienceId ?? card.id,
    originatedFromKind: "institute-learning-experience",
  };

  const items = readAll();
  const duplicate = items.find(
    (existing) =>
      existing.knowledgeCardId === card.id &&
      existing.experienceDefinitionId === input.experienceDefinitionId,
  );
  if (duplicate) {
    return duplicate;
  }

  writeAll([item, ...items]);
  return item;
}

export function linkJournalToCabinetItem(
  cabinetItemId: string,
  journalEntryId: string,
): InstituteCabinetItem | null {
  const items = readAll();
  const idx = items.findIndex((item) => item.id === cabinetItemId);
  if (idx < 0) return null;

  const updated: InstituteCabinetItem = {
    ...items[idx]!,
    journalEntryId,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = updated;
  writeAll(items);
  return updated;
}

export function cabinetFilingPrompt(knowledgeCardTitle: string): string {
  return `Would you like me to file this in your My Institute Cabinet™ so you can easily find **${knowledgeCardTitle}** again later?`;
}

export function cabinetLocationLabel(item: InstituteCabinetItem): string {
  const drawer = getDrawerById(item.drawerId);
  const parts = [drawer?.title ?? "Institute", item.label].filter(Boolean);
  return parts.join(" → ");
}

export function clearCabinetForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
