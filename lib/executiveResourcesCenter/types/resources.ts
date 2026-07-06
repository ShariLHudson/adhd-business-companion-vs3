/** Executive Resources Center™ — department-organized external resources. */

export type ResourceDepartmentId =
  | "executive"
  | "development"
  | "ai-studio"
  | "google-workspace"
  | "marketing"
  | "operations"
  | "booking-calendars"
  | "business-toolkit";

export type ExecutiveResourceItem = {
  id: string;
  name: string;
  purpose: string;
  bestUsedFor?: string;
  recommendedUses?: string;
  openUrl?: string;
  bookingLink?: string;
  copyPromptPlaceholder?: string;
  notes?: string;
  isFuture?: boolean;
};

export type ResourceDepartment = {
  id: ResourceDepartmentId;
  label: string;
  purpose: string;
  items: readonly ExecutiveResourceItem[];
};
