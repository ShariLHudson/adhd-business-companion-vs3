import { describe, expect, it } from "vitest";
import { certifyConversationDelivery } from "./certifyConversationDelivery";
import {
  buildAdvisorySafeFallback,
  evaluateChamberSharedResponsePolicy,
} from "./responsePolicy";
import {
  containsChamberReflectiveBan,
  containsPermanentBanPhrase,
  scrubCertifiedAiLanguage,
} from "./scrubAiLanguage";

const LAUNCH_QUESTION =
  "Should I launch everything at once or release features over time?";

const MARKETING_DRAFT = [
  "I'd release features over time rather than everything at once.",
  "A phased launch keeps your message clear, lets you learn from real buyers,",
  "and protects attention — all-at-once usually muddies positioning and burns the audience.",
  "Start with the one offer or feature that proves demand, then expand.",
  "What's the first piece you most need people to understand?",
].join(" ");

describe("Chamber Certified Conversation Pipeline", () => {
  it("certifies Marketing launch advice without becoming reflective coaching", () => {
    const result = certifyConversationDelivery({
      experienceId: "chamber",
      behaviorMode: "advisory",
      conversationId: "chamber:marketing:test",
      userText: LAUNCH_QUESTION,
      draftText: MARKETING_DRAFT,
      messages: [{ role: "user", content: LAUNCH_QUESTION }],
      specialistId: "marketing",
      specialistLabel: "Marketing Intelligence",
    });

    expect(result.text.length).toBeGreaterThan(80);
    expect(result.text.toLowerCase()).toMatch(
      /phase|over time|not everything|gradually|all at once|feature/,
    );
    expect(result.text).not.toMatch(/quieter question underneath/i);
    expect(result.text).not.toMatch(/what feels unfinished/i);
    expect(result.text).not.toMatch(/which platform matters most/i);
    expect(result.text).not.toMatch(/as an ai/i);
    expect((result.text.match(/\?/g) ?? []).length).toBeLessThanOrEqual(1);
    expect(result.topicAnchor.primaryTopic).toBeTruthy();
    expect(result.policy.passed).toBe(true);
    expect(result.policy.answeredDirectly).toBe(true);
  });

  it("shared response policy fails reflective-only Chamber replies", () => {
    const policy = evaluateChamberSharedResponsePolicy({
      userText: LAUNCH_QUESTION,
      responseText: "What feels unfinished about this launch for you?",
      behaviorMode: "advisory",
    });
    expect(policy.passed).toBe(false);
    expect(policy.failures).toContain("REFLECTIVE_COACHING_PATTERN");
  });

  it("advisory fallback answers the launch trade-off", () => {
    const fallback = buildAdvisorySafeFallback({
      userText: LAUNCH_QUESTION,
      topicAnchor: "product launch pacing",
      specialistLabel: "Marketing Intelligence",
    });
    expect(fallback).toMatch(/phase/i);
    expect(fallback).toMatch(/all at once|everything at once/i);
    expect((fallback.match(/\?/g) ?? []).length).toBeLessThanOrEqual(1);
  });

  it("scrubs AI tells without stripping recommendations", () => {
    const scrubbed = scrubCertifiedAiLanguage(
      "Great question! I'd recommend a phased release rather than launching everything at once.",
    );
    expect(scrubbed).not.toMatch(/great question/i);
    expect(scrubbed).toMatch(/phased release|recommend/i);
    expect(containsPermanentBanPhrase("Take your time with that.")).toBe(true);
    expect(containsChamberReflectiveBan("What feels unfinished here?")).toBe(
      true,
    );
  });

  it("wires Chamber experience as CIE/HCV certified", async () => {
    const { EXPERIENCE_WIRING } = await import(
      "@/lib/conversationArchitecture/experienceWiring"
    );
    const chamber = EXPERIENCE_WIRING.find((e) => e.experienceId === "chamber");
    expect(chamber?.status).toBe("wired_cie_hcv");
    expect(chamber?.entryModule).toContain("certifyConversationDelivery");
  });
});
