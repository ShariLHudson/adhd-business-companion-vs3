/**
 * Constitutional annotations for Companion Brain™ services.
 * For future developers — not user-facing.
 *
 * Entry: Screen Certification™ gates (see docs/SCREEN_CERTIFICATION.md).
 * Ongoing: Stewardship Review™ (see docs/PRODUCT_CONSTITUTION.md#the-stewardship-review).
 */

export type ConstitutionalPrinciple =
  | "Constitution-Three-Laws"
  | "Dual-Mandate"
  | "Stewardship-Oath"
  | "Stewardship-Review"
  | "Decision-Filter"
  | "Cognitive-Audit"
  | "Relevance-Safeguard"
  | "Human-Reality-Test"
  | "Relationship-Protection";

export type ServiceConstitution = {
  service: string;
  purpose: string;
  principles: ConstitutionalPrinciple[];
};

export const COMPANION_BRAIN_SERVICES: ServiceConstitution[] = [
  {
    service: "assembleContext",
    purpose:
      "Unify memory into one reasoning snapshot without mutating user data.",
    principles: [
      "Relevance-Safeguard",
      "Stewardship-Oath",
      "Constitution-Three-Laws",
    ],
  },
  {
    service: "resolveDayMode",
    purpose:
      "Set the emotional and cognitive frame before any proposals appear.",
    principles: ["Human-Reality-Test", "Relationship-Protection", "Dual-Mandate"],
  },
  {
    service: "resolveCycleState",
    purpose: "Protect flow and dignity — never replan when harm would follow.",
    principles: [
      "Constitution-Three-Laws",
      "Relationship-Protection",
      "Stewardship-Oath",
    ],
  },
  {
    service: "generateMomentumAction",
    purpose:
      "Reduce decision fatigue while creating future momentum — not urgency.",
    principles: ["Decision-Filter", "Dual-Mandate", "Human-Reality-Test"],
  },
  {
    service: "selectConfidenceOpportunity",
    purpose: "Increase self-trust through evidence — never empty praise.",
    principles: ["Stewardship-Oath", "Dual-Mandate", "Relevance-Safeguard"],
  },
  {
    service: "evaluatePermission",
    purpose:
      "Carry cognitive load by deciding what does not belong — permission as relief.",
    principles: [
      "Stewardship-Oath",
      "Decision-Filter",
      "Human-Reality-Test",
    ],
  },
  {
    service: "generateProposals",
    purpose:
      "Prepare options for human judgment — never auto-commit obligations.",
    principles: ["Constitution-Three-Laws", "Decision-Filter", "Dual-Mandate"],
  },
  {
    service: "buildOrientation",
    purpose:
      "Help the user know where they are before what they must do.",
    principles: [
      "Dual-Mandate",
      "Relationship-Protection",
      "Relevance-Safeguard",
    ],
  },
  {
    service: "generateMorningPresence",
    purpose:
      "Help the user feel seen before planning — witnessing, not coaching.",
    principles: [
      "Human-Reality-Test",
      "Relationship-Protection",
      "Dual-Mandate",
      "Stewardship-Oath",
    ],
  },
  {
    service: "classifyLifeArea",
    purpose:
      "Understand where work belongs in the user's life — reduce manual organization.",
    principles: [
      "Stewardship-Oath",
      "Dual-Mandate",
      "Human-Reality-Test",
      "Relevance-Safeguard",
    ],
  },
  {
    service: "runCognitiveAudit",
    purpose: "Gate output against the Constitution before any page renders it.",
    principles: [
      "Cognitive-Audit",
      "Constitution-Three-Laws",
      "Decision-Filter",
    ],
  },
  {
    service: "generateCompanionJudgment",
    purpose: "Compose all judgment services into one coherent reasoning result.",
    principles: ["Cognitive-Audit", "Stewardship-Oath", "Dual-Mandate"],
  },
  {
    service: "applyRelationshipProtection",
    purpose: "Suppress intrusion, repetition, and dependency patterns.",
    principles: [
      "Relationship-Protection",
      "Constitution-Three-Laws",
      "Stewardship-Oath",
    ],
  },
  {
    service: "performReflection",
    purpose: "Interpret the day — memory stores, reflection understands.",
    principles: [
      "Stewardship-Oath",
      "Dual-Mandate",
      "Relevance-Safeguard",
    ],
  },
  {
    service: "updateCompanionBrain",
    purpose:
      "Improve judgment weights only — never override user goals or agency.",
    principles: [
      "Constitution-Three-Laws",
      "Cognitive-Audit",
      "Stewardship-Oath",
    ],
  },
  {
    service: "emitLearningSignals",
    purpose: "Feed the Living Intelligence Graph™ without user dashboards.",
    principles: ["Relevance-Safeguard", "Dual-Mandate"],
  },
  {
    service: "reEvaluateLiveJudgment",
    purpose:
      "Re-run judgment when reality changes — morning plan is a starting point, never a commitment.",
    principles: [
      "Human-Reality-Test",
      "Stewardship-Oath",
      "Constitution-Three-Laws",
    ],
  },
  {
    service: "publishRealitySignal",
    purpose:
      "Today's Reality™ and future signals feed one brain — no manual synchronization.",
    principles: [
      "Relevance-Safeguard",
      "Relationship-Protection",
      "Dual-Mandate",
    ],
  },
];
