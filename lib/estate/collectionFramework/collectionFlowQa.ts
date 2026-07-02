/**
 * Collection Flow QA — dev checklist + automated smoke checks.
 * Manual steps verify live chat, room UI, attachments, and browse.
 */

import { filterCollectionItems } from "./collectionQuery";
import {
  buildCollectionPrefill,
  evaluateCollectionSaveOffer,
} from "./collectionOfferIntelligence";
import {
  createCollectionPendingOffer,
  resolveCollectionOfferReply,
} from "./collectionOfferFlow";
import { getEstateCollectionRoom } from "./registry";
import type { EstateCollectionRoomId } from "./types";

export const COLLECTION_FLOW_DESIGN_RULES = [
  {
    id: "no-auto-save",
    title: "Nothing auto-saves",
    detail:
      "Spark may open a room with a draft, but the member must tap save. No silent writes to journal, vault, garden, or library.",
  },
  {
    id: "permission-first",
    title: "Spark must always ask permission",
    detail:
      "Every collection offer is a question. Yes opens the room; no stays in chat; different room shows the menu.",
  },
  {
    id: "no-interrupt",
    title: "Do not interrupt other intents",
    detail:
      "Collection offers are suppressed for navigation requests, short replies, direct questions, overwhelm, and when a workspace is already open.",
  },
  {
    id: "one-offer",
    title: "One offer at a time",
    detail:
      "Only one pending collection offer may exist. A short cooldown prevents back-to-back offers in the same conversation.",
  },
] as const;

export type CollectionFlowQaCheckId =
  | "win-offer-garden"
  | "solved-offer-vault"
  | "reflection-offer-journal"
  | "decline-stays-chat"
  | "different-room-menu"
  | "room-opens-prefill"
  | "edit-before-save"
  | "attachments-work"
  | "saved-card-display"
  | "search-finds-entry";

export type CollectionFlowQaChecklistItem = {
  id: CollectionFlowQaCheckId;
  step: number;
  title: string;
  goal: string;
  sampleChatMessage: string;
  followUpMessages?: string[];
  expectedRoomId?: EstateCollectionRoomId;
  manualSteps: string[];
  roomPreviewPath?: string;
};

export const COLLECTION_FLOW_QA_CHECKLIST: CollectionFlowQaChecklistItem[] = [
  {
    id: "win-offer-garden",
    step: 1,
    title: "Chat detects a win → offers Celebration Garden",
    goal: "Spark notices completion language and asks about the garden — never auto-saves.",
    sampleChatMessage:
      "I finally shipped the landing page today and it actually went well — I'm proud of how it turned out.",
    expectedRoomId: "celebration-garden",
    manualSteps: [
      "Open /companion and send the sample message in a fresh or quiet thread.",
      "Spark should reply with a Celebration Garden permission question.",
      "Confirm no room opens until you answer.",
    ],
    roomPreviewPath: "/estate-collection/celebration-garden",
  },
  {
    id: "solved-offer-vault",
    step: 2,
    title: "Chat detects problem solved → offers Evidence Vault",
    goal: "Spark recognizes proof-of-impact language and offers the vault.",
    sampleChatMessage:
      "I handled a difficult client call today and figured out how to solve the billing issue without losing them.",
    expectedRoomId: "evidence-vault",
    manualSteps: [
      "Send the sample in chat (wait for cooldown if you just tested step 1).",
      "Spark should offer the Evidence Vault with a permission question.",
    ],
    roomPreviewPath: "/estate-collection/evidence-vault",
  },
  {
    id: "reflection-offer-journal",
    step: 3,
    title: "Chat detects reflection → offers Journal",
    goal: "Spark recognizes reflective/grateful language and offers the Journal Gazebo.",
    sampleChatMessage:
      "I've been reflecting on how grateful I am for my team and what this season is teaching me about patience.",
    expectedRoomId: "journal",
    manualSteps: [
      "Send the sample in chat.",
      "Spark should offer to save in your Journal.",
    ],
    roomPreviewPath: "/estate-collection/journal",
  },
  {
    id: "decline-stays-chat",
    step: 4,
    title: "User can decline and remain in chat",
    goal: "No room opens; conversation continues normally.",
    sampleChatMessage:
      "I finally shipped the landing page today and it actually went well.",
    followUpMessages: ["no thanks"],
    manualSteps: [
      "Trigger any collection offer, then reply no / no thanks / not now.",
      "You should stay in chat with a gentle acknowledgment.",
      "Pending offer should clear (no surprise room on next message).",
    ],
  },
  {
    id: "different-room-menu",
    step: 5,
    title: 'User can choose "different room"',
    goal: "Spark shows the numbered room menu instead of assuming the first match.",
    sampleChatMessage:
      "I finally shipped the landing page today and it actually went well.",
    followUpMessages: ["a different room please"],
    manualSteps: [
      "Trigger an offer, then ask for a different room.",
      "Spark should list all six collection rooms with numbers.",
      "Reply with a number or room name to continue.",
    ],
  },
  {
    id: "room-opens-prefill",
    step: 6,
    title: "Correct room opens with prefilled draft",
    goal: "Yes (or a room pick) opens the right destination with your words in the compose area.",
    sampleChatMessage:
      "I finally shipped the landing page today and it actually went well.",
    followUpMessages: ["yes"],
    expectedRoomId: "celebration-garden",
    manualSteps: [
      "Trigger an offer and reply yes (or pick a room from the menu).",
      "The matching collection room should open.",
      "Compose textarea should contain your original message as a draft.",
    ],
    roomPreviewPath: "/estate-collection/celebration-garden",
  },
  {
    id: "edit-before-save",
    step: 7,
    title: "User can edit before saving",
    goal: "Draft is editable; nothing is persisted until save.",
    sampleChatMessage:
      "I finally shipped the landing page today and it actually went well.",
    followUpMessages: ["yes"],
    manualSteps: [
      "Open a room from an offer.",
      "Change the draft text before saving.",
      "Refresh the page — unsaved draft should not appear in the collection list.",
      "Save once — then it should appear.",
    ],
  },
  {
    id: "attachments-work",
    step: 8,
    title: "Attachments work",
    goal: "Photos/files attach in compose and persist on saved entries.",
    sampleChatMessage:
      "Small win today — we got the newsletter out on time.",
    followUpMessages: ["yes"],
    manualSteps: [
      "Open Celebration Garden (or Journal / Vault / Achievement Library) from an offer.",
      "Use Add photo or file — attach a small image or PDF.",
      "Save — reopen via Continue writing and confirm attachment remains.",
    ],
    roomPreviewPath: "/estate-collection/celebration-garden",
  },
  {
    id: "saved-card-display",
    step: 9,
    title: "Saved card displays correctly",
    goal: "Browse list shows body preview, date, badge, and image cover when present.",
    sampleChatMessage:
      "I finally shipped the landing page today and it actually went well.",
    manualSteps: [
      "After saving (ideally with an image), find the entry in the room collection list.",
      "Card should show preview text, meta date, and cover thumbnail if attached.",
    ],
  },
  {
    id: "search-finds-entry",
    step: 10,
    title: "Search/filter can find it afterward",
    goal: "Browse search returns the saved entry by distinctive words.",
    sampleChatMessage:
      "I finally shipped the landing page today and it actually went well.",
    manualSteps: [
      "In the room browse bar, search for a distinctive word from your saved entry (e.g. landing).",
      "Entry should appear; clear search to see full collection again.",
    ],
  },
];

export type CollectionFlowAutomatedCheck = {
  id: string;
  checklistId?: CollectionFlowQaCheckId;
  label: string;
  passed: boolean;
  detail: string;
};

const WIN_SAMPLE =
  "I finally shipped the landing page today and it actually went well — I'm proud of how it turned out.";
const VAULT_SAMPLE =
  "I handled a difficult client call today and figured out how to solve the billing issue without losing them.";
const JOURNAL_SAMPLE =
  "I've been reflecting on how grateful I am for my team and what this season is teaching me about patience.";

function pendingFor(
  roomId: EstateCollectionRoomId,
  sourceUserText: string,
) {
  return createCollectionPendingOffer({
    roomId,
    sourceUserText,
    offerLine: `Offer for ${roomId}`,
    prefill: buildCollectionPrefill(roomId, sourceUserText),
    offeredAtTurn: 3,
  });
}

/** Headless smoke checks — run in vitest and on the dev QA page. */
export function runCollectionFlowAutomatedChecks(): CollectionFlowAutomatedCheck[] {
  const results: CollectionFlowAutomatedCheck[] = [];

  const winOffer = evaluateCollectionSaveOffer({
    userText: WIN_SAMPLE,
    currentTurn: 3,
  });
  results.push({
    id: "detect-win-garden",
    checklistId: "win-offer-garden",
    label: "Win text → Celebration Garden offer",
    passed: winOffer?.roomId === "celebration-garden",
    detail: winOffer?.offerLine ?? "No offer returned",
  });

  const vaultOffer = evaluateCollectionSaveOffer({
    userText: VAULT_SAMPLE,
    currentTurn: 4,
  });
  results.push({
    id: "detect-solved-vault",
    checklistId: "solved-offer-vault",
    label: "Problem solved text → Evidence Vault offer",
    passed: vaultOffer?.roomId === "evidence-vault",
    detail: vaultOffer?.offerLine ?? "No offer returned",
  });

  const journalOffer = evaluateCollectionSaveOffer({
    userText: JOURNAL_SAMPLE,
    currentTurn: 5,
  });
  results.push({
    id: "detect-reflection-journal",
    checklistId: "reflection-offer-journal",
    label: "Reflection text → Journal offer",
    passed: journalOffer?.roomId === "journal",
    detail: journalOffer?.offerLine ?? "No offer returned",
  });

  const noInterrupt = evaluateCollectionSaveOffer({
    userText: "How do I write a sales page for my course?",
    currentTurn: 6,
  });
  results.push({
    id: "suppress-question-intent",
    label: "Direct question → no collection offer",
    passed: noInterrupt === null,
    detail: noInterrupt ? `Unexpected offer: ${noInterrupt.roomId}` : "Suppressed as expected",
  });

  const decline = resolveCollectionOfferReply(
    "no thanks",
    pendingFor("evidence-vault", "Solved the billing issue."),
  );
  results.push({
    id: "decline-reply",
    checklistId: "decline-stays-chat",
    label: "Decline reply handled",
    passed: decline.handled && decline.kind === "decline",
    detail: decline.handled ? decline.ack : "Not handled",
  });

  const menu = resolveCollectionOfferReply(
    "a different room please",
    pendingFor("celebration-garden", WIN_SAMPLE),
  );
  results.push({
    id: "different-room-menu",
    checklistId: "different-room-menu",
    label: "Different room → menu",
    passed: menu.handled && menu.kind === "menu",
    detail: menu.handled ? menu.ack.slice(0, 80) + "…" : "Not handled",
  });

  const open = resolveCollectionOfferReply("yes", pendingFor("journal", JOURNAL_SAMPLE));
  results.push({
    id: "yes-opens-room",
    checklistId: "room-opens-prefill",
    label: "Yes → open suggested room with prefill",
    passed:
      open.handled &&
      open.kind === "open" &&
      open.openRoomId === "journal" &&
      Boolean(open.prefill?.body?.includes("grateful")),
    detail: open.handled
      ? `room=${open.openRoomId ?? "none"}`
      : "Not handled",
  });

  const roomPick = resolveCollectionOfferReply(
    "2",
    {
      ...pendingFor("celebration-garden", WIN_SAMPLE),
      phase: "choose_room",
    },
  );
  results.push({
    id: "numbered-room-pick",
    checklistId: "different-room-menu",
    label: "Numbered room pick resolves",
    passed: roomPick.handled && roomPick.kind === "open" && Boolean(roomPick.openRoomId),
    detail: roomPick.handled ? `room=${roomPick.openRoomId ?? "none"}` : "Not handled",
  });

  const gardenRoom = getEstateCollectionRoom("celebration-garden");
  results.push({
    id: "attachments-enabled-garden",
    checklistId: "attachments-work",
    label: "Celebration Garden attachments enabled in registry",
    passed: Boolean(gardenRoom.capture.enableAttachments),
    detail: gardenRoom.capture.attachmentLabel ?? "disabled",
  });

  const filtered = filterCollectionItems(
    [
      {
        id: "qa-1",
        body: "Shipped the landing page and felt proud.",
        createdAt: new Date().toISOString(),
        badge: "In bloom",
      },
    ],
    { search: "landing", favoritesOnly: false, category: null, visibleCount: 24 },
  );
  results.push({
    id: "search-filter",
    checklistId: "search-finds-entry",
    label: "Browse search finds matching entry",
    passed: filtered.length === 1,
    detail: `matches=${filtered.length}`,
  });

  return results;
}

export function formatCollectionFlowQaReport(
  automated: CollectionFlowAutomatedCheck[] = runCollectionFlowAutomatedChecks(),
): string {
  const lines = [
    "Collection Flow QA — automated checks",
    "=====================================",
    ...automated.map(
      (row) => `${row.passed ? "PASS" : "FAIL"}  ${row.label} — ${row.detail}`,
    ),
    "",
    `Total: ${automated.filter((r) => r.passed).length}/${automated.length} passed`,
  ];
  return lines.join("\n");
}

export const COLLECTION_FLOW_QA_MANUAL_STORAGE_KEY =
  "spark:collection-flow-qa:manual:v1";

export function loadManualQaChecks(): Record<string, boolean> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(COLLECTION_FLOW_QA_MANUAL_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function saveManualQaCheck(id: string, checked: boolean): void {
  if (typeof localStorage === "undefined") return;
  const next = { ...loadManualQaChecks(), [id]: checked };
  try {
    localStorage.setItem(COLLECTION_FLOW_QA_MANUAL_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearManualQaChecks(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(COLLECTION_FLOW_QA_MANUAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
