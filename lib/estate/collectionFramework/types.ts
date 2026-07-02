/**
 * Spark Estate Collection Framework™ — shared types.
 *
 * One engine, one workflow. Rooms differ in meaning via config + adapter.
 */

import type { AppSection } from "@/lib/companionUi";
import type { GrowthAttachment } from "@/lib/growthAttachments";

export const ESTATE_COLLECTION_ROOM_IDS = [
  "journal",
  "greenhouse",
  "evidence-vault",
  "achievement-library",
  "celebration-garden",
  "celebration-hall",
] as const;

export type EstateCollectionRoomId =
  (typeof ESTATE_COLLECTION_ROOM_IDS)[number];

/** Values keyed by capture field id. */
export type EstateCollectionCaptureValues = Record<string, string>;

export type EstateCollectionCaptureFieldKind =
  | "textarea"
  | "text"
  | "select"
  | "date";

/** One capture question in the compose area. */
export type EstateCollectionCaptureField = {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  kind?: EstateCollectionCaptureFieldKind;
  options?: readonly { value: string; label: string }[];
  /** Primary compose field — larger, journal-scale writing surface. */
  primary?: boolean;
};

/** Per-room capture copy and questions — same compose slot, different meaning. */
export type EstateCollectionCaptureConfig = {
  primaryFieldId: string;
  fields: readonly EstateCollectionCaptureField[];
  saveLabel: string;
  updateLabel?: string;
  savedMessage?: string;
  updatedMessage?: string;
  suggestedPromptsLabel?: string;
  followUpSectionLabel?: string;
  composeTitle?: string;
  enableAttachments?: boolean;
  attachmentLabel?: string;
};

export type EstateCollectionBrowseConfig = {
  searchPlaceholder: string;
  enableSearch: boolean;
  enableFavorites: boolean;
  enableCategoryFilter: boolean;
  categoryLabel?: string;
  pageSize: number;
  loadMoreLabel: string;
  resultsLabel: string;
  emptyFilterMessage: string;
};

/**
 * Visual personality for saved cards — same list shell, different feel.
 */
export type EstateCollectionDisplayStyle =
  | "reflection"
  | "seedling"
  | "vault"
  | "shelf"
  | "bloom"
  | "chapter";

/** Which parts of a saved card to show and how. */
export type EstateCollectionCardFormat = {
  showMeta: boolean;
  showTitle: boolean;
  showIcon: boolean;
  showBadge: boolean;
  showExtraFields: boolean;
  showProgress: boolean;
  bodyEmphasis: "prose" | "quote" | "chapter";
  layout: "stack" | "shelf" | "bloom" | "museum";
  editLabel: string;
  favoriteLabel: string;
  previewLines: number;
};

export type EstateCollectionDisplayConfig = {
  style: EstateCollectionDisplayStyle;
  card: EstateCollectionCardFormat;
  removeLabel?: string;
};

/** Optional labeled line on a saved card (e.g. vault “Proves”). */
export type EstateCollectionItemField = {
  label: string;
  value: string;
};

/** Normalized item — adapters map room storage into this shape. */
export type EstateCollectionItem = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  title?: string;
  detail?: string;
  icon?: string;
  badge?: string;
  category?: string;
  favorite?: boolean;
  progressPercent?: number;
  fields?: EstateCollectionItemField[];
  attachments?: GrowthAttachment[];
  /** Round-trip for edit — optional when derived from legacy stores. */
  captureValues?: EstateCollectionCaptureValues;
};

export type EstateCollectionSaveOptions = {
  editId?: string;
  attachments?: GrowthAttachment[];
};

/**
 * Room-specific data layer — list, save, remove, refine.
 */
export type EstateCollectionAdapter = {
  listItems: () => EstateCollectionItem[];
  saveItem: (
    capture: EstateCollectionCaptureValues,
    options?: EstateCollectionSaveOptions,
  ) => boolean;
  removeItem?: (id: string) => void;
  getItemCapture?: (id: string) => EstateCollectionCaptureValues | null;
  toggleFavorite?: (id: string) => void;
  updatedEventName?: string;
};

export type EstateCollectionRoomConfig = {
  id: EstateCollectionRoomId;
  placeId: string;
  section: AppSection;
  roomName: string;
  kicker: string;
  description: string;
  backgroundImage: string;
  imagePlaceId?: string;
  roomSceneImage?: string;
  roomSceneAlt?: string;
  openingSparkPrompt: string;
  /** When the room already holds entries — subtle return welcome. */
  returnSparkPrompt?: string;
  suggestedPrompts: readonly string[];
  followUpQuestions: readonly string[];
  collectionTitle: string;
  collectionEmptyMessage: string;
  capture: EstateCollectionCaptureConfig;
  browse: EstateCollectionBrowseConfig;
  display: EstateCollectionDisplayConfig;
  /** Lines Spark may use when suggesting this room — never auto-save. */
  sparkSuggestionLines: readonly string[];
};

export type EstateCollectionRoomDefinition = EstateCollectionRoomConfig & {
  adapter: EstateCollectionAdapter;
};
