import { describe, expect, it } from "vitest";
import {
  DRAFT_EDIT_MENU,
  DRAFT_EXPORT_MENU,
  DRAFT_SAVE_MENU,
  DRAFT_SOCIAL_MENU,
  draftExportMenuForArtifact,
  refineInstructionForEditAction,
} from "./createDraftActions";
import { buildSectionEditOpener } from "./createTemplateEditOptions";

describe("createDraftActions", () => {
  it("exposes simplified Edit / Save / Export / Social menus", () => {
    expect(DRAFT_EDIT_MENU[0].items.map((i) => i.id)).toEqual([
      "shorten",
      "lengthen",
      "rewrite",
      "change-tone",
      "custom-change",
    ]);
    expect(DRAFT_SAVE_MENU[0].items.map((i) => i.id)).toEqual([
      "save-google-docs",
      "save-google-drive",
      "add-existing-project",
    ]);
    expect(DRAFT_EXPORT_MENU[0].items.map((i) => i.id)).toEqual([
      "copy-text",
      "print",
      "export-pdf",
      "export-docx",
    ]);
    expect(DRAFT_SOCIAL_MENU[0].items.map((i) => i.id)).toEqual([
      "open-linkedin",
      "open-facebook",
      "open-instagram",
    ]);
  });

  it("maps edit actions to refine instructions", () => {
    expect(refineInstructionForEditAction("shorten")).toMatch(/Shorten/i);
    expect(refineInstructionForEditAction("custom-change")).toBeNull();
  });

  it("keeps print/pdf/docx for documents and filters by artifact family", () => {
    const docIds = draftExportMenuForArtifact("Proposal").flatMap((g) =>
      g.items.map((i) => i.id),
    );
    expect(docIds).toEqual(
      expect.arrayContaining(["copy-text", "print", "export-pdf", "export-docx"]),
    );
  });

  it("delegates section openers to template edit options", () => {
    expect(buildSectionEditOpener("Promise")).toMatch(/promise section/i);
  });
});
