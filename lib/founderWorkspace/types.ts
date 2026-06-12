export type FounderWorkspaceItemKind = "project" | "experiment" | "note";

export type FounderWorkspaceItemStatus = "new" | "active" | "parked" | "done";

export type FounderWorkspaceItem = {
  id: string;
  kind: FounderWorkspaceItemKind;
  title: string;
  description: string;
  status: FounderWorkspaceItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type FounderWorkspaceData = {
  projects: FounderWorkspaceItem[];
  experiments: FounderWorkspaceItem[];
  notes: FounderWorkspaceItem[];
};

export type FounderWorkspaceSection = FounderWorkspaceItemKind;

export const FOUNDER_WORKSPACE_STATUSES: {
  value: FounderWorkspaceItemStatus;
  label: string;
}[] = [
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "parked", label: "Parked" },
  { value: "done", label: "Done" },
];

export const FOUNDER_WORKSPACE_KINDS: {
  value: FounderWorkspaceItemKind;
  label: string;
}[] = [
  { value: "project", label: "Project" },
  { value: "experiment", label: "Experiment" },
  { value: "note", label: "Note" },
];

export function kindLabel(kind: FounderWorkspaceItemKind): string {
  return FOUNDER_WORKSPACE_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

export function statusLabel(status: FounderWorkspaceItemStatus): string {
  return FOUNDER_WORKSPACE_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function saveButtonLabel(kind: FounderWorkspaceItemKind): string {
  return `Save ${kindLabel(kind)}`;
}
