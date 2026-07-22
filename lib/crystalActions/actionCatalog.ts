import type {
  CrystalActionDef,
  CrystalActionId,
  CrystalActionItemKind,
} from "./types";

const ACTION: Record<CrystalActionId, CrystalActionDef> = {
  save: { id: "save", label: "Save", crystalRoute: "write" },
  share: { id: "share", label: "Share", crystalRoute: "spark-social-media" },
  export: { id: "export", label: "Export", crystalRoute: "print" },
  print: { id: "print", label: "Print", crystalRoute: "print" },
  "add-to-calendar": {
    id: "add-to-calendar",
    label: "Add to Calendar",
    crystalRoute: "schedule",
  },
  download: { id: "download", label: "Download", crystalRoute: "save" },
  "continue-working": {
    id: "continue-working",
    label: "Continue Working",
  },
  archive: { id: "archive", label: "Archive" },
};

/** Only actions that make sense for the current item kind. */
export const CRYSTAL_ACTIONS_BY_ITEM: Record<
  CrystalActionItemKind,
  readonly CrystalActionId[]
> = {
  document: ["save", "share", "export", "print"],
  event: ["add-to-calendar", "share", "print"],
  image: ["download", "share"],
  project: ["continue-working", "share", "archive"],
  journal: ["save", "export", "print"],
};

export function actionsForItemKind(
  kind: CrystalActionItemKind,
): CrystalActionDef[] {
  return CRYSTAL_ACTIONS_BY_ITEM[kind].map((id) => ACTION[id]);
}

export const CRYSTAL_ACTIONS_PANEL_TITLE =
  "What would you like to do next?" as const;
