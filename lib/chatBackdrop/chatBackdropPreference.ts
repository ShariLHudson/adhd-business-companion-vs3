/**
 * Member-chosen image behind chat / workspace panels.
 * Changes the photograph only — never the chat chrome or frosted writing area.
 */

import { CLEAR_MY_MIND_SUNROOM_BG } from "@/lib/clearMyMind/conservatory";
import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";

export type ChatBackdropOption = {
  id: string;
  label: string;
  description: string;
  /** Used for chat homestead / everyday conversation. */
  surfaces: readonly ("chat" | "clear-my-mind")[];
  imageUrl: string;
};

const STORAGE_CHAT = "spark.chatBackdropId.v1";
const STORAGE_CLEAR_MY_MIND = "spark.clearMyMindBackdropId.v1";
const STORAGE_ROOM_OVERRIDES = "spark.roomBackdropOverride.v1";
export const CHAT_BACKDROP_CHANGED_EVENT = "spark:chat-backdrop-changed";

export const CHAT_BACKDROP_OPTIONS: readonly ChatBackdropOption[] = [
  {
    id: "welcome-home",
    label: "Welcome Home",
    description: "Your welcoming estate lobby — the heart of Spark Estate.",
    surfaces: ["chat"],
    imageUrl: estateBackgroundPath("welcome-home-background.png"),
  },
  {
    id: "sunroom",
    label: "Sunroom",
    description: "A bright glass room filled with gentle natural light.",
    surfaces: ["chat", "clear-my-mind"],
    imageUrl: CLEAR_MY_MIND_SUNROOM_BG,
  },
  {
    id: "library",
    label: "Estate Library",
    description: "Quiet shelves and soft lamplight for unhurried thought.",
    surfaces: ["chat"],
    imageUrl: estateBackgroundPath("room-library-estate-background.png"),
  },
  {
    id: "greenhouse",
    label: "Greenhouse",
    description: "Lush greenery and humid calm beneath the glass.",
    surfaces: ["chat", "clear-my-mind"],
    imageUrl: estateBackgroundPath("greenhouse-background.png"),
  },
  {
    id: "tea-room",
    label: "Tea Room",
    description: "An intimate space for conversation over a warm cup.",
    surfaces: ["chat"],
    imageUrl: estateBackgroundPath("tea-room-background.webp"),
  },
  {
    id: "fireside-deck",
    label: "Fireside Deck",
    description: "Evening air and flickering firelight on the deck.",
    surfaces: ["chat"],
    imageUrl: estateBackgroundPath("fireside-deck-background.PNG"),
  },
  {
    id: "reading-nook",
    label: "Reading Nook",
    description: "A cozy window seat for one book and one breath.",
    surfaces: ["chat"],
    imageUrl: estateBackgroundPath("reading-nook-window background.png"),
  },
] as const;

export const DEFAULT_CHAT_BACKDROP_ID = "welcome-home";
export const DEFAULT_CLEAR_MY_MIND_BACKDROP_ID = "sunroom";

function readId(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeId(key: string, id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, id);
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(
    new CustomEvent(CHAT_BACKDROP_CHANGED_EVENT, { detail: { key, id } }),
  );
}

export function chatBackdropOptionById(
  id: string | null | undefined,
): ChatBackdropOption | undefined {
  if (!id) return undefined;
  return CHAT_BACKDROP_OPTIONS.find((o) => o.id === id);
}

export function optionsForSurface(
  surface: "chat" | "clear-my-mind",
): ChatBackdropOption[] {
  return CHAT_BACKDROP_OPTIONS.filter((o) => o.surfaces.includes(surface));
}

/** Stored choice, or null when member has not overridden the default living-room photo. */
export function getStoredChatBackdropId(): string | null {
  return readId(STORAGE_CHAT);
}

export function getChatBackdropId(): string {
  const stored = getStoredChatBackdropId();
  if (stored && chatBackdropOptionById(stored)) return stored;
  return DEFAULT_CHAT_BACKDROP_ID;
}

export function setChatBackdropId(id: string): void {
  if (!chatBackdropOptionById(id)) return;
  writeId(STORAGE_CHAT, id);
}

/**
 * Resolved URL behind everyday chat when the member picked one.
 * Returns null when unset so the homestead living-room photo stays default.
 */
export function getChatBackdropImageUrl(): string | null {
  const stored = getStoredChatBackdropId();
  if (!stored) return null;
  return chatBackdropOptionById(stored)?.imageUrl ?? null;
}

export function getClearMyMindBackdropId(): string {
  const stored = readId(STORAGE_CLEAR_MY_MIND);
  const option = chatBackdropOptionById(stored ?? undefined);
  if (stored && option?.surfaces.includes("clear-my-mind")) return stored;
  return DEFAULT_CLEAR_MY_MIND_BACKDROP_ID;
}

export function setClearMyMindBackdropId(id: string): void {
  const option = chatBackdropOptionById(id);
  if (!option?.surfaces.includes("clear-my-mind")) return;
  writeId(STORAGE_CLEAR_MY_MIND, id);
}

/** Resolved URL behind Clear My Mind workspace panel. */
export function getClearMyMindBackdropImageUrl(): string {
  const id = getClearMyMindBackdropId();
  return (
    chatBackdropOptionById(id)?.imageUrl ??
    chatBackdropOptionById(DEFAULT_CLEAR_MY_MIND_BACKDROP_ID)!.imageUrl
  );
}

function readRoomOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_ROOM_OVERRIDES);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

function writeRoomOverrides(overrides: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_ROOM_OVERRIDES, JSON.stringify(overrides));
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(
    new CustomEvent(CHAT_BACKDROP_CHANGED_EVENT, {
      detail: { key: STORAGE_ROOM_OVERRIDES },
    }),
  );
}

/** Member-chosen environment for a specific estate room. */
export function getRoomBackdropOverrideId(roomId: string): string | null {
  const stored = readRoomOverrides()[roomId] ?? null;
  if (!stored || !chatBackdropOptionById(stored)) return null;
  return stored;
}

export function setRoomBackdropOverride(roomId: string, optionId: string): void {
  if (!roomId || !chatBackdropOptionById(optionId)) return;
  const overrides = readRoomOverrides();
  overrides[roomId] = optionId;
  writeRoomOverrides(overrides);
}

export function getRoomBackdropImageUrl(roomId: string): string | null {
  const id = getRoomBackdropOverrideId(roomId);
  if (!id) return null;
  return chatBackdropOptionById(id)?.imageUrl ?? null;
}

export function allBackdropOptions(): ChatBackdropOption[] {
  return [...CHAT_BACKDROP_OPTIONS];
}

export function subscribeChatBackdropChange(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === STORAGE_CHAT ||
      e.key === STORAGE_CLEAR_MY_MIND ||
      e.key === STORAGE_ROOM_OVERRIDES ||
      e.key === null
    ) {
      listener();
    }
  };
  window.addEventListener(CHAT_BACKDROP_CHANGED_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHAT_BACKDROP_CHANGED_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
