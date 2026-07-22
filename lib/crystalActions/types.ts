/**
 * Crystal Actions — contextual next-step actions after create/update.
 * Crystal identity kept; Destination Gallery room retired from navigation.
 */

export type CrystalActionItemKind =
  | "document"
  | "event"
  | "image"
  | "project"
  | "journal";

/** Generic member-facing action names — never provider brands by default. */
export type CrystalActionId =
  | "save"
  | "share"
  | "export"
  | "print"
  | "add-to-calendar"
  | "download"
  | "continue-working"
  | "archive";

export type CrystalActionDestinationId =
  | "spark-estate"
  | "google-docs"
  | "google-drive"
  | "microsoft-word"
  | "google-calendar"
  | "outlook-calendar"
  | "canva"
  | "local"
  | "print-dialog"
  | "save-pdf"
  | "social";

export type CrystalActionDef = {
  id: CrystalActionId;
  label: string;
  /** Maps to Destination Gallery / launch routing when applicable */
  crystalRoute?:
    | "write"
    | "save"
    | "spark-social-media"
    | "print"
    | "schedule"
    | "create";
};

export type CrystalActionProviderOption = {
  id: CrystalActionDestinationId;
  label: string;
};

export type ResolvedCrystalAction = CrystalActionDef & {
  /** When >1 valid destination, member chooses once; choice is remembered. */
  needsProviderChoice: boolean;
  providers: CrystalActionProviderOption[];
  /** Auto-selected destination when only one (or remembered) */
  autoDestinationId: CrystalActionDestinationId | null;
};

export type CrystalActionsPanelModel = {
  title: string;
  itemKind: CrystalActionItemKind;
  actions: ResolvedCrystalAction[];
};
