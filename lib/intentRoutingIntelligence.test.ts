import { describe, expect, it } from "vitest";
import {
  detectArtifactRequest,
  intentRoutingHintForChat,
  isExecuteArtifactOverride,
  resolveIntentRouting,
  shouldSuppressRelationshipIntelligenceForRouting,
  shouldSuppressRelationshipLeadForRouting,
  shouldSurfaceRoutingOfferUi,
} from "./intentRoutingIntelligence";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";

describe("intentRoutingIntelligence", () => {
  it("routes SOP build requests to Create with permission-first navigation", () => {
    const decision = resolveIntentRouting({
      userText: "Help me create an SOP.",
    });
    expect(decision.category).toBe("build");
    expect(decision.routeMode).toBe("feature_offer");
    expect(decision.artifactDetected).toBe(true);
    expect(decision.artifactKind).toBe("sop");
    expect(decision.workspaceOffer?.section).toBe("content-generator");
    expect(decision.workspaceOffer?.buttonLabel).toBe("Open Create");
    expect(decision.surfaceOfferUi).toBe(true);
    expect(decision.navigationLine).toMatch(/Create/i);
    expect(decision.navigationLine).toMatch(/Create is the right place/i);
    expect(decision.suppressRelationshipIntelligence).toBe(true);
    expect(decision.suppressRelationshipLead).toBe(true);
    expect(decision.continuity?.projectType).toBe("SOP");
  });

  it("routes spinning brain to Clear My Mind", () => {
    const decision = resolveIntentRouting({
      userText: "My brain is spinning.",
    });
    expect(decision.category).toBe("organize");
    expect(decision.overwhelmTodayRoute).toBe("brain_dump_primary");
    expect(decision.featureLabel).toBe("Clear My Mind");
    expect(decision.surfaceOfferUi).toBe(true);
    expect(decision.navigationLine).toMatch(/Clear My Mind/i);
    expect(decision.suppressRelationshipLead).toBe(true);
  });

  it("routes decide requests toward Decision Compass", () => {
    const decision = resolveIntentRouting({
      userText: "Help me decide between these two offers.",
    });
    expect(decision.category).toBe("decide");
    expect(decision.decisionCompassRecommended).toBe(true);
    expect(decision.navigationLine).toMatch(/Decision Compass/i);
    expect(decision.suppressRelationshipLead).toBe(true);
  });

  it("keeps pattern questions in conversation with relationship intelligence", () => {
    const decision = resolveIntentRouting({
      userText: "What patterns have you noticed about me?",
    });
    expect(decision.category).toBe("understand");
    expect(decision.routeMode).toBe("conversation");
    expect(decision.workspaceOffer).toBeNull();
    expect(decision.suppressRelationshipLead).toBe(false);
  });

  it("routes marketing plan build requests without default reflection", () => {
    const decision = resolveIntentRouting({
      userText: "Help me create a marketing plan.",
    });
    expect(decision.category).toBe("build");
    expect(decision.suppressReflectionFirst).toBe(true);
    expect(decision.workspaceOffer).toBeTruthy();
  });

  it("routes strength questions to understand mode", () => {
    const decision = resolveIntentRouting({
      userText: "What is my biggest strength?",
    });
    expect(decision.category).toBe("understand");
    expect(decision.goal.tags).toEqual(expect.arrayContaining(["strengths", "identity"]));
    expect(decision.suppressRelationshipLead).toBe(false);
  });

  it("clarifies vague help requests", () => {
    const decision = resolveIntentRouting({ userText: "Help me." });
    expect(decision.category).toBe("clarify");
    expect(decision.routeMode).toBe("clarify");
    expect(decision.surfaceClarificationUi).toBe(true);
    expect(decision.clarifyPrompt).toMatch(/glad you said/i);
    expect(decision.clarifyPrompt).toMatch(/decide|make|talk through/i);
  });

  it("keeps feature fit available for softer artifact phrasing with execute override", () => {
    const decision = resolveIntentRouting({
      userText: "I need a marketing plan for my launch.",
    });
    expect(decision.category).toBe("execute");
    expect(decision.artifactKind).toBe("marketing_plan");
    expect(decision.workspaceOffer?.section).toBe("content-generator");
    expect(decision.suppressRelationshipIntelligence).toBe(true);
    expect(decision.surfaceOfferUi).toBe(true);
    const hint = intentRoutingHintForChat(decision);
    expect(hint).toMatch(/EXECUTE OVERRIDE/i);
  });

  it("does not surface Adapt My Day UI on implicit low-energy plan shifts", () => {
    const decision = resolveIntentRouting({
      userText: "Today changed and my energy is low.",
      energyLevel: "low",
    });
    expect(decision.adaptMyDayRecommended).toBe(true);
    expect(decision.workspaceOffer?.section).toBe("energy");
    expect(decision.surfaceOfferUi).toBe(false);
  });

  it("surfaces offer UI for explicit open requests", () => {
    expect(
      shouldSurfaceRoutingOfferUi(
        "Open Decision Compass for this.",
        "decide",
        { section: "decision-compass", buttonLabel: "Open", line: "Open?" },
      ),
    ).toBe(true);
  });

  it("recommends Adapt My Day for low-energy plan shifts", () => {
    const decision = resolveIntentRouting({
      userText: "Today changed and my energy is low.",
      energyLevel: "low",
    });
    expect(decision.category).toBe("plan");
    expect(decision.adaptMyDayRecommended).toBe(true);
  });

  it("emits routing hint for feature offers", () => {
    const decision = resolveIntentRouting({
      userText: "Help me create an SOP.",
    });
    const hint = intentRoutingHintForChat(decision);
    expect(hint).toMatch(/INTENT ROUTING INTELLIGENCE/i);
    expect(hint).toMatch(/Do NOT lead with relationship reflection/i);
    expect(hint).toMatch(/Permission-first navigation/i);
  });

  it("uses support style guidance for direct build routes", () => {
    const decision = resolveIntentRouting({
      userText: "Help me create an SOP.",
      supportStyle: "solutions",
    });
    expect(decision.supportStyle).toBe("direct");
    expect(decision.supportStyleGuidance).toMatch(/Prioritize action/i);
    expect(shouldSuppressRelationshipLeadForRouting(decision)).toBe(true);
  });

  describe("P0.7.2 overwhelm + today routing", () => {
    it("routes overwhelmed today start to Plan My Day with Adapt My Day secondary", () => {
      const decision = resolveIntentRouting({
        userText: "I'm overwhelmed and not sure where to start today.",
        emotionalState: "overwhelmed",
        overwhelmed: true,
      });
      expect(decision.category).toBe("plan");
      expect(decision.overwhelmTodayRoute).toBe("plan_primary");
      expect(decision.featureMatch).toBe("plan-my-day");
      expect(decision.secondaryFeatureMatch).toBe("energy");
      expect(decision.workspaceOffer?.section).toBe("plan-my-day");
      expect(decision.secondaryWorkspaceOffer?.section).toBe("energy");
      expect(decision.surfaceOfferUi).toBe(true);
      expect(decision.suppressRelationshipLead).toBe(true);
      expect(decision.suppressConversationSummary).toBe(true);
      expect(decision.suppressReflectionFirst).toBe(true);
      expect(decision.goal.tags).toEqual(
        expect.arrayContaining([
          "planning",
          "focus",
          "overwhelm_support",
          "time_management",
        ]),
      );
      const hint = intentRoutingHintForChat(decision);
      expect(hint).toMatch(/where to start today/i);
      expect(hint).toMatch(/Do NOT recap/i);
    });

    it("routes don't know what to work on first today to Plan My Day", () => {
      const decision = resolveIntentRouting({
        userText: "I don't know what to work on first today.",
      });
      expect(decision.category).toBe("plan");
      expect(decision.featureMatch).toBe("plan-my-day");
      expect(decision.surfaceOfferUi).toBe(true);
      expect(decision.navigationLine).toMatch(/Plan My Day/i);
    });

    it("routes today adjust requests to Adapt My Day primary", () => {
      const decision = resolveIntentRouting({
        userText: "Today changed and I need help adjusting.",
      });
      expect(decision.category).toBe("plan");
      expect(decision.overwhelmTodayRoute).toBe("adapt_primary");
      expect(decision.featureMatch).toBe("energy");
      expect(decision.secondaryFeatureMatch).toBe("plan-my-day");
      expect(decision.surfaceOfferUi).toBe(true);
      expect(decision.suppressConversationSummary).toBe(true);
    });

    it("routes brain dump overwhelm to Clear My Mind primary", () => {
      const decision = resolveIntentRouting({
        userText: "My brain is spinning and I need to dump everything.",
      });
      expect(decision.category).toBe("organize");
      expect(decision.overwhelmTodayRoute).toBe("brain_dump_primary");
      expect(decision.featureMatch).toBe("brain-dump");
      expect(decision.secondaryFeatureMatch).toBe("plan-my-day");
      expect(decision.surfaceOfferUi).toBe(true);
    });

    it("keeps why-overwhelm questions in understand mode without feature offer", () => {
      const decision = resolveIntentRouting({
        userText: "Why do I get overwhelmed?",
      });
      expect(decision.category).toBe("understand");
      expect(decision.overwhelmTodayRoute).toBeNull();
      expect(decision.workspaceOffer).toBeNull();
      expect(decision.suppressRelationshipLead).toBe(false);
      expect(decision.suppressConversationSummary).toBe(false);
    });
  });

  describe("P0.7.3 execute artifact override", () => {
    const executeCases = [
      "i need to write an email",
      "help me create an SOP",
      "write a marketing plan",
      "i need a proposal",
    ] as const;

    it.each(executeCases)("routes %s to Create with relationship suppressed", (userText) => {
      const decision = resolveIntentRouting({ userText });
      expect(detectArtifactRequest(userText)).toBeTruthy();
      expect(decision.artifactDetected).toBe(true);
      expect(["build", "execute"]).toContain(decision.category);
      expect(decision.workspaceOffer?.section).toBe("content-generator");
      expect(decision.suppressRelationshipIntelligence).toBe(true);
      expect(decision.suppressReflectionFirst).toBe(true);
      expect(shouldSuppressRelationshipIntelligenceForRouting(decision)).toBe(true);
      expect(isExecuteArtifactOverride(decision)).toBe(true);
      const hint = intentRoutingHintForChat(decision);
      expect(hint).toMatch(/EXECUTE OVERRIDE/i);
      expect(hint).toMatch(/FORBIDDEN: I've noticed/i);
    });

    it.each(executeCases)("skips relationship lead paragraph when execute override is active", (userText) => {
      const decision = resolveIntentRouting({ userText });
      expect(shouldSuppressRelationshipIntelligenceForRouting(decision)).toBe(true);
      expect(
        buildRelationshipLeadParagraph(userText, new Date(), {
          suppressForRouting: shouldSuppressRelationshipIntelligenceForRouting(decision),
        }),
      ).toBeNull();
    });

    it("surfaces Create offer UI for direct email execute requests", () => {
      const decision = resolveIntentRouting({ userText: "i need to write an email" });
      expect(decision.category).toBe("execute");
      expect(decision.routeMode).toBe("feature_offer");
      expect(decision.surfaceOfferUi).toBe(true);
      expect(decision.navigationLine).toMatch(/On it — Create/i);
      expect(decision.navigationLine).toMatch(/Create/i);
    });

    const funnelAndSequenceTerms = [
      "sales funnel",
      "marketing funnel",
      "lead funnel",
      "lead generation funnel",
      "email funnel",
      "webinar funnel",
      "workshop funnel",
      "launch funnel",
      "course funnel",
      "membership funnel",
      "customer journey",
      "automation funnel",
      "follow-up sequence",
      "nurture sequence",
      "sales sequence",
    ] as const;

    it.each(funnelAndSequenceTerms)(
      "detects %s as artifact when user wants to build it",
      (term) => {
        const userText = `help me build my ${term}`;
        expect(detectArtifactRequest(userText)).toBeTruthy();
        const decision = resolveIntentRouting({ userText });
        expect(decision.artifactDetected).toBe(true);
        expect(decision.workspaceOffer?.section).toBe("content-generator");
        expect(decision.suppressRelationshipIntelligence).toBe(true);
      },
    );
  });

  describe("P0.9.1 artifact registry — sales funnel routing", () => {
    const executeCases = [
      {
        userText: "I need to create a sales funnel",
        artifactKind: "funnel",
        navigation: /map out the funnel|Create/i,
      },
      {
        userText: "Build a lead magnet funnel",
        artifactKind: "funnel",
        navigation: /Create|funnel/i,
      },
      {
        userText: "Create a nurture sequence",
        artifactKind: "email_sequence",
        navigation: /Create|email sequence/i,
      },
      {
        userText: "Write a sales sequence",
        artifactKind: "email_sequence",
        navigation: /Create|email sequence/i,
      },
      {
        userText: "Design a landing page",
        artifactKind: "landing_page",
        navigation: /Create|landing page/i,
      },
    ] as const;

    it.each(executeCases)(
      "routes $userText to Create with relationship suppressed",
      ({ userText, artifactKind, navigation }) => {
        const decision = resolveIntentRouting({ userText });
        expect(decision.artifactDetected).toBe(true);
        expect(decision.artifactKind).toBe(artifactKind);
        expect(["build", "execute"]).toContain(decision.category);
        expect(decision.routeMode).toBe("feature_offer");
        expect(decision.workspaceOffer?.section).toBe("content-generator");
        expect(decision.suppressRelationshipIntelligence).toBe(true);
        expect(decision.suppressRelationshipLead).toBe(true);
        expect(decision.suppressReflectionFirst).toBe(true);
        expect(decision.navigationLine).toMatch(navigation);
        expect(
          buildRelationshipLeadParagraph(userText, new Date(), {
            suppressForRouting: shouldSuppressRelationshipIntelligenceForRouting(decision),
          }),
        ).toBeNull();
        const hint = intentRoutingHintForChat(decision);
        expect(hint).toMatch(/EXECUTE OVERRIDE|FORBIDDEN: I've noticed/i);
      },
    );

    it("routes knowledge questions on learn fast path with relationship suppressed", () => {
      const decision = resolveIntentRouting({
        userText: "What is a sales funnel?",
      });
      expect(decision.category).toBe("learn");
      expect(decision.learnFastPath).toBe(true);
      expect(decision.artifactDetected).toBe(true);
      expect(decision.suppressRelationshipIntelligence).toBe(true);
      expect(decision.suppressRelationshipLead).toBe(true);
      expect(decision.suppressWisdomIntelligence).toBe(true);
    });
  });
});
