import { describe, expect, it } from "vitest";
import {
  collaborativeDraftFollowUp,
  inferFragmentSection,
  isPartialComponentRequest,
  looksLikeDraftFragment,
  mergeFragmentIntoStructuredDraft,
  resolveCollaborativeDraftTitle,
  shouldOfferCompleteDraftBuild,
} from "./collaborativeDrafting";

describe("collaborativeDrafting", () => {
  it("detects partial component requests", () => {
    expect(
      isPartialComponentRequest("Give me an anecdote for my social media post"),
    ).toBe(true);
    expect(inferFragmentSection("give me a hook")).toBe("Hook");
  });

  it("keeps draft title as item type, not fragment text", () => {
    const title = resolveCollaborativeDraftTitle({
      itemType: "Social Post",
      userText: "anecdote for my social media post",
    });
    expect(title).toBe("Social Media Post");
  });

  it("merges fragments under section headings", () => {
    const first = mergeFragmentIntoStructuredDraft(
      "",
      "Last Tuesday I almost quit — then one tiny win changed everything.",
      "Anecdote",
    );
    expect(first.draft).toContain("## Anecdote");

    const second = mergeFragmentIntoStructuredDraft(
      first.draft,
      "Stop waiting for motivation — start with one visible step.",
      "Hook",
    );
    expect(second.draft).toContain("## Hook");
    expect(second.draft).toContain("## Anecdote");
  });

  it("treats short assistant replies as draft fragments when requested", () => {
    const user = "Give me an anecdote for my social media post";
    const assistant =
      "Last week I stared at a blank doc for twenty minutes — then I wrote one messy sentence and shipped it.";
    expect(looksLikeDraftFragment(assistant, user)).toBe(true);
  });

  it("offers complete build only when enough material exists", () => {
    const sparse = "## Hook\n\nTry this.";
    const rich = [
      "## Hook",
      "Open with a question that names the real struggle your reader feels today.",
      "## Anecdote",
      "A short story about momentum returning after one tiny visible step forward.",
      "## CTA",
      "Comment if this landed — I read every reply and use them for the next post.",
    ].join("\n\n");
    expect(shouldOfferCompleteDraftBuild(sparse)).toBe(false);
    expect(shouldOfferCompleteDraftBuild(rich)).toBe(true);
    expect(collaborativeDraftFollowUp("Social Post", { offerCompleteBuild: true })).toContain(
      "build the complete draft",
    );
  });
});
