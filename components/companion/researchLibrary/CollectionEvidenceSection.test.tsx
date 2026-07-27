/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CollectionEvidenceSection } from "./CollectionEvidenceSection";
import { makeFinding, type SharedResearchFinding } from "@/lib/research/types";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const q = (sel: string) => container.querySelector(sel);
function render(findings: SharedResearchFinding[]) {
  act(() => {
    root.render(<CollectionEvidenceSection findings={findings} />);
  });
}

const guidance = makeFinding({
  id: "g1",
  title: "Advisory vs governing board",
  content: "Advisors guide; no fiduciary duty.",
  kind: "recommendation",
  evidenceBasis: "built_in_guidance",
});

describe("CollectionEvidenceSection — honest evidence presentation", () => {
  it("built-in guidance renders under 'Frameworks and Guidance', never as citations", () => {
    render([guidance]);
    expect(q('[data-testid="research-library-guidance"]')).not.toBeNull();
    expect(container.textContent).toContain("Knowledge & Frameworks");
    // No genuine-source heading and no citation cards for guidance.
    expect(q('[data-testid="research-library-sources"]')).toBeNull();
    expect(q('[data-testid="research-source-list"]')).toBeNull();
    // The guidance section's heading answers "where did this come from" —
    // honestly, and not "Sources".
    const heading = q('[data-testid="research-library-guidance"] h3');
    expect(heading?.textContent).toBe("Knowledge & Frameworks");
  });

  it("never surfaces synthetic source metadata from legacy records", () => {
    // A finding whose shared form was adapted from a legacy stable-knowledge
    // record carries no source metadata; prove none leaks even if someone
    // tampered fields directly onto the object.
    const tampered = {
      ...guidance,
      // These would have come from the old synthetic topic-pack record.
      sources: [
        {
          sourceId: "x",
          title: "Spark Estate stable knowledge",
          url: undefined,
          publisher: "Spark Estate",
          publicationDate: null,
          retrievalDate: "2026-07-27",
        },
      ],
    } as unknown as SharedResearchFinding;
    render([tampered]);
    // The synthetic source TITLE and the source list never render. (The honest
    // provenance copy does name "Spark Estate's built-in knowledge" — that is
    // the label, not a citation, so we assert on the synthetic title instead.)
    expect(container.textContent).not.toContain("Spark Estate stable knowledge");
    expect(q('[data-testid="research-source-list"]')).toBeNull();
    expect(q('[data-testid="research-library-sources"]')).toBeNull();
  });

  it("renders genuine live sources through the shared source presentation (future-ready)", () => {
    const live = makeFinding({
      id: "s1",
      title: "2026 small-business lending report",
      content: "Approval rates rose 4 points.",
      kind: "fact",
      evidenceBasis: "live_source",
      sources: [
        {
          sourceId: "src-1",
          title: "Federal Reserve — Small Business Credit Survey",
          url: "https://example.gov/report",
          publisher: "Federal Reserve",
          publicationDate: "2026-05-01",
          retrievalDate: "2026-07-27T00:00:00Z",
        },
      ],
      confidence: "high",
      freshness: "current",
      verificationStatus: "verified",
    });
    render([live, guidance]);
    // Genuine sources get a real "Sources" heading and the shared source list.
    expect(q('[data-testid="research-library-sources"]')).not.toBeNull();
    expect(q('[data-testid="research-source-list"]')).not.toBeNull();
    // Guidance still lives under its own honest heading alongside.
    expect(q('[data-testid="research-library-guidance"]')).not.toBeNull();
  });

  it("shows nothing when there are no findings", () => {
    render([]);
    expect(q('[data-testid="research-library-sources"]')).toBeNull();
    expect(q('[data-testid="research-library-guidance"]')).toBeNull();
  });
});
