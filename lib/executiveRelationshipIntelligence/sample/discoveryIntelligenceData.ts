import type {
  ExecutiveDiscovery,
  FounderAlert,
  DiscoveryPrepOffer,
} from "../types";

export const RELATIONSHIP_INTELLIGENCE_PRINCIPLE =
  "Founder creates knowledge — not just connections. Discover what nobody asked.";

export const DEFAULT_PREP: DiscoveryPrepOffer[] = [
  { id: "ri-prep-mission", kind: "mission", label: "Mission update", description: "Align discovery to active mission.", status: "draft" },
  { id: "ri-prep-builder", kind: "executive-builder", label: "Executive Builder", description: "Blueprint from discovery.", status: "draft" },
  { id: "ri-prep-research", kind: "research-brief", label: "Research brief", description: "Close knowledge gap.", status: "draft" },
  { id: "ri-prep-brief", kind: "executive-brief", label: "Executive brief", description: "One-page decision support.", status: "draft" },
  { id: "ri-prep-sim", kind: "simulation", label: "Simulation", description: "Compare paths before acting.", status: "draft" },
  { id: "ri-prep-postcraft", kind: "postcraft-campaign", label: "PostCraft campaign", description: "Content from insight.", status: "draft" },
];

const BOARD_DEFAULT = [
  { id: "ceo", label: "CEO", insight: "", opportunity: "", concern: "" },
  { id: "innovation", label: "Innovation", insight: "", opportunity: "", concern: "" },
  { id: "customer", label: "Customer Experience", insight: "", opportunity: "", concern: "" },
  { id: "adhd", label: "ADHD Perspective", insight: "", opportunity: "", concern: "" },
];

export const SAMPLE_DISCOVERIES: ExecutiveDiscovery[] = [
  {
    id: "disc-seven-conversations",
    category: "hidden-customer-patterns",
    headline: "Seven unrelated conversations describe the same underlying problem",
    nobodyAskedOpener: "I noticed something nobody searched for…",
    summary:
      "Members across Companion, support, and workshop waitlists use different words — but all describe guilt after absence, not confusion about features.",
    whyShariShouldCare: "One restart message could unify Companion, Listening Rooms, and workshop marketing.",
    whyNow: "Workshop launch is weeks away — misaligned copy would waste enrollment.",
    opportunity: "Single 'shame-free return' narrative across ecosystem",
    risk: "Fragmented messaging if each product speaks differently",
    evidence: [
      "node-feedback-restart customer themes",
      "ADHD restart research report",
      "Memory Theater: 'I thought I'd failed' quote",
    ],
    confidence: "high",
    patternType: "emerging-themes",
    remindsMeOf: "This resembles how Listening Rooms began — personal stories before product architecture.",
    relatedNodeIds: ["node-feedback-restart", "node-research-adhd-restart", "node-listening-rooms"],
    relatedMissionIds: ["listening-rooms"],
    relatedProductIds: ["listening-rooms", "companion"],
    boardPerspectives: [
      { id: "ceo", label: "CEO", insight: "One story arc reduces cognitive load for Shari.", opportunity: "Faster workshop conversion", concern: "Over-unifying too early" },
      { id: "customer", label: "Customer Experience", insight: "Members feel seen when language matches their shame.", opportunity: "Testimonials write themselves", concern: "Clinical tone creep" },
      { id: "adhd", label: "ADHD Perspective", insight: "Guilt is the enemy — not missing features.", opportunity: "Permission-first journeys", concern: "Too many steps to register" },
    ],
    boardSummary: {
      mostImportantInsight: "Return guilt is the shared root — not product confusion.",
      strongestOpportunity: "Unified restart narrative before workshop ships.",
      greatestConcern: "Each team speaking different language this month.",
      recommendedAction: "Connect Companion copy, workshop outline, and PostCraft in one brief.",
    },
    ecosystemImpact: [
      { area: "companion", summary: "Return flow copy aligns", direction: "positive" },
      { area: "listening-rooms", summary: "Workshop message sharpens", direction: "positive" },
      { area: "postcraft", summary: "Campaign coherence", direction: "positive" },
      { area: "marketing", summary: "One arc vs five", direction: "positive" },
    ],
    recommendedAction: "connect",
    recommendedActionWhy: "Low effort, high coherence — no new product required.",
    prepOffers: DEFAULT_PREP,
    learningNote: "Track whether unified narrative improves workshop enrollment vs prior launches.",
  },
  {
    id: "disc-butterfly-restart",
    category: "emerging-opportunities",
    headline: "A research paper → workshop → membership chain is forming",
    nobodyAskedOpener: "It appears a complete butterfly chain is emerging…",
    summary:
      "ADHD Restart Research inspired Listening Rooms, which generated customer interest, which points toward workshop then Calm Depth membership.",
    whyShariShouldCare: "You may be one workshop away from a recurring revenue architecture you didn't plan — but the graph already shows the path.",
    whyNow: "Simulation and Memory Theater both validated workshop-first — graph confirms the chain.",
    opportunity: "Calm Depth membership fed by live workshop quotes",
    risk: "Skipping workshop and building tier in isolation",
    evidence: ["replay-workshop-decision", "sim-workshop-vs-membership", "node-research-adhd-restart"],
    confidence: "high",
    patternType: "repeated-success",
    butterflyChain: [
      { id: "bf-1", label: "Research", summary: "ADHD Restart Rituals Research", nodeId: "node-research-adhd-restart" },
      { id: "bf-2", label: "Product idea", summary: "Listening Rooms estate re-entry", nodeId: "node-listening-rooms" },
      { id: "bf-3", label: "Customer interest", summary: "Gentle Return feedback surge", nodeId: "node-feedback-restart" },
      { id: "bf-4", label: "Workshop", summary: "Shame-Free Restart workshop", nodeId: "node-workshop-fatigue" },
      { id: "bf-5", label: "Membership", summary: "Calm Depth tier (planned)" },
      { id: "bf-6", label: "Revenue", summary: "Workshop cash + ARR path" },
    ],
    relatedNodeIds: ["node-research-adhd-restart", "node-listening-rooms", "node-workshop-fatigue"],
    relatedMissionIds: ["listening-rooms"],
    relatedProductIds: ["listening-rooms"],
    boardPerspectives: [
      { id: "innovation", label: "Innovation", insight: "Chain is visible before tier exists.", opportunity: "Design tier from quotes not guesses", concern: "Rushing tier before workshop" },
      { id: "finance", label: "Finance", insight: "Workshop de-risks ARR bet.", opportunity: "$15k–$40k near-term", concern: "Delayed recurring" },
    ],
    boardSummary: {
      mostImportantInsight: "The membership offer is already implied by the graph — not invented.",
      strongestOpportunity: "Workshop as proof engine for tier pricing.",
      greatestConcern: "Building tier before quotes exist.",
      recommendedAction: "Ship workshop; capture quotes; then Builder for tier.",
    },
    ecosystemImpact: [
      { area: "revenue", summary: "Near + recurring path", direction: "positive" },
      { area: "research", summary: "Validates investment", direction: "positive" },
      { area: "founder", summary: "Simulation + Memory align", direction: "positive" },
    ],
    recommendedAction: "validate",
    recommendedActionWhy: "Workshop validates the chain before membership architecture.",
    prepOffers: DEFAULT_PREP,
    learningNote: "Compare predicted butterfly chain to actual workshop outcomes in Memory Theater.",
  },
  {
    id: "disc-founder-postcraft",
    category: "marketing-relationships",
    headline: "Founder Builder outputs and PostCraft campaigns share untapped quotes",
    nobodyAskedOpener: "This reminds me of something we solved in PostCraft…",
    summary:
      "Executive Builder blueprints and Gentle Restart Campaign were drafted separately — but member quotes in research overlap 80% with campaign headlines not yet used.",
    whyShariShouldCare: "You're rewriting copy that research already wrote.",
    whyNow: "Campaign awaits estate visual — perfect moment to inject quotes before launch.",
    opportunity: "One quote library feeding Builder, PostCraft, and Companion",
    risk: "Duplicate copy work across sprints",
    evidence: ["node-campaign-gentle-restart", "report-adhd-founders-month", "blueprint-listening-restart"],
    confidence: "medium",
    patternType: "duplicate-work",
    remindsMeOf: "We solved something similar when Research Center linked to Opportunity rank.",
    relatedNodeIds: ["node-campaign-gentle-restart", "node-newsletter-restart"],
    relatedMissionIds: ["marketing-launch", "listening-rooms"],
    relatedProductIds: ["postcraft", "founder"],
    boardPerspectives: [
      { id: "marketing", label: "Marketing", insight: "Quotes are the asset.", opportunity: "Lead magnet from research", concern: "Launch delay" },
      { id: "technology", label: "Technology", insight: "Graph can link quote nodes.", opportunity: "Auto-sync in V2", concern: "Manual sample data today" },
    ],
    boardSummary: {
      mostImportantInsight: "Copy duplication is invisible executive tax.",
      strongestOpportunity: "Shared quote node in Intelligence Graph.",
      greatestConcern: "Shari re-writing what exists.",
      recommendedAction: "Connect research report to PostCraft campaign draft.",
    },
    ecosystemImpact: [
      { area: "postcraft", summary: "Faster campaign", direction: "positive" },
      { area: "founder", summary: "Less rework", direction: "positive" },
    ],
    recommendedAction: "connect",
    recommendedActionWhy: "Minutes to link; hours saved on copy.",
    prepOffers: DEFAULT_PREP.filter((p) => p.kind !== "workshop"),
    learningNote: "Track copy prep time before/after quote linking.",
  },
  {
    id: "disc-gap-pricing",
    category: "research-relationships",
    headline: "Pricing decisions lack graph evidence — knowledge gap",
    nobodyAskedOpener: "Nobody has answered this yet…",
    summary:
      "Membership tier and workshop pricing simulations exist in conversation — but no decision node links to pricing research or competitor benchmarks in the graph.",
    whyShariShouldCare: "You may price from intuition when graph could show gaps.",
    whyNow: "Calm Depth tier design starts after workshop — pricing research should lead not follow.",
    opportunity: "Small pricing research sprint before tier design",
    risk: "Underpriced workshop or overpriced tier",
    evidence: ["Simulation: sim-workshop-vs-membership unknowns", "Graph: no pricing decision nodes"],
    confidence: "medium",
    patternType: "knowledge-gaps",
    relatedNodeIds: ["node-decision-invest-restart"],
    relatedMissionIds: ["listening-rooms"],
    relatedProductIds: ["listening-rooms"],
    boardPerspectives: [
      { id: "finance", label: "Finance", insight: "Price anchors missing.", opportunity: "Competitor scan", concern: "Analysis paralysis" },
      { id: "ceo", label: "CEO", insight: "Workshop price can be tested live.", opportunity: "Enrollment as signal", concern: "Waiting too long" },
    ],
    boardSummary: {
      mostImportantInsight: "Pricing is a gap — not a blocker for workshop.",
      strongestOpportunity: "Test workshop price live; research tier while running.",
      greatestConcern: "Tier priced without workshop data.",
      recommendedAction: "Research brief on membership pricing benchmarks.",
    },
    ecosystemImpact: [
      { area: "revenue", summary: "Better anchors", direction: "positive" },
      { area: "research", summary: "Fills gap", direction: "positive" },
    ],
    recommendedAction: "research-further",
    recommendedActionWhy: "Gap is real but workshop can proceed in parallel.",
    prepOffers: DEFAULT_PREP.filter((p) => ["research-brief", "simulation", "executive-brief"].includes(p.kind)),
    learningNote: "Add pricing nodes to graph when research completes.",
  },
  {
    id: "disc-habit-sprint",
    category: "founder-habits",
    headline: "Your highest-leverage habit: one capability per sprint",
    nobodyAskedOpener: "Your highest-performing internal work shares a pattern…",
    summary:
      "Founder Studio Sprints 1–6 all shipped shippable rooms with tests — parallel polish sprints stalled. Graph shows internal nodes growing faster when scope is one room.",
    whyShariShouldCare: "Your energy pattern is visible — protect the sprint rhythm.",
    whyNow: "Sprint 7 is another chance to reinforce what works.",
    opportunity: "Document sprint pattern as institutional playbook",
    risk: "Parallel Founder + Companion splits focus",
    evidence: ["replay-founder-journey", "sim-founder-vs-companion", "node-brief-2026-07-06"],
    confidence: "high",
    patternType: "repeated-success",
    remindsMeOf: "Memory Theater recorded the same lesson — rooms beat modules.",
    relatedNodeIds: ["node-brief-2026-07-06", "node-journal-restart"],
    relatedMissionIds: ["listening-rooms"],
    relatedProductIds: ["founder"],
    boardPerspectives: [
      { id: "adhd", label: "ADHD Perspective", insight: "One finish line per sprint reduces switching tax.", opportunity: "Clear wins", concern: "Parallel tracks" },
      { id: "operations", label: "Operations", insight: "Test + bridge pattern scales.", opportunity: "Playbook for Team Hub", concern: "None" },
    ],
    boardSummary: {
      mostImportantInsight: "Sprint discipline is a competitive advantage.",
      strongestOpportunity: "Teach pattern to future hires via Memory Theater.",
      greatestConcern: "Abandoning rhythm for parallel polish.",
      recommendedAction: "Teach — add to Do This Again library.",
    },
    ecosystemImpact: [
      { area: "founder", summary: "Leverage compounds", direction: "positive" },
      { area: "operations", summary: "Predictable shipping", direction: "positive" },
    ],
    recommendedAction: "teach",
    recommendedActionWhy: "Habit already proven — make it explicit.",
    prepOffers: DEFAULT_PREP.filter((p) => p.kind === "executive-brief"),
    learningNote: "Log sprint completion vs Shari energy in future discoveries.",
  },
];

export const FOUNDER_ALERTS: FounderAlert[] = [
  {
    id: "alert-unified-restart",
    discoveryId: "disc-seven-conversations",
    title: "Founder Alert™ — Unify restart narrative before workshop",
    whatWasDiscovered: "Seven conversation streams describe the same guilt-after-absence problem.",
    whyItMatters: "Workshop enrollment could fail if marketing speaks productivity while members need permission.",
    evidence: ["Customer feedback node", "Restart research", "Memory Theater quotes"],
    confidence: "high",
    businessImpact: "Higher conversion; less copy rework",
    memberImpact: "Members feel seen on return",
    revenueImpact: "Workshop band $15k–$40k at risk if message misses",
    timeSavings: "~10 hours copy alignment saved",
    recommendedAction: "Connect Companion, workshop, and PostCraft in one narrative brief.",
    suggestedImplementation: "Executive Builder blueprint for unified restart messaging.",
    relatedMissions: ["listening-rooms"],
    relatedProducts: ["companion", "listening-rooms", "postcraft"],
    relatedResearch: ["report-adhd-founders-month"],
    urgency: "now",
  },
  {
    id: "alert-butterfly",
    discoveryId: "disc-butterfly-restart",
    title: "Founder Alert™ — Workshop-to-membership chain is ready",
    whatWasDiscovered: "Complete butterfly chain from research to recurring revenue is visible in the graph.",
    whyItMatters: "You may be one proof event away from a tier you haven't designed yet.",
    evidence: ["Butterfly chain", "Simulation Scenario A", "Memory Theater replay"],
    confidence: "high",
    businessImpact: "ARR path clarified",
    memberImpact: "Clear journey from workshop to home",
    revenueImpact: "Workshop + future ARR",
    timeSavings: "Weeks of tier debate avoided",
    recommendedAction: "Validate with workshop first; capture quotes for tier.",
    suggestedImplementation: "Simulation already run — proceed to Builder for workshop.",
    relatedMissions: ["listening-rooms"],
    relatedProducts: ["listening-rooms"],
    relatedResearch: ["node-research-adhd-restart"],
    urgency: "soon",
  },
];

export function getSampleDiscovery(id: string): ExecutiveDiscovery | undefined {
  return SAMPLE_DISCOVERIES.find((d) => d.id === id);
}

export function getFounderAlert(id: string): FounderAlert | undefined {
  return FOUNDER_ALERTS.find((a) => a.id === id);
}

export function getAlertForDiscovery(discoveryId: string): FounderAlert | undefined {
  return FOUNDER_ALERTS.find((a) => a.discoveryId === discoveryId);
}
