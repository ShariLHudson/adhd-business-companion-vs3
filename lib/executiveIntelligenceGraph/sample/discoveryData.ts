import type {
  DidntKnowThatInsight,
  GraphDiscoveryInsight,
  GraphSuggestedSearch,
  SparkEcosystemArea,
} from "../types";

export const EXECUTIVE_GRAPH_PRINCIPLE =
  "Founder understands relationships — not folders. Intelligence lives in connections.";

export const SUGGESTED_GRAPH_SEARCHES: GraphSuggestedSearch[] = [
  { id: "gs-lr", phrase: "Show everything connected to Listening Rooms" },
  { id: "gs-adhd", phrase: "Show everything related to ADHD burnout" },
  { id: "gs-research", phrase: "What research supports this feature?" },
  { id: "gs-pricing", phrase: "Show every decision related to pricing" },
  { id: "gs-founder-postcraft", phrase: "What opportunities connect Founder and PostCraft?" },
  { id: "gs-customer", phrase: "Which products solve this customer problem?" },
];

export const DISCOVERY_INSIGHTS: GraphDiscoveryInsight[] = [
  {
    id: "disc-hidden-1",
    kind: "hidden-relationship",
    title: "Customer voice → three unfinished products",
    summary: "Gentle Return feedback connects to workshop, course, and Listening Rooms roadmap — not yet unified in marketing.",
    nodeIds: ["node-feedback-restart", "node-workshop-fatigue", "node-course-choosing", "node-roadmap-improvements"],
  },
  {
    id: "disc-opp-1",
    kind: "missed-opportunity",
    title: "Research paper supports two future workshops",
    summary: "ADHD Restart Research validates both Listening Rooms and Decision Fatigue workshop — cross-promote in one campaign.",
    nodeIds: ["node-research-adhd-restart", "node-workshop-fatigue", "node-listening-rooms"],
  },
  {
    id: "disc-cross-1",
    kind: "cross-product",
    title: "Founder Studio ↔ PostCraft bridge",
    summary: "Executive Builder outputs and Gentle Restart Campaign share member quotes — connect in Intelligence Graph for one narrative.",
    nodeIds: ["node-campaign-gentle-restart", "node-newsletter-restart"],
  },
  {
    id: "disc-gap-1",
    kind: "research-gap",
    title: "Pricing decisions lack graph links",
    summary: "No decision nodes yet connect to membership tier research — add when Calm Depth tier simulation ships.",
    nodeIds: ["node-decision-invest-restart"],
  },
  {
    id: "disc-attn-1",
    kind: "needs-attention",
    title: "Listening Rooms needs marketing attention",
    summary: "Campaign exists but awaits estate visual proof — blocks PostCraft launch sequence.",
    nodeIds: ["node-campaign-gentle-restart", "node-listening-rooms"],
  },
];

export const DIDNT_KNOW_THAT: DidntKnowThatInsight[] = [
  {
    id: "idk-1",
    headline: "This customer question connects to three unfinished products.",
    explanation: "Gentle Return feedback inspired the Decision Fatigue workshop, Choosing With Calm course, and roadmap improvements — all active but not marketed as one journey.",
    nodeIds: ["node-feedback-restart", "node-workshop-fatigue", "node-course-choosing"],
  },
  {
    id: "idk-2",
    headline: "This research paper supports two future workshops.",
    explanation: "ADHD Restart Rituals Research underpins both Listening Rooms estate re-entry and the Decision Fatigue live experience.",
    nodeIds: ["node-research-adhd-restart", "node-listening-rooms", "node-workshop-fatigue"],
  },
  {
    id: "idk-3",
    headline: "This decision affected six later projects.",
    explanation: "Invest in Restart Experience decision threads through research, campaigns, funnels, lessons, analytics, and roadmap items.",
    nodeIds: ["node-decision-invest-restart", "node-campaign-gentle-restart", "node-ghl-gentle-restart"],
  },
  {
    id: "idk-4",
    headline: "This feature could solve four member requests.",
    explanation: "Listening Rooms scene addresses guilt, decision fatigue, return warmth, and async restart — all in customer feedback tags.",
    nodeIds: ["node-listening-rooms", "node-feedback-restart"],
  },
];

export const ECOSYSTEM_AREAS: SparkEcosystemArea[] = [
  {
    id: "eco-founder",
    label: "Founder™",
    summary: "Executive pipeline — Research through Memory Theater",
    nodeCount: 8,
    highlightNodeIds: ["node-brief-2026-07-06", "node-eq-build-next", "node-decision-invest-restart"],
    direction: "growing",
  },
  {
    id: "eco-companion",
    label: "Spark Companion™",
    summary: "Return voice, conversations, member continuity",
    nodeCount: 5,
    highlightNodeIds: ["node-feedback-restart", "node-analytics-retention"],
    direction: "needs-attention",
  },
  {
    id: "eco-postcraft",
    label: "PostCraft™",
    summary: "Campaigns, newsletters, content queue",
    nodeCount: 4,
    highlightNodeIds: ["node-campaign-gentle-restart", "node-newsletter-restart"],
    direction: "stable",
  },
  {
    id: "eco-listening",
    label: "Listening Rooms™",
    summary: "Flagship restart experience — research to revenue",
    nodeCount: 12,
    highlightNodeIds: ["node-listening-rooms", "node-workshop-fatigue", "node-research-adhd-restart"],
    direction: "strong",
  },
  {
    id: "eco-research",
    label: "Research",
    summary: "Evidence layer feeding opportunities and decisions",
    nodeCount: 6,
    highlightNodeIds: ["node-research-adhd-restart", "node-finding-decision-fatigue"],
    direction: "strong",
  },
  {
    id: "eco-marketing",
    label: "Marketing & Revenue",
    summary: "Campaigns, funnels, analytics signals",
    nodeCount: 5,
    highlightNodeIds: ["node-campaign-gentle-restart", "node-ghl-gentle-restart", "node-analytics-retention"],
    direction: "growing",
  },
];

export const NODE_ENRICHMENTS: Record<
  string,
  {
    whyItExists: string;
    whyItMatters: string;
    opportunities: string[];
    risks: string[];
    whatShouldHappenNext: string;
    pathway: { label: string; nodeId?: string; summary: string }[];
    boardSummary: string;
  }
> = {
  "node-listening-rooms": {
    whyItExists: "Members need a shame-free place to return after absence — not a productivity reset.",
    whyItMatters: "Flagship 2026 mission expression; connects research, revenue, estate, and Companion voice.",
    opportunities: ["Workshop front door", "Membership tier fed by live quotes", "PostCraft story arc"],
    risks: ["Scope creep on live facilitation", "Marketing before visual proof"],
    whatShouldHappenNext: "Ship workshop; capture quotes; design Calm Depth tier from member voice.",
    pathway: [
      { label: "Idea", summary: "Members disappear after hard seasons" },
      { label: "Research", nodeId: "node-research-adhd-restart", summary: "ADHD restart evidence" },
      { label: "Mission", nodeId: "node-mission-lr", summary: "Listening Rooms mission chartered" },
      { label: "Development", summary: "Estate scene + Companion alignment" },
      { label: "Marketing", nodeId: "node-campaign-gentle-restart", summary: "Gentle Restart campaign" },
      { label: "Launch", summary: "Shame-Free Restart workshop" },
      { label: "Lessons", nodeId: "node-lesson-restart-first", summary: "Welcome before productivity" },
      { label: "Future", nodeId: "node-roadmap-improvements", summary: "Voice capture, mobile perf" },
    ],
    boardSummary: "Unanimous priority — protect Shari bandwidth; ship proof before architecture.",
  },
  "node-decision-invest-restart": {
    whyItExists: "Executive decision to prioritize restart experience through Q3.",
    whyItMatters: "Anchors six downstream projects — campaigns, funnels, lessons, analytics.",
    opportunities: ["Decision Vault replay in Memory Theater", "Simulation validation"],
    risks: ["Decision without live enrollment follow-through"],
    whatShouldHappenNext: "Record outcome in Memory Theater learning loop after workshop.",
    pathway: [
      { label: "Question", summary: "Should we invest in restart experience?" },
      { label: "Research", nodeId: "node-research-adhd-restart", summary: "Evidence gathered" },
      { label: "Decision", summary: "Prioritize Listening Rooms Q3" },
      { label: "Implementation", nodeId: "node-campaign-gentle-restart", summary: "Campaign + funnel" },
      { label: "Results", nodeId: "node-success-retention-signal", summary: "Early retention signal" },
    ],
    boardSummary: "Still the right call — accelerate marketing once estate visual proof lands.",
  },
};
