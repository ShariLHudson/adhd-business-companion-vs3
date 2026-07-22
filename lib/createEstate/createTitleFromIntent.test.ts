import { describe, expect, it } from "vitest";
import {
  createTitleFromIntent,
  isTemplateLikeTitle,
  newWorkTemporaryTitle,
} from "./createTitleFromIntent";

describe("createTitleFromIntent (130)", () => {
  it("never uses Announcement Newsletter for coaching newsletter intent", () => {
    const title = createTitleFromIntent({
      requestText: "Weekly newsletter for coaching clients",
      artifactType: "Newsletter",
      templateName: "Announcement Newsletter",
    });
    expect(title.toLowerCase()).not.toBe("announcement newsletter");
    expect(title.toLowerCase()).toMatch(/newsletter|coaching|weekly/);
  });

  it("uses member wording when structure confidence is low", () => {
    const title = createTitleFromIntent({
      requestText: "Weekly newsletter for coaching clients",
      artifactType: "Newsletter",
    });
    expect(title.length).toBeGreaterThan(8);
    expect(title).not.toMatch(/^Untitled/i);
  });

  it("browse-only without request gets New {Type}", () => {
    expect(createTitleFromIntent({ artifactType: "Blog Post" })).toBe(
      "New Blog Post",
    );
    expect(newWorkTemporaryTitle("Email")).toBe("New Email");
  });

  it("detects template-like titles that ignore the request", () => {
    expect(
      isTemplateLikeTitle(
        "Announcement Newsletter",
        "Weekly newsletter for coaching clients",
      ),
    ).toBe(true);
    expect(
      isTemplateLikeTitle(
        "Weekly Newsletter for Coaching Clients",
        "Weekly newsletter for coaching clients",
      ),
    ).toBe(false);
  });
});
