import type {
  JudgmentPrepOffer,
  JudgmentRecommendation,
  JudgmentScore,
  LearningLoopEntry,
  NotNowItem,
  ScorecardEntry,
  WhyNotEntry,
} from "../types";

export const JUDGMENT_ENGINE_PRINCIPLE =
  "Founder demonstrates judgment — not certainty. Everything competes. Only the strongest survive.";

export const TODAYS_JUDGMENT_QUESTION =
  "If I were responsible for building Visual Spark Studios, what would I recommend today?";

const DEFAULT_PREP: JudgmentPrepOffer[] = [
  { id: "ej-prep-mission", kind: "mission", label: "Mission update", description: "Align judgment to active mission.", status: "draft" },
  { id: "ej-prep-builder", kind: "executive-builder", label: "Executive Builder", description: "Blueprint from judgment.", status: "draft" },
  { id: "ej-prep-sim", kind: "simulation", label: "Simulation", description: "Compare paths before committing.", status: "draft" },
  { id: "ej-prep-brief", kind: "executive-brief", label: "Executive brief", description: "One-page decision support.", status: "draft" },
  { id: "ej-prep-postcraft", kind: "postcraft-campaign", label: "PostCraft campaign", description: "Content from recommendation.", status: "draft" },
  { id: "ej-prep-cursor", kind: "cursor-prompt", label: "Cursor prompt", description: "Implementation prompt.", status: "draft" },
];

const SHARI_LENS = {
  currentEnergy: "Strong sprint rhythm — protect finish lines, not parallel polish.",
  currentMission: "Listening Rooms shame-free restart",
  currentWorkload: "Executive stack shipping — one room per sprint",
  currentPriorities: "Workshop proof before membership tier design",
  longTermVision: "Spark as relationship-first companion ecosystem",
  personalStrengths: "Narrative clarity, member empathy, sprint discipline",
  businessSeason: "Pre-workshop proof — narrative coherence matters most",
  fitSummary: "Recommendations fit Shari today — not an average founder.",
};

function buildScores(entries: JudgmentScore[]): JudgmentScore[] {
  return entries;
}

function buildScorecard(entries: ScorecardEntry[]): ScorecardEntry[] {
  return entries;
}

export const RECOMMENDATION_UNIFIED_RESTART: JudgmentRecommendation = {
  id: "judgment-unified-restart",
  headline: "Prepare unified restart narrative before workshop ships",
  summary:
    "Discovery, Relationship Intelligence, and Memory Theater converge — one shame-free return story across Companion, Listening Rooms, and PostCraft.",
  whyThis: "Highest composite score across impact, mission alignment, and customer value.",
  whyNow: "Workshop enrollment window is open — fragmented copy cannot be fixed after launch.",
  whyNotOthers: "Workshop proof and quote library matter — but narrative coherence unlocks both.",
  ifIgnored: "Each channel speaks differently; members feel unseen; workshop conversion suffers.",
  whatWouldChange: "If workshop date slips 60+ days, deprioritize to quote library first.",
  compositeScore: 91,
  scores: buildScores([
    { dimension: "impact", label: "Impact", score: 92, explanation: "Unifies restart narrative across three products before launch." },
    { dimension: "urgency", label: "Urgency", score: 88, explanation: "Workshop is weeks away." },
    { dimension: "founder-energy", label: "Founder Energy", score: 78, explanation: "One blueprint session — not weeks of scattered copy." },
    { dimension: "customer-value", label: "Customer Value", score: 95, explanation: "Members feel seen on return." },
    { dimension: "revenue-potential", label: "Revenue Potential", score: 85, explanation: "Workshop band $15k–$40k depends on message." },
    { dimension: "mission-alignment", label: "Mission Alignment", score: 97, explanation: "Listening Rooms restart mission." },
    { dimension: "research-confidence", label: "Research Confidence", score: 90, explanation: "Seven streams + ADHD research confirm pattern." },
    { dimension: "attention-cost", label: "Attention Cost", score: 72, explanation: "Moderate focus — prevents higher rework cost." },
  ]),
  scorecard: buildScorecard([
    { dimension: "immediate-value", label: "Immediate Value", rating: "high", summary: "Copy alignment before launch" },
    { dimension: "future-value", label: "Future Value", rating: "high", summary: "Reusable narrative for membership tier" },
    { dimension: "risk", label: "Risk", rating: "medium", summary: "Over-unifying too early" },
    { dimension: "difficulty", label: "Difficulty", rating: "low", summary: "Executive Builder blueprint" },
    { dimension: "time", label: "Time", rating: "low", summary: "1–2 focused sessions" },
    { dimension: "founder-energy", label: "Founder Energy", rating: "medium", summary: "Creative work Shari does well" },
    { dimension: "customer-benefit", label: "Customer Benefit", rating: "high", summary: "Permission-first return language" },
    { dimension: "confidence", label: "Confidence", rating: "high", summary: "Multiple engines agree" },
  ]),
  reasoning: {
    evidence: ["ede-unified-restart", "disc-seven-conversations", "Memory Theater return guilt quotes"],
    assumptions: ["Workshop launches within 6 weeks", "Gentle Restart campaign shares narrative"],
    tradeoffs: "Brief narrative work now vs expensive copy rework after launch.",
    alternatives: ["Ship workshop with current copy", "Delay for full research sprint"],
    confidence: "high",
    risks: ["Over-editing delays launch", "Clinical tone in shame-free language"],
  },
  shariLens: { ...SHARI_LENS, fitSummary: "One focused narrative brief before launch beats another feature sprint." },
  discipline: {
    id: "disc-focus-restart",
    kind: "focus",
    title: "Focus here — not parallel Founder polish",
    summary: "Sprint discipline is competitive advantage. Finish narrative before new tracks.",
    why: "Memory Theater validated one-room-per-sprint rhythm.",
  },
  prepOffers: DEFAULT_PREP,
  relatedDiscoveryIds: ["ede-unified-restart"],
  relatedOpportunityIds: ["opp-listening-rooms-restart"],
  relatedMissionIds: ["listening-rooms"],
  learningNote: "Track workshop enrollment vs launches without unified narrative.",
};

export const RECOMMENDATION_WORKSHOP_PROOF: JudgmentRecommendation = {
  id: "judgment-workshop-proof",
  headline: "Ship workshop as proof engine for membership tier",
  summary: "Simulation + butterfly chain show workshop-first de-risks Calm Depth tier.",
  whyThis: "Second-highest revenue path with simulation evidence.",
  whyNow: "Graph and Memory align before tier design.",
  whyNotOthers: "Narrative must lead — workshop scheduling can proceed in parallel.",
  ifIgnored: "Tier priced from intuition without live member quotes.",
  whatWouldChange: "If narrative slips, still run workshop with different quote capture.",
  compositeScore: 86,
  scores: buildScores([
    { dimension: "impact", label: "Impact", score: 88, explanation: "Proof event for recurring revenue." },
    { dimension: "revenue-potential", label: "Revenue Potential", score: 90, explanation: "Near-term cash + ARR path." },
    { dimension: "strategic-value", label: "Strategic Value", score: 87, explanation: "Validates membership before build." },
    { dimension: "mission-alignment", label: "Mission Alignment", score: 84, explanation: "Listening Rooms journey." },
    { dimension: "complexity", label: "Complexity", score: 65, explanation: "Workshop is achievable; tier is not yet." },
  ]),
  scorecard: buildScorecard([
    { dimension: "immediate-value", label: "Immediate Value", rating: "high", summary: "Workshop cash" },
    { dimension: "future-value", label: "Future Value", rating: "high", summary: "Tier quotes from live members" },
    { dimension: "risk", label: "Risk", rating: "medium", summary: "Rushing tier before workshop" },
    { dimension: "confidence", label: "Confidence", rating: "high", summary: "Simulation + graph agree" },
  ]),
  reasoning: {
    evidence: ["sim-workshop-vs-membership", "ede-butterfly-chain"],
    assumptions: ["Workshop capacity exists", "Quote capture ready"],
    tradeoffs: "Workshop effort now vs guessing tier later.",
    alternatives: ["Design tier in parallel", "Research-only sprint"],
    confidence: "high",
    risks: ["Skipping quote capture"],
  },
  shariLens: { ...SHARI_LENS, fitSummary: "Proof-before-build fits Shari — workshop is the evidence event." },
  prepOffers: DEFAULT_PREP.filter((p) => ["executive-builder", "simulation", "executive-brief"].includes(p.kind)),
  relatedDiscoveryIds: ["ede-butterfly-chain"],
  relatedOpportunityIds: ["opp-listening-rooms-restart"],
  relatedMissionIds: ["listening-rooms"],
  learningNote: "Compare butterfly chain prediction to workshop outcomes.",
};

export const RECOMMENDATION_QUOTE_LIBRARY: JudgmentRecommendation = {
  id: "judgment-quote-library",
  headline: "Link research quotes to PostCraft before visual locks",
  summary: "80% overlap between research and unused campaign headlines — invisible executive tax.",
  whyThis: "High leverage, low effort — hours saved every campaign cycle.",
  whyNow: "Gentle Restart awaits estate visual — perfect injection moment.",
  whyNotOthers: "Lower urgency than narrative and workshop — but fast win.",
  ifIgnored: "Shari rewrites what research already wrote.",
  whatWouldChange: "If campaign timeline moves up, elevate to primary.",
  compositeScore: 79,
  scores: buildScores([
    { dimension: "automation-potential", label: "Automation Potential", score: 70, explanation: "Graph quote sync in V2." },
    { dimension: "founder-energy", label: "Founder Energy", score: 85, explanation: "Minutes to link, hours saved." },
    { dimension: "learning-opportunity", label: "Learning Opportunity", score: 60, explanation: "Modest — mostly execution." },
  ]),
  scorecard: buildScorecard([
    { dimension: "immediate-value", label: "Immediate Value", rating: "medium", summary: "Faster campaign draft" },
    { dimension: "difficulty", label: "Difficulty", rating: "low", summary: "Link existing quotes" },
    { dimension: "reusability", label: "Reusability", rating: "high", summary: "Quote library compounds" },
  ]),
  reasoning: {
    evidence: ["ede-quote-library", "disc-founder-postcraft"],
    assumptions: ["Campaign not yet visually locked"],
    tradeoffs: "Small time now vs repeated copy work.",
    alternatives: ["Write fresh copy", "Wait for automation"],
    confidence: "medium",
    risks: ["Launch delay if over-editing"],
  },
  shariLens: { ...SHARI_LENS, fitSummary: "Quick win that respects Shari's time — not a new project." },
  prepOffers: DEFAULT_PREP.filter((p) => p.kind === "postcraft-campaign"),
  relatedDiscoveryIds: ["ede-quote-library"],
  relatedOpportunityIds: [],
  relatedMissionIds: ["marketing-launch", "listening-rooms"],
  learningNote: "Track copy prep time before/after linking.",
};

export const RECOMMENDATION_PRICING_RESEARCH: JudgmentRecommendation = {
  id: "judgment-pricing-research",
  headline: "Pricing benchmarks brief — parallel, not blocking workshop",
  summary: "Gap is real but workshop can proceed; tier design should follow evidence.",
  whyThis: "Important but not today's primary — belongs in can-wait tier.",
  whyNow: "Calm Depth design starts after workshop — window is open.",
  whyNotOthers: "Narrative and proof outrank pricing research today.",
  ifIgnored: "Tier priced from intuition.",
  whatWouldChange: "If workshop completes early, elevate before tier announcement.",
  compositeScore: 68,
  scores: buildScores([
    { dimension: "long-term-value", label: "Long-Term Value", score: 80, explanation: "Better tier anchors." },
    { dimension: "urgency", label: "Urgency", score: 45, explanation: "Workshop price can be tested live." },
    { dimension: "dependencies", label: "Dependencies", score: 55, explanation: "Workshop quotes help more than benchmarks alone." },
  ]),
  scorecard: buildScorecard([
    { dimension: "future-value", label: "Future Value", rating: "high", summary: "Tier pricing confidence" },
    { dimension: "time", label: "Time", rating: "medium", summary: "Research brief sprint" },
    { dimension: "confidence", label: "Confidence", rating: "medium", summary: "Gap identified, not filled" },
  ]),
  reasoning: {
    evidence: ["ede-pricing-gap", "disc-gap-pricing"],
    assumptions: ["Workshop runs on test price"],
    tradeoffs: "Research time vs momentum.",
    alternatives: ["Guess tier price", "Delay workshop for research"],
    confidence: "medium",
    risks: ["Analysis paralysis"],
  },
  shariLens: { ...SHARI_LENS, fitSummary: "Parallel track — not a blocker for Shari's momentum." },
  prepOffers: DEFAULT_PREP.filter((p) => p.kind === "executive-brief"),
  relatedDiscoveryIds: ["ede-pricing-gap"],
  relatedOpportunityIds: [],
  relatedMissionIds: ["listening-rooms"],
  learningNote: "Add pricing nodes to graph when research completes.",
};

export const RECOMMENDATION_COMPETITIVE_WATCH: JudgmentRecommendation = {
  id: "judgment-competitive-watch",
  headline: "Monitor competitive AI messaging — do not react with features",
  summary: "Relationship positioning matters more than feature parity race.",
  whyThis: "Valid watch item — not today's action.",
  whyNow: "Category noise rising — audit marketing against Shari test monthly.",
  whyNotOthers: "Internal coherence outranks external noise today.",
  ifIgnored: "Marketing drifts toward feature comparison ads.",
  whatWouldChange: "If competitor directly targets ADHD founders, elevate.",
  compositeScore: 58,
  scores: buildScores([
    { dimension: "competitive-advantage", label: "Competitive Advantage", score: 75, explanation: "Relationship moat if protected." },
    { dimension: "attention-cost", label: "Attention Cost", score: 40, explanation: "Low if digest-only." },
  ]),
  scorecard: buildScorecard([
    { dimension: "risk", label: "Risk", rating: "medium", summary: "Positioning drift" },
    { dimension: "automation", label: "Automation", rating: "medium", summary: "Weekly digest filter" },
  ]),
  reasoning: {
    evidence: ["ede-competitive-signal"],
    assumptions: ["No immediate competitor threat to Listening Rooms"],
    tradeoffs: "Awareness vs distraction.",
    alternatives: ["Ignore competitors", "Match feature marketing"],
    confidence: "medium",
    risks: ["Unwinnable feature race"],
  },
  shariLens: { ...SHARI_LENS, fitSummary: "Watch quietly — Shari should not spend creative energy here today." },
  prepOffers: DEFAULT_PREP.filter((p) => p.kind === "executive-brief"),
  relatedDiscoveryIds: ["ede-competitive-signal"],
  relatedOpportunityIds: [],
  relatedMissionIds: ["spark-quality"],
  learningNote: "Log which competitive signals led to real changes vs noise.",
};

export const RECOMMENDATION_PARALLEL_POLISH: JudgmentRecommendation = {
  id: "judgment-stop-parallel-polish",
  headline: "Stop parallel polish sprints — finish one room at a time",
  summary: "Sprint 1–8 pattern works; parallel polish stalled.",
  whyThis: "Discipline recommendation — protect what works.",
  whyNow: "Sprint 9 is another chance to reinforce rhythm.",
  whyNotOthers: "Not a revenue action — an attention protection action.",
  ifIgnored: "Split focus; fewer shippable rooms.",
  whatWouldChange: "If team capacity doubles, revisit.",
  compositeScore: 55,
  scores: buildScores([
    { dimension: "founder-energy", label: "Founder Energy", score: 90, explanation: "One finish line reduces switching tax." },
    { dimension: "strategic-value", label: "Strategic Value", score: 82, explanation: "Shipping cadence compounds." },
  ]),
  scorecard: buildScorecard([
    { dimension: "founder-energy", label: "Founder Energy", rating: "high", summary: "ADHD-friendly finish lines" },
    { dimension: "learning", label: "Learning", rating: "high", summary: "Institutional playbook" },
  ]),
  reasoning: {
    evidence: ["ede-sprint-rhythm", "replay-founder-journey"],
    assumptions: ["Solo founder capacity"],
    tradeoffs: "Polish depth vs shipping velocity.",
    alternatives: ["Polish all rooms", "Pause Founder for Companion only"],
    confidence: "high",
    risks: ["Perfectionism on unfinished rooms"],
  },
  shariLens: { ...SHARI_LENS, fitSummary: "Shari thrives with one clear finish line — honor that." },
  discipline: {
    id: "disc-stop-parallel",
    kind: "stop",
    title: "Stop parallel polish until Sprint 9 ships",
    summary: "Do not open second implementation tracks mid-sprint.",
    why: "Graph shows internal nodes grow faster with one-room scope.",
  },
  prepOffers: DEFAULT_PREP.filter((p) => p.kind === "executive-brief"),
  relatedDiscoveryIds: ["ede-sprint-rhythm"],
  relatedOpportunityIds: [],
  relatedMissionIds: ["founder-studio"],
  learningNote: "Log sprint completion vs energy.",
};

export const ALL_RECOMMENDATIONS: JudgmentRecommendation[] = [
  RECOMMENDATION_UNIFIED_RESTART,
  RECOMMENDATION_WORKSHOP_PROOF,
  RECOMMENDATION_QUOTE_LIBRARY,
  RECOMMENDATION_PRICING_RESEARCH,
  RECOMMENDATION_COMPETITIVE_WATCH,
  RECOMMENDATION_PARALLEL_POLISH,
];

export const WHY_NOT_ENTRIES: WhyNotEntry[] = [
  {
    id: "why-not-tier-now",
    kind: "too-early",
    title: "Calm Depth membership tier design",
    summary: "Graph shows the path — but workshop quotes don't exist yet.",
    relatedRecommendationId: "judgment-workshop-proof",
  },
  {
    id: "why-not-ghl-launch",
    kind: "needs-evidence",
    title: "GoHighLevel workflow launch",
    summary: "Needs configuration and narrative approval before anything delivers.",
    relatedRecommendationId: "judgment-unified-restart",
  },
  {
    id: "why-not-feature-race",
    kind: "rejected",
    title: "Match competitor AI feature marketing",
    summary: "Unwinnable race — Spark wins on relationship, not feature lists.",
    relatedRecommendationId: "judgment-competitive-watch",
  },
  {
    id: "why-not-parallel",
    kind: "not-recommended",
    title: "Parallel polish of all Founder rooms",
    summary: "Pattern proved slower than one-room-per-sprint discipline.",
    relatedRecommendationId: "judgment-stop-parallel-polish",
  },
  {
    id: "why-not-delay-workshop",
    kind: "postponed",
    title: "Delay workshop for pricing research only",
    summary: "Research can run parallel — momentum matters.",
    relatedRecommendationId: "judgment-pricing-research",
  },
];

export const NOT_NOW_LIBRARY: NotNowItem[] = [
  {
    id: "not-now-pinterest",
    title: "Pinterest integration",
    summary: "Research pins linked to Opportunity Discovery.",
    whyNotNow: "Integration Center marks as future — higher priorities exist.",
    revisitWhen: "After workshop launch and quote library live.",
    relatedIds: ["pinterest"],
  },
  {
    id: "not-now-youtube",
    title: "YouTube long-form channel",
    summary: "Workshop replays and estate tours.",
    whyNotNow: "Proof content should come from live workshop first.",
    revisitWhen: "After first workshop quotes captured.",
    relatedIds: ["youtube"],
  },
  {
    id: "not-now-tier",
    title: "Calm Depth membership architecture",
    summary: "Full tier design with pricing and features.",
    whyNotNow: "Workshop must generate quotes first.",
    revisitWhen: "Post-workshop review with Memory Theater replay.",
    relatedIds: ["opp-listening-rooms-restart", "judgment-workshop-proof"],
  },
];

export const LEARNING_LOOP: LearningLoopEntry[] = [
  {
    id: "learn-sprint-discipline",
    recommendation: "One capability per Founder sprint",
    decision: "Shipped Sprints 1–8 with tests before parallel polish",
    outcome: "Predictable executive stack; graph nodes linked",
    lesson: "Sprint discipline is competitive advantage — protect it in Judgment layer.",
  },
  {
    id: "learn-simulation-first",
    recommendation: "Simulation before membership tier",
    decision: "Ran sim-workshop-vs-membership Scenario A",
    outcome: "Workshop-first path validated across Memory and Graph",
    lesson: "When simulation and discovery agree, confidence rises — act on proof events.",
  },
];

export function getJudgmentRecommendation(id: string): JudgmentRecommendation | undefined {
  return ALL_RECOMMENDATIONS.find((r) => r.id === id);
}
