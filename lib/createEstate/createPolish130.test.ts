/**
 * Spec 130 — Create Experience Final Polish & Certification.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CREATE_ESTATE_CONFIRM_CANCEL,
  CREATE_ESTATE_CONFIRM_OTHER,
  CREATE_ESTATE_MANAGE_WORK_LABEL,
  CREATE_ESTATE_SAVED_CREATIONS_EMPTY,
} from "./copy";
import {
  createConfirmPrimaryLabel,
  createIntentConfirmMessage,
} from "./createIntentConfirmation";
import {
  confirmCreateBeginToOpen,
  resolveCatalogCreateConfirm,
  resolveCreateBeginOutcome,
} from "./resolveCreateBeginOutcome";
import { resolveWorkTypeVisual } from "./workTypeVisual";
import {
  hasMeaningfulCreateEdit,
  isPostCreateUndoEligible,
  POST_CREATE_UNDO_MS,
} from "./postCreateUndo";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Create polish 130 certification", () => {
  it("One Creation Rule — NL still confirms before open", () => {
    const outcome = resolveCreateBeginOutcome(
      "I want to create a blog post about pricing",
    );
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.message).toMatch(/looks like you'd like to create/i);
    expect(confirmCreateBeginToOpen(outcome).kind).toBe("open");
  });

  it("Browse Ideas / catalog path resolves to confirm (never silent create)", () => {
    const confirm = resolveCatalogCreateConfirm({ label: "Blog Post" });
    expect(confirm.kind).toBe("confirm");
    expect(confirm.artifactType).toMatch(/blog post/i);
    expect(confirm.message).toBe(createIntentConfirmMessage("Blog Post"));
    expect(createConfirmPrimaryLabel("Blog Post")).toBe("Create Blog Post");
  });

  it("entrance wires catalog confirm from every discovery path + Cancel", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("resolveCatalogCreateConfirm");
    expect(panel).toContain("requestCatalogConfirm");
    expect(panel).toContain("onRequestCreate={requestCatalogConfirm}");
    expect(panel).not.toContain("requestFrameworkConfirm");
    expect(panel).toContain("create-estate-confirm-cancel");
    expect(panel).toContain("createConfirmPrimaryLabel");
    const findPrevious = read(
      "components/companion/CreateFindPreviousWorkPanel.tsx",
    );
    expect(findPrevious).toContain("CREATE_ESTATE_SAVED_CREATIONS_EMPTY");
    expect(CREATE_ESTATE_CONFIRM_CANCEL).toBe("Cancel");
    expect(CREATE_ESTATE_CONFIRM_OTHER).toBe("Choose something else");
  });

  it("Manage My Work bulk actions on Continue Working", () => {
    const list = read("components/companion/CreateWorkspaceResumeList.tsx");
    expect(list).toContain("create-manage-my-work");
    expect(list).toContain("archiveActiveWorkspace");
    expect(list).toContain("moveActiveWorkspaceToTrash");
    expect(list).toContain("permanentlyDeleteActiveWorkspace");
    expect(list).toContain("restoreActiveWorkspace");
    expect(list).toContain("resolveWorkTypeVisual");
    expect(CREATE_ESTATE_MANAGE_WORK_LABEL).toBe("Manage My Work");
  });

  it("Work Type visual accents cover core kinds", () => {
    expect(resolveWorkTypeVisual("Email").kind).toBe("email");
    expect(resolveWorkTypeVisual("Newsletter").icon).toBeTruthy();
    expect(resolveWorkTypeVisual("Marketing Plan").kind).toBe("marketing plan");
    expect(resolveWorkTypeVisual("Workshop").kind).toBe("workshop");
  });

  it("empty Find Previous Work teaches instead of showing a blank list", () => {
    expect(CREATE_ESTATE_SAVED_CREATIONS_EMPTY).toBe(
      "Your saved creations will appear here.",
    );
    const findPrevious = read(
      "components/companion/CreateFindPreviousWorkPanel.tsx",
    );
    expect(findPrevious).toContain("create-find-previous-work-empty");
  });

  it("post-create Undo eligible until meaningful edit or timeout", () => {
    const createdAt = new Date().toISOString();
    expect(
      isPostCreateUndoEligible({
        createdAt,
        hasMeaningfulEdit: false,
      }),
    ).toBe(true);
    expect(
      isPostCreateUndoEligible({
        createdAt,
        hasMeaningfulEdit: true,
      }),
    ).toBe(false);
    expect(
      isPostCreateUndoEligible({
        createdAt: new Date(Date.now() - POST_CREATE_UNDO_MS - 1000).toISOString(),
        hasMeaningfulEdit: false,
      }),
    ).toBe(false);
    expect(
      hasMeaningfulCreateEdit({
        draftContent: "Hello",
      }),
    ).toBe(true);
    expect(
      hasMeaningfulCreateEdit({
        discoveryAnswers: { purpose: "I want a newsletter" },
      }),
    ).toBe(false);
  });

  it("working panel wires Undo + intent titles", () => {
    const panel = read("components/companion/CreateEstateWorkingPanel.tsx");
    expect(panel).toContain("create-estate-undo-create");
    expect(panel).toContain("createTitleFromIntent");
    expect(panel).toContain("moveActiveWorkspaceToTrash");
    expect(panel).toContain("originalRequest");
  });

  it("preserves 127/129 confirm gate and hierarchy", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-intent-confirm");
    expect(panel).toContain("create-estate-browse-more");
    expect(panel).toContain("CreateWorkspaceResumeList");
  });
});
