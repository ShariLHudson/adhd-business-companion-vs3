/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ResearchFindingCard } from "./ResearchFindingCard";
import {
  makeFinding,
  type ResearchSourceCitation,
  type SharedResearchFinding,
} from "@/lib/research/types";

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

function render(finding: SharedResearchFinding) {
  act(() => {
    root.render(<ResearchFindingCard finding={finding} />);
  });
}

const realSource: ResearchSourceCitation = {
  title: "Statista — SMB spend 2026",
  url: "https://example.com/report",
  publisher: "Statista",
  retrievalDate: "2026-07-27T00:00:00.000Z",
  publicationDate: "2026-06-01",
};

const q = (sel: string) => container.querySelector(sel);

describe("ResearchFindingCard citation gating", () => {
  it("renders source cards for a genuine live_source finding, collapsed by default", () => {
    render(
      makeFinding({
        id: "f1",
        title: "SMB software spend is rising",
        content: "…",
        kind: "fact",
        evidenceBasis: "live_source",
        sources: [realSource],
        confidence: "high",
        freshness: "current",
      }),
    );
    expect(q('[data-testid="research-finding-card"]')?.getAttribute("data-may-cite")).toBe("true");
    expect(q('[data-testid="research-finding-basis"]')?.textContent).toBe("Live Sources");
    expect(q('[data-testid="research-finding-confidence"]')?.textContent).toContain("high");
    // Source list is present but collapsed — the expanded list is not shown yet.
    expect(q('[data-testid="research-source-list"]')).not.toBeNull();
    expect(q('[data-testid="research-sources-expanded"]')).toBeNull();
  });

  it("labels an interpretation finding as Shari's Insights and shows NO source cards", () => {
    // makeFinding strips any sources from a non-source basis.
    const f = makeFinding({
      id: "f2",
      title: "A possible angle",
      content: "…",
      kind: "inference",
      evidenceBasis: "interpretation",
      sources: [realSource],
      confidence: "high",
    });
    render(f);
    expect(q('[data-testid="research-finding-card"]')?.getAttribute("data-may-cite")).toBe("false");
    expect(q('[data-testid="research-finding-basis"]')?.textContent).toBe("Shari's Insights");
    expect(q('[data-testid="research-source-list"]')).toBeNull();
    expect(q('[data-testid="research-finding-confidence"]')).toBeNull();
  });

  it("a TAMPERED finding (interpretation basis with sources injected directly) still shows no citations", () => {
    // Bypass makeFinding entirely to simulate tampering / a bad producer.
    const tampered: SharedResearchFinding = {
      id: "f3",
      title: "Fake-sourced claim",
      content: "…",
      kind: "fact",
      evidenceBasis: "interpretation",
      sources: [realSource],
      confidence: "high",
      freshness: "current",
      verificationStatus: "verified",
    };
    render(tampered);
    expect(q('[data-testid="research-finding-card"]')?.getAttribute("data-may-cite")).toBe("false");
    expect(q('[data-testid="research-source-list"]')).toBeNull();
    expect(q('[data-testid="research-finding-confidence"]')).toBeNull();
  });

  it("built_in_guidance is labeled and never cited", () => {
    render(
      makeFinding({
        id: "f4",
        title: "Built-in checklist",
        content: "…",
        kind: "recommendation",
        evidenceBasis: "built_in_guidance",
      }),
    );
    expect(q('[data-testid="research-finding-basis"]')?.textContent).toBe("Built-in Guidance");
    expect(q('[data-testid="research-source-list"]')).toBeNull();
  });
});
