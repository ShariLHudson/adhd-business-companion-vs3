import { describe, expect, it } from "vitest";
import {
  classifyCompanionIntentBucket,
  isInformationIntent,
} from "./companionIntentRouting";
import { resolveCompanionIntelligence } from "./companionConstitution/companionIntelligence/resolveCompanionIntelligence";
import { resolveConversationIntelligence } from "./companionConstitution/conversationIntelligence/resolveConversation";
import {
  extractResearchTopic,
  FORBIDDEN_RESEARCH_DISCLAIMERS,
  isResearchIntelligenceRequest,
  isTimelessKnowledgeNotResearch,
  RESEARCH_CONNECTIVITY_FAILURE_MESSAGE,
  researchIntelligenceHintForChat,
} from "./researchIntelligence";

describe("researchIntelligence", () => {
  const activateCases = [
    "What are the latest Pinterest trends?",
    "What are the newest ADHD studies?",
    "Compare these companies for pricing and positioning",
    "What is the current pricing for Notion?",
    "Give me market research on ADHD coaching apps",
    "What does research say about women with ADHD and perfectionism?",
    "Any recent updates on GDPR for email marketing?",
    "What are people saying in reviews of Calendly?",
    "Best AI tools for content creation right now",
    "Local businesses near me that do ADHD coaching",
    "Travel information for Lisbon in October",
    "What are the statistics on ADHD entrepreneurs?",
    "What's trending on TikTok for coaches?",
    "Look up the latest news on OpenAI",
  ] as const;

  it.each(activateCases)("activates for %s", (text) => {
    expect(isResearchIntelligenceRequest(text)).toBe(true);
    expect(classifyCompanionIntentBucket(text)).toBe("research");
    expect(isInformationIntent(text)).toBe(true);
    const hint = researchIntelligenceHintForChat(text);
    expect(hint).toContain("RESEARCH INTELLIGENCE");
    expect(hint).toContain("FORBIDDEN");
    expect(hint).not.toContain("search the web yourself");
  });

  const timelessCases = [
    "What is a sales funnel?",
    "How do sales funnels work?",
    "Explain ADHD paralysis",
  ] as const;

  it.each(timelessCases)("does not activate for timeless knowledge %s", (text) => {
    expect(isResearchIntelligenceRequest(text)).toBe(false);
    expect(isTimelessKnowledgeNotResearch(text)).toBe(true);
  });

  it("extracts research topic when present", () => {
    expect(extractResearchTopic("What are the latest Pinterest trends?")).toMatch(
      /pinterest/i,
    );
    expect(
      extractResearchTopic("Compare these companies for pricing"),
    ).toMatch(/companies/i);
  });

  it("lists constitutional forbidden disclaimers", () => {
    expect(FORBIDDEN_RESEARCH_DISCLAIMERS.length).toBeGreaterThanOrEqual(5);
    expect(FORBIDDEN_RESEARCH_DISCLAIMERS.join(" ")).toMatch(/can't browse/i);
  });

  it("defines natural connectivity failure language", () => {
    expect(RESEARCH_CONNECTIVITY_FAILURE_MESSAGE).toMatch(
      /trouble reaching current online sources/i,
    );
    expect(RESEARCH_CONNECTIVITY_FAILURE_MESSAGE).not.toMatch(/API|model|provider/i);
  });

  it("orchestrates research-intelligence through Companion Intelligence", () => {
    const conversation = resolveConversationIntelligence({
      activeSection: "home",
      userText: "What are the latest Pinterest trends?",
    });
    const orchestration = resolveCompanionIntelligence({
      conversation,
      userText: "What are the latest Pinterest trends?",
    });
    expect(orchestration.activeIntelligences).toContain("research-intelligence");
  });
});
