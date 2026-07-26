import { describe, expect, it } from "vitest";
import {
  avatarPrintSections,
  buildAvatarPrintHtml,
  isAvatarComplete,
} from "./clientAvatarPrint";

describe("avatarPrintSections", () => {
  it("includes only answered fields, in order", () => {
    const sections = avatarPrintSections({
      name: "Burned Out Coach",
      who: "Solo founders",
      painPoints: "Too many tabs",
      goals: "",
      solution: "",
    });
    const labels = sections.map((s) => s.label);
    expect(labels).toContain("Client name / label");
    expect(labels).toContain("Who they are");
    expect(labels).toContain("What they're struggling with most");
    // Empty fields are omitted.
    expect(labels).not.toContain("What they're trying to achieve");
  });

  it("flattens traits and research into readable values", () => {
    const sections = avatarPrintSections({
      behaviorTraits: ["overwhelmed", "beginner"],
      research: { market: "Prefers short content" },
    });
    const byLabel = Object.fromEntries(sections.map((s) => [s.label, s.value]));
    expect(byLabel["Behavior traits"]).toBe("overwhelmed, beginner");
    expect(byLabel["Research notes"]).toContain("Prefers short content");
  });
});

describe("isAvatarComplete", () => {
  it("is complete only when the key questions are answered", () => {
    expect(
      isAvatarComplete({
        name: "X",
        who: "Y",
        painPoints: "Z",
        goals: "G",
        solution: "S",
      }),
    ).toBe(true);
    expect(isAvatarComplete({ name: "X", who: "Y" })).toBe(false);
  });
});

describe("buildAvatarPrintHtml", () => {
  it("produces a clean document with the title, subtitle and sections", () => {
    const html = buildAvatarPrintHtml({
      title: "Burned Out Coach",
      subtitle: "Progress So Far",
      sections: [{ label: "Who they are", value: "Solo founders" }],
    });
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Burned Out Coach");
    expect(html).toContain("Progress So Far");
    expect(html).toContain("Who they are");
    expect(html).toContain("Solo founders");
  });

  it("escapes HTML and preserves line breaks", () => {
    const html = buildAvatarPrintHtml({
      title: "A & B <script>",
      subtitle: "Current Question",
      sections: [{ label: "Note", value: "line1\nline2 <b>" }],
    });
    expect(html).toContain("A &amp; B &lt;script&gt;");
    expect(html).toContain("line1<br>line2 &lt;b&gt;");
    expect(html).not.toContain("<script>");
  });
});
