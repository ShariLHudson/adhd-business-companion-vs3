/**
 * Draft screen action model — Edit / Save / Export / Social menus.
 */

export type DraftEditAction =
  | "shorten"
  | "lengthen"
  | "rewrite"
  | "change-tone"
  | "custom-change";

export type DraftSaveAction =
  | "save-google-docs"
  | "save-google-drive"
  | "add-existing-project";

export type DraftExportAction =
  | "copy-text"
  | "print"
  | "export-pdf"
  | "export-docx";

export type DraftSocialAction =
  | "open-linkedin"
  | "open-facebook"
  | "open-instagram";

export type DraftMenuGroup = {
  label?: string;
  items: { id: string; label: string }[];
};

export const DRAFT_EDIT_MENU: DraftMenuGroup[] = [
  {
    items: [
      { id: "shorten", label: "Shorten" },
      { id: "lengthen", label: "Lengthen" },
      { id: "rewrite", label: "Rewrite" },
      { id: "change-tone", label: "Change Tone" },
      { id: "custom-change", label: "Custom Change" },
    ],
  },
];

export const DRAFT_SAVE_MENU: DraftMenuGroup[] = [
  {
    items: [
      { id: "save-google-docs", label: "Save to Google Docs" },
      { id: "save-google-drive", label: "Save to Google Drive" },
      { id: "add-existing-project", label: "Add to Project" },
    ],
  },
];

export const DRAFT_EXPORT_MENU: DraftMenuGroup[] = [
  {
    items: [
      { id: "copy-text", label: "Copy Text" },
      { id: "print", label: "Print" },
      { id: "export-pdf", label: "PDF" },
      { id: "export-docx", label: "DOCX" },
    ],
  },
];

export const DRAFT_SOCIAL_MENU: DraftMenuGroup[] = [
  {
    items: [
      { id: "open-linkedin", label: "Open LinkedIn" },
      { id: "open-facebook", label: "Open Facebook" },
      { id: "open-instagram", label: "Open Instagram" },
    ],
  },
];

const EDIT_REFINE_INSTRUCTIONS: Record<
  Exclude<DraftEditAction, "custom-change">,
  string
> = {
  shorten: "Shorten this draft while keeping the main points.",
  lengthen: "Expand this draft with more helpful detail while keeping the structure.",
  rewrite: "Rewrite this draft for clarity and flow.",
  "change-tone": "Change the tone to be warmer and more approachable.",
};

export function refineInstructionForEditAction(
  action: DraftEditAction,
): string | null {
  if (action === "custom-change") return null;
  return EDIT_REFINE_INSTRUCTIONS[action] ?? null;
}

export const SOCIAL_PLATFORM_URLS = {
  linkedin: "https://www.linkedin.com/feed/?shareActive=true",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
} as const;
