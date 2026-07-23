/**
 * Complete Spark Estate Executive Intelligence Brief detail shape.
 * Optional on FireExecutivePortfolio — backwards compatible with legacy daily records.
 */

export type FireBriefSectionId =
  | "executive_summary"
  | "ai_technology"
  | "adhd_community"
  | "business_market"
  | "competitors_partnerships"
  | "weak_signals"
  | "founder_alerts"
  | "product_platform"
  | "implementation_plans"
  | "marketing"
  | "business_growth"
  | "member_impact"
  | "development"
  | "izna_work_package"
  | "founder_action_plan"
  | "executive_conclusion";

export type FireBriefSectionColor =
  | "deep-teal"
  | "aqua"
  | "lavender"
  | "navy"
  | "bronze"
  | "blue-gray"
  | "muted-coral"
  | "gold"
  | "blue-green"
  | "plum"
  | "forest"
  | "warm-rose"
  | "slate-blue"
  | "warm-amber"
  | "deep-teal-gold"
  | "charcoal-gold";

export type FireBriefUrgency = "action" | "watch" | "info";

/** Labeled intelligence item — only render fields that exist. */
export type FireIntelligenceItem = {
  id: string;
  title?: string;
  whatHappened?: string;
  whyItMatters?: string;
  memberImpact?: string;
  recommendation?: string;
  implementationDirection?: string;
  owner?: string;
  timing?: string;
  evidenceOrConfidence?: string;
};

export type FireAlertLevel =
  | "needs_attention_today"
  | "watch_closely"
  | "worth_knowing";

export type FireDetailedAlert = {
  id: string;
  level: FireAlertLevel;
  issue: string;
  impact: string;
  recommendation: string;
  decisionNeeded: boolean;
  suggestedTiming: string;
};

export type FireIznaAssignment = {
  id: string;
  title: string;
  businessContext: string;
  whyItMatters: string;
  steps: readonly string[];
  expectedDeliverables: readonly string[];
  definitionOfDone: string;
  priority: string;
  timing: string;
  returnToFounder: string;
  questionsOrDependencies?: string;
};

export type FireActionHorizon = "today" | "this_week" | "watch";

export type FireActionPlanItem = {
  id: string;
  horizon: FireActionHorizon;
  title: string;
  reason: string;
  estimatedEffort?: string;
  nextStep: string;
  suggestedOwner?: string;
  relatedSectionId?: FireBriefSectionId;
};

export type FireBriefSection = {
  id: FireBriefSectionId;
  title: string;
  synopsis: string;
  color: FireBriefSectionColor;
  icon: string;
  urgency?: FireBriefUrgency;
  itemCount: number;
  items: readonly FireIntelligenceItem[];
  alerts?: readonly FireDetailedAlert[];
  iznaAssignments?: readonly FireIznaAssignment[];
  actionPlan?: readonly FireActionPlanItem[];
};

export type FireExecutiveOverview = {
  topDevelopments: readonly string[];
  alertsRequiringAttention: readonly FireDetailedAlert[];
  /** Single top founder priority for the morning opening */
  topPriority: string | null;
  /** Highest-value opportunity line */
  highestOpportunity: string | null;
  /** Most important product or development recommendation */
  productOrDevelopmentRecommendation: string | null;
  topActions: readonly FireActionPlanItem[];
  iznaPriorityAssignment: string | null;
  /** Present only when a prior local report was available for comparison */
  changedSinceYesterday: readonly string[];
  /** Honest note when no prior report exists to compare */
  comparisonNote: string | null;
};

export type FireExecutiveBriefDetail = {
  /** Full report title line without date */
  reportName: string;
  /** Full current date display */
  fullDateDisplay: string;
  /** When this report was prepared (ISO), if known */
  preparedAt: string | null;
  /** Member-facing prepared-at label */
  preparedAtDisplay: string | null;
  overview: FireExecutiveOverview;
  sections: readonly FireBriefSection[];
  /** Honest provenance for bridged/sample content (internal) */
  contentProvenance: "bridged_adapters" | "stored_detail" | "live_company";
  /** Gentle member-facing provenance — no technical adapter language */
  memberFacingProvenance: string | null;
};

export const FIRE_BRIEF_SECTION_ORDER: readonly FireBriefSectionId[] = [
  "executive_summary",
  "ai_technology",
  "adhd_community",
  "business_market",
  "competitors_partnerships",
  "weak_signals",
  "founder_alerts",
  "product_platform",
  "implementation_plans",
  "marketing",
  "business_growth",
  "member_impact",
  "development",
  "izna_work_package",
  "founder_action_plan",
  "executive_conclusion",
] as const;

export const FIRE_BRIEF_SECTION_META: Record<
  FireBriefSectionId,
  { title: string; color: FireBriefSectionColor; icon: string }
> = {
  executive_summary: {
    title: "Executive Summary",
    color: "deep-teal",
    icon: "◆",
  },
  ai_technology: {
    title: "AI and Technology Intelligence",
    color: "aqua",
    icon: "◇",
  },
  adhd_community: {
    title: "ADHD Entrepreneur Community Intelligence",
    color: "lavender",
    icon: "◎",
  },
  business_market: {
    title: "Business, Startup and Market Intelligence",
    color: "navy",
    icon: "▣",
  },
  competitors_partnerships: {
    title: "Competitor and Partnership Intelligence",
    color: "bronze",
    icon: "⬡",
  },
  weak_signals: {
    title: "Weak Signals",
    color: "blue-gray",
    icon: "◌",
  },
  founder_alerts: {
    title: "Founder Alerts",
    color: "muted-coral",
    icon: "!",
  },
  product_platform: {
    title: "Product and Platform Recommendations",
    color: "gold",
    icon: "★",
  },
  implementation_plans: {
    title: "Implementation Plans",
    color: "blue-green",
    icon: "▸",
  },
  marketing: {
    title: "Marketing Recommendations",
    color: "plum",
    icon: "◈",
  },
  business_growth: {
    title: "Business Growth Recommendations",
    color: "forest",
    icon: "▲",
  },
  member_impact: {
    title: "Member Impact",
    color: "warm-rose",
    icon: "♥",
  },
  development: {
    title: "Development Recommendations",
    color: "slate-blue",
    icon: "⚙",
  },
  izna_work_package: {
    title: "Izna Daily Work Package",
    color: "warm-amber",
    icon: "✎",
  },
  founder_action_plan: {
    title: "Prioritized Founder Action Plan",
    color: "deep-teal-gold",
    icon: "✓",
  },
  executive_conclusion: {
    title: "Executive Conclusion",
    color: "charcoal-gold",
    icon: "◈",
  },
};
