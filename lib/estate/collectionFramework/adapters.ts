/**
 * Spark Estate Collection Framework — per-room data adapters.
 */

import {
  createEvidenceEntry,
  deleteEvidenceEntry,
  EVIDENCE_BANK_UPDATED_EVENT,
  getEvidenceEntries,
  getEvidenceEntryById,
  isEvidenceFavorite,
  toggleEvidenceFavorite,
  updateEvidenceEntry,
  type EvidenceCategory,
} from "@/lib/evidenceBankStore";
import {
  createJournalEntry,
  deleteJournalEntry,
  getGrowthMemoryEntries,
  getJournalEntryById,
  GROWTH_JOURNAL_UPDATED_EVENT,
  isJournalFavorite,
  toggleJournalFavorite,
  updateJournalEntry,
  type GrowthEntryType,
} from "@/lib/growthJournalStore";
import {
  createSavedGrowthWin,
  deleteSavedGrowthWin,
  getSavedGrowthWins,
  SAVED_GROWTH_WINS_UPDATED_EVENT,
  updateSavedGrowthWin,
} from "@/lib/growthWinsStore";
import { linkGrowthAttachmentsToRecord } from "@/lib/assetLibrary/references";
import { createGenericCollectionStore } from "./genericCollectionStore";
import type {
  EstateCollectionAdapter,
  EstateCollectionCaptureValues,
  EstateCollectionItem,
  EstateCollectionItemField,
  EstateCollectionSaveOptions,
} from "./types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function journalCaptureFromEntry(
  entry: NonNullable<ReturnType<typeof getJournalEntryById>>,
): EstateCollectionCaptureValues {
  const category =
    entry.tags.find((tag) => tag !== "favorite") ?? "";
  return {
    body: entry.body,
    title: entry.title ?? "",
    category,
    estatePlace: entry.sourcePage ?? "",
  };
}

function journalAdapter(types: GrowthEntryType[]): EstateCollectionAdapter {
  return {
    updatedEventName: GROWTH_JOURNAL_UPDATED_EVENT,
    listItems(): EstateCollectionItem[] {
      return getGrowthMemoryEntries({ types }).map((entry) => ({
        id: entry.id,
        title: entry.title,
        body: entry.body,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        detail: formatDate(entry.createdAt),
        category: entry.tags.find((tag) => tag !== "favorite"),
        favorite: isJournalFavorite(entry),
        captureValues: journalCaptureFromEntry(entry),
        attachments: entry.attachments,
      }));
    },
    saveItem(
      capture: EstateCollectionCaptureValues,
      options?: EstateCollectionSaveOptions,
    ): boolean {
      const body = capture.body?.trim();
      if (!body) return false;
      const title = capture.title?.trim() || undefined;
      const tags = [
        ...(capture.category?.trim() ? [capture.category.trim()] : []),
      ];
      const attachmentList = options?.attachments ?? [];
      if (options?.editId) {
        const existing = getJournalEntryById(options.editId);
        if (!existing) return false;
        if (isJournalFavorite(existing)) tags.push("favorite");
        const ok = updateJournalEntry(options.editId, {
          body,
          title,
          tags,
          attachments: attachmentList,
        });
        return ok;
      }
      const { entry, ok } = createJournalEntry({
        body,
        title,
        attachments: attachmentList,
        type: types[0] ?? "journal",
        tags,
        sourcePage: capture.estatePlace?.trim() || "growth_journal",
      });
      return ok;
    },
    getItemCapture(id: string) {
      const entry = getJournalEntryById(id);
      return entry ? journalCaptureFromEntry(entry) : null;
    },
    toggleFavorite(id: string) {
      toggleJournalFavorite(id);
    },
    removeItem(id: string) {
      deleteJournalEntry(id);
    },
  };
}

const greenhouseStore = createGenericCollectionStore(
  "greenhouse",
  "estate-collection-greenhouse-updated",
  {
    primaryFieldId: "body",
    mapItem(capture, createdAt, id, updatedAt) {
      const body = capture.body?.trim();
      if (!body) return null;
      const fields: EstateCollectionItemField[] = [];
      const nurture = capture.nurture?.trim();
      const progress = capture.progress?.trim();
      if (nurture) fields.push({ label: "Nurturing", value: nurture });
      if (progress) fields.push({ label: "Season", value: progress });
      return {
        id,
        body,
        createdAt,
        updatedAt,
        badge: capture.category?.trim() || "Growing",
        category: capture.category?.trim(),
        fields: fields.length ? fields : undefined,
      };
    },
  },
);

const celebrationHallStore = createGenericCollectionStore(
  "celebration-hall",
  "estate-collection-celebration-hall-updated",
  {
    primaryFieldId: "body",
    mapItem(capture, createdAt, id, updatedAt) {
      const body = capture.body?.trim();
      const title = capture.chapterTitle?.trim();
      if (!body || !title) return null;
      const milestoneDate = capture.milestoneDate?.trim();
      return {
        id,
        title,
        body,
        createdAt,
        updatedAt,
        detail: milestoneDate
          ? formatDate(milestoneDate)
          : formatDate(createdAt),
        fields: milestoneDate
          ? [{ label: "Milestone", value: formatDate(milestoneDate) }]
          : undefined,
      };
    },
  },
);


function parseGardenWinBody(raw: string): {
  body: string;
  whyItMatters?: string;
  gratitude?: string;
} {
  const [beforeGratitude, gratitude] = raw.split(/\n\nGrateful for: /);
  const segments = (beforeGratitude ?? raw).split(/\n\nWhy it matters: /);
  if (segments.length > 1) {
    return {
      body: segments[0]!.trim(),
      whyItMatters: segments[1]!.trim(),
      gratitude: gratitude?.trim(),
    };
  }
  return {
    body: (beforeGratitude ?? raw).trim(),
    gratitude: gratitude?.trim(),
  };
}

function evidenceTitle(entry: NonNullable<ReturnType<typeof getEvidenceEntryById>>): string {
  const firstLine = entry.whatHappened.trim().split(/\n/)[0] ?? "";
  if (firstLine.length <= 72) return firstLine;
  return `${firstLine.slice(0, 69)}…`;
}

function evidenceCaptureFromEntry(
  entry: NonNullable<ReturnType<typeof getEvidenceEntryById>>,
): EstateCollectionCaptureValues {
  return {
    situation: entry.whatHappened,
    problem: entry.whatProblemSolved,
    whatIDid: entry.whatMovedForward,
    whyApproach: entry.whatImproved,
    outcome: entry.whyItMattered,
    whoBenefited: entry.whoBenefited,
    whyItMattered: entry.whyItMattered,
    lessonsLearned: entry.whatThisProves,
    category: entry.category,
    source: entry.source ?? "",
    emotion: entry.emotion ?? "",
    projectName: entry.projectName ?? "",
    personName: entry.personName ?? "",
    noteOrLink: entry.noteOrLink ?? "",
    confidenceBoost: entry.confidenceBoost ? "yes" : "no",
    hallCandidate: entry.hallCandidate ? "yes" : "no",
  };
}

function evidenceFieldsFromCapture(
  capture: EstateCollectionCaptureValues,
): EstateCollectionItemField[] {
  const pairs: [string, string | undefined][] = [
    ["Source", capture.source],
    ["Emotion", capture.emotion],
    ["Project", capture.projectName],
    ["Person", capture.personName],
    ["Confidence boost", capture.confidenceBoost],
    ["Note / link", capture.noteOrLink],
    ["Who benefited", capture.whoBenefited],
    ["What this proves", capture.lessonsLearned],
    ["Hall candidate", capture.hallCandidate],
  ];
  return pairs
    .filter(([, value]) => value?.trim())
    .map(([label, value]) => ({ label, value: value!.trim() }));
}

export const ESTATE_COLLECTION_ADAPTERS: Record<
  import("./types").EstateCollectionRoomId,
  EstateCollectionAdapter
> = {
  journal: journalAdapter(["journal", "capture_moment", "reflection"]),

  greenhouse: {
    updatedEventName: greenhouseStore.eventName,
    listItems: greenhouseStore.listItems,
    saveItem: greenhouseStore.saveItem,
    removeItem: greenhouseStore.removeItem,
    getItemCapture: greenhouseStore.getItemCapture,
    toggleFavorite: greenhouseStore.toggleFavorite,
  },

  "evidence-vault": {
    updatedEventName: EVIDENCE_BANK_UPDATED_EVENT,
    listItems(): EstateCollectionItem[] {
      return getEvidenceEntries().map((entry) => ({
        id: entry.id,
        badge: entry.category,
        title: evidenceTitle(entry),
        body: entry.whatHappened,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        detail: formatDate(entry.createdAt),
        category: entry.category,
        favorite: isEvidenceFavorite(entry),
        fields: evidenceFieldsFromCapture(evidenceCaptureFromEntry(entry)),
        captureValues: evidenceCaptureFromEntry(entry),
        attachments: entry.attachments,
      }));
    },
    saveItem(
      capture: EstateCollectionCaptureValues,
      options?: EstateCollectionSaveOptions,
    ): boolean {
      const situation = capture.situation?.trim();
      if (!situation) return false;
      const attachmentList = options?.attachments ?? [];
      const payload = {
        category: (capture.category?.trim() ||
          "Personal Growth") as EvidenceCategory,
        whatHappened: situation,
        whatProblemSolved: capture.problem?.trim() ?? "",
        whatMovedForward: capture.whatIDid?.trim() ?? situation,
        whatImproved: capture.whyApproach?.trim() ?? "",
        whyItMattered: capture.whyItMattered?.trim() ?? capture.outcome?.trim() ?? "",
        whoBenefited: capture.whoBenefited?.trim() ?? "",
        whatThisProves: capture.lessonsLearned?.trim() ?? "",
        attachments: attachmentList,
        source: capture.source?.trim() || undefined,
        emotion: capture.emotion?.trim() || undefined,
        projectName: capture.projectName?.trim() || undefined,
        personName: capture.personName?.trim() || undefined,
        noteOrLink: capture.noteOrLink?.trim() || undefined,
        confidenceBoost: /^yes\b/i.test(capture.confidenceBoost?.trim() ?? "yes"),
      };
      if (options?.editId) {
        updateEvidenceEntry(options.editId, payload);
        if (attachmentList.length > 0) {
          linkGrowthAttachmentsToRecord(
            attachmentList,
            "evidence-bank",
            options.editId,
          );
        }
        return true;
      }
      createEvidenceEntry(payload);
      return true;
    },
    getItemCapture(id: string) {
      const entry = getEvidenceEntryById(id);
      return entry ? evidenceCaptureFromEntry(entry) : null;
    },
    toggleFavorite(id: string) {
      toggleEvidenceFavorite(id);
    },
    removeItem(id: string) {
      deleteEvidenceEntry(id);
    },
  },

  "achievement-library": {
    ...journalAdapter(["milestone", "story_reflection", "lesson"]),
    listItems(): EstateCollectionItem[] {
      return getGrowthMemoryEntries({
        types: ["milestone", "story_reflection", "lesson"],
      }).map((entry) => ({
        id: entry.id,
        title: entry.title ?? "Untitled volume",
        body: entry.body,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        detail:
          entry.title && entry.createdAt
            ? formatDate(entry.createdAt).split(", ").pop() ?? formatDate(entry.createdAt)
            : formatDate(entry.createdAt),
        category: entry.tags.find((tag) => tag !== "favorite"),
        favorite: isJournalFavorite(entry),
        captureValues: {
          achievementType:
            entry.tags.find((tag) => tag !== "favorite") ?? "",
          title: entry.title ?? "",
          body: entry.body,
          year: formatDate(entry.createdAt).split(", ").pop() ?? "",
        },
        attachments: entry.attachments,
      }));
    },
    saveItem(
      capture: EstateCollectionCaptureValues,
      options?: EstateCollectionSaveOptions,
    ): boolean {
      const body = capture.body?.trim();
      const title = capture.title?.trim();
      if (!body || !title) return false;
      const tags = [
        ...(capture.achievementType?.trim()
          ? [capture.achievementType.trim()]
          : []),
      ];
      const attachmentList = options?.attachments ?? [];
      if (options?.editId) {
        const existing = getJournalEntryById(options.editId);
        if (!existing) return false;
        if (isJournalFavorite(existing)) tags.push("favorite");
        const ok = updateJournalEntry(options.editId, {
          body,
          title,
          tags,
          attachments: attachmentList,
        });
        return ok;
      }
      const { ok } = createJournalEntry({
        body,
        title,
        attachments: attachmentList,
        type: "milestone",
        tags,
        sourcePage: "achievement_library",
      });
      return ok;
    },
    getItemCapture(id: string) {
      const entry = getJournalEntryById(id);
      if (!entry) return null;
      return {
        achievementType:
          entry.tags.find((tag) => tag !== "favorite") ?? "",
        title: entry.title ?? "",
        body: entry.body,
        year: formatDate(entry.createdAt).split(", ").pop() ?? "",
      };
    },
    toggleFavorite(id: string) {
      toggleJournalFavorite(id);
    },
  },

  "celebration-garden": {
    updatedEventName: SAVED_GROWTH_WINS_UPDATED_EVENT,
    listItems(): EstateCollectionItem[] {
      return getSavedGrowthWins().map((win) => {
        const parsed = parseGardenWinBody(win.whatHappened);
        return {
          id: win.id,
          body: parsed.body,
          createdAt: win.createdAt,
          category: win.category?.trim() || undefined,
          detail: formatDate(win.ts),
          fields: [
            ...(parsed.whyItMatters
              ? [{ label: "Why it matters", value: parsed.whyItMatters }]
              : []),
            ...(parsed.gratitude
              ? [{ label: "Grateful for", value: parsed.gratitude }]
              : []),
          ],
          captureValues: {
            body: parsed.body,
            whyItMatters: parsed.whyItMatters ?? "",
            gratitude: parsed.gratitude ?? "",
            winDate: win.ts.slice(0, 10),
            category: win.category ?? "",
          },
          attachments: win.attachments,
        };
      });
    },
    saveItem(
      capture: EstateCollectionCaptureValues,
      options?: EstateCollectionSaveOptions,
    ): boolean {
      const main = capture.body?.trim();
      if (!main) return false;
      const parts = [main];
      if (capture.whyItMatters?.trim()) {
        parts.push(`Why it matters: ${capture.whyItMatters.trim()}`);
      }
      const gratitude = capture.gratitude?.trim();
      const body = gratitude
        ? `${parts.join("\n\n")}\n\nGrateful for: ${gratitude}`
        : parts.join("\n\n");
      const attachmentList = options?.attachments ?? [];
      const payload = {
        whatHappened: body,
        ts: capture.winDate?.trim()
          ? new Date(capture.winDate).toISOString()
          : new Date().toISOString(),
        icon: "",
        category: capture.category?.trim() || undefined,
        attachments: attachmentList,
      };
      if (options?.editId) {
        return Boolean(updateSavedGrowthWin(options.editId, payload));
      }
      createSavedGrowthWin(payload);
      return true;
    },
    getItemCapture(id: string) {
      const win = getSavedGrowthWins().find((entry) => entry.id === id);
      if (!win) return null;
      const parsed = parseGardenWinBody(win.whatHappened);
      return {
        body: parsed.body,
        whyItMatters: parsed.whyItMatters ?? "",
        gratitude: parsed.gratitude ?? "",
        winDate: win.ts.slice(0, 10),
        category: win.category ?? "",
      };
    },
    removeItem(id: string) {
      deleteSavedGrowthWin(id);
    },
  },

  "celebration-hall": {
    updatedEventName: celebrationHallStore.eventName,
    listItems: celebrationHallStore.listItems,
    saveItem: celebrationHallStore.saveItem,
    removeItem: celebrationHallStore.removeItem,
    getItemCapture: celebrationHallStore.getItemCapture,
    toggleFavorite: celebrationHallStore.toggleFavorite,
  },
};

export function getEstateCollectionAdapter(
  roomId: import("./types").EstateCollectionRoomId,
): EstateCollectionAdapter {
  return ESTATE_COLLECTION_ADAPTERS[roomId];
}
