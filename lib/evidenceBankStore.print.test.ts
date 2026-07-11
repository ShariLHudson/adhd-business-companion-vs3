import { describe, expect, it } from "vitest";
import { buildEvidenceDiscoveryPrintHtml } from "@/lib/evidenceBankStore";
import type { EvidenceEntry } from "@/lib/evidenceBankStore";

const sampleEntry: EvidenceEntry = {
  id: "ev-test",
  category: "Personal Growth",
  whatHappened: "I helped a client feel seen today.",
  whatImproved: "",
  whatMovedForward: "",
  whatProblemSolved: "Scheduling conflict",
  whoBenefited: "A longtime client",
  whyItMattered: "",
  whatThisProves: "Small moments matter.",
  attachments: [{ id: "a1", name: "thank-you.png", kind: "image", url: "#" }],
  createdAt: "2026-07-09T12:00:00.000Z",
  updatedAt: "2026-07-09T12:00:00.000Z",
};

describe("buildEvidenceDiscoveryPrintHtml", () => {
  it("includes Spark Estate branding and discovery sections", () => {
    const html = buildEvidenceDiscoveryPrintHtml(sampleEntry);
    expect(html).toContain("Spark Estate");
    expect(html).toContain("Evidence Vault");
    expect(html).toContain("Today's Discovery");
    expect(html).toContain("I helped a client feel seen today.");
    expect(html).toContain("Problem Solved");
    expect(html).toContain("user-select: none");
  });
});
