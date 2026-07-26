import { describe, expect, it } from "vitest";
import {
  avatarPrintSections,
  avatarReportGroups,
  avatarStatus,
  buildAvatarPrintHtml,
  buildAvatarReportHtml,
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

describe("avatarReportGroups (professional report structure)", () => {
  const full = {
    name: "Burned Out Coach",
    who: "Solo founders",
    painPoints: "Too many tabs",
    goals: "Calm systems",
    solution: "I simplify",
    motivations: "Freedom",
    revenue: "~$2k/mo",
    research: {
      behavioral: "Procrastinates under load",
      custom: [{ id: "cf_1", label: "Messaging experiments", value: "Try short subject lines" }],
      // Notebook metadata must never surface in the report:
      threads: { who: { messages: [{ id: "m1", role: "assistant", content: "SECRET THREAD" }], updatedAt: "x" } },
      addedResponses: ["m1"],
      version: 1,
    },
  };

  it("groups populated sections and hides empty ones", () => {
    const groups = avatarReportGroups(full);
    const headings = groups.map((g) => g.heading);
    expect(headings).toContain("Avatar overview");
    expect(headings).toContain("Goals & desired outcomes");
    expect(headings).toContain("Step 10 research insights");
    // No populated content for these → hidden.
    expect(headings).not.toContain("Communication preferences");
  });

  it("prints each populated Step 10 module and custom fields by label, never metadata", () => {
    const groups = avatarReportGroups(full);
    const step10 = groups.find((g) => g.heading === "Step 10 research insights")!;
    const labels = step10.sections.map((s) => s.label);
    expect(labels).toContain("Behavioral patterns");
    expect(labels).toContain("Messaging experiments"); // custom by label
    // Notebook metadata is never a printed section.
    expect(JSON.stringify(groups)).not.toContain("SECRET THREAD");
    expect(labels).not.toContain("threads");
    expect(labels).not.toContain("addedResponses");
  });

  it("includes the Revenue Connection section only when populated", () => {
    expect(
      avatarReportGroups(full).some((g) => g.heading === "Revenue Connection"),
    ).toBe(true);
    expect(
      avatarReportGroups({ ...full, revenue: "" }).some(
        (g) => g.heading === "Revenue Connection",
      ),
    ).toBe(false);
  });
});

describe("avatarStatus", () => {
  it("derives Draft vs Completed from completion, not a stored field", () => {
    expect(
      avatarStatus({ name: "X", who: "Y", painPoints: "Z", goals: "G", solution: "S" }),
    ).toBe("Completed");
    expect(avatarStatus({ name: "X", who: "Y" })).toBe("Draft");
  });
});

describe("buildAvatarReportHtml", () => {
  const groups = avatarReportGroups({
    name: "Burned Out Coach",
    who: "Solo founders",
    goals: "Calm systems",
  });

  it("renders the name, status, dates and populated sections; no builder chrome or room background", () => {
    const html = buildAvatarReportHtml({
      name: "Burned Out Coach",
      status: "Draft",
      createdAt: "2026-07-20T10:00:00.000Z",
      updatedAt: "2026-07-26T12:00:00.000Z",
      groups,
    });
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Burned Out Coach");
    expect(html).toContain("Client Avatar · Draft");
    expect(html).toContain("Created 2026-07-20");
    expect(html).toContain("Updated 2026-07-26");
    expect(html).toContain("Solo founders");
    // No builder controls, composer, or room background in the report.
    expect(html).not.toContain("<button");
    expect(html).not.toContain("Save Progress");
    expect(html).not.toContain("background-image");
    expect(html).not.toContain("Research this");
  });

  it("includes an uploaded image but never a cartoon emoji, and omits image when none", () => {
    const withImg = buildAvatarReportHtml({
      name: "X",
      status: "Completed",
      image: "data:image/png;base64,AAAA",
      groups,
    });
    expect(withImg).toContain('<img class="avatar-photo"');
    expect(withImg).toContain("data:image/png;base64,AAAA");
    // An emoji is not a printable image → no <img> element, no emoji in output.
    const withEmoji = buildAvatarReportHtml({
      name: "X",
      status: "Completed",
      image: "👤",
      groups,
    });
    expect(withEmoji).not.toContain("<img");
    expect(withEmoji).not.toContain("👤");
  });
});
