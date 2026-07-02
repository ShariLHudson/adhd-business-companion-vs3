/**
 * User Memory Library™ — unified read model for Capture destinations.
 * Capture writes → domain stores → UserMemoryStore aggregates for view/export.
 */

export type MemoryEntryType = "journal" | "portfolio" | "evidence";

export type UserMemoryEntry = {
  id: string;
  type: MemoryEntryType;
  content: string;
  title?: string;
  timestamp: string;
  tags: string[];
};

export type UserMemoryStore = {
  journals: UserMemoryEntry[];
  portfolioItems: UserMemoryEntry[];
  evidenceItems: UserMemoryEntry[];
};

export type MemoryDateRangePreset = "week" | "month" | "all" | "custom";

export type MemoryDateRange =
  | { preset: "week" | "month" | "all" }
  | { preset: "custom"; start: string; end: string };

export type MemoryTypeFilter = MemoryEntryType | "all";

export type MemoryQuery = {
  typeFilter?: MemoryTypeFilter;
  dateRange?: MemoryDateRange;
  search?: string;
};

export const USER_MEMORY_UPDATED_EVENT = "companion-user-memory-updated";
