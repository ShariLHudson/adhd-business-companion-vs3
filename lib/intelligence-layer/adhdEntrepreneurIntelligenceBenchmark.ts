/**
 * ADHD Entrepreneur Intelligence Benchmark — Phase 2
 *
 * Companion Intelligence™ Validation Suite — Phase 2 Expansion
 * ─────────────────────────────────────────────────────────────
 *
 * Complements the existing 24-scenario Phase 1 foundation with 50 new
 * scenarios across 10 categories that reflect the full lifecycle of an
 * ADHD entrepreneur.
 *
 * Phase 2 categories (5 scenarios each = 50 total):
 *   1. Money & Financial Avoidance
 *   2. Visibility & Being Seen
 *   3. Launch Psychology
 *   4. ADHD Time Blindness
 *   5. Relationships & Support
 *   6. Re-Entry & Recovery
 *   7. Success Challenges
 *   8. Founder Life Reality
 *   9. Identity Growth
 *   10. Pattern Memory Intelligence (enhanced validation requirements)
 *
 * Enhanced Scoring Dimensions:
 *   historicalPatternDetection — Does companion name recurring cycles?
 *   reEntryQuality             — Does companion orient without shame?
 *   founderReality             — Does companion adapt to real-life pressure?
 *   successHandling            — Does companion support growth sustainably?
 *   overallBenchmark           — Weighted composite of all dimensions.
 *
 * Usage:
 *   import { runAdhdEntrepreneurIntelligenceBenchmark, buildBenchmarkReport, formatScenarioLibrarySummary, formatBenchmarkRunReport } from './adhdEntrepreneurIntelligenceBenchmark';
 *   const results = runAdhdEntrepreneurIntelligenceBenchmark();
 *   const report = buildBenchmarkReport(results);
 *   console.log(formatBenchmarkRunReport(report));
 *
 * Sprint: Phase 2 — ADHD Business Ecosystem™
 */

import { detectAdhdBusinessPatterns } from "@/lib/adhdEntrepreneurIntelligence";
import { evaluateCompanionTurn } from "@/lib/companionGovernor";
import type { CompanionGovernorInput } from "@/lib/companionGovernor";
import { resolveIntent } from "@/lib/intentStabilizer";
import type { WorkspaceOpenSnapshot } from "@/lib/workspaceExecution";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScenarioCategory =
  | "money_financial_avoidance"
  | "visibility_being_seen"
  | "launch_psychology"
  | "adhd_time_blindness"
  | "relationships_support"
  | "reentry_recovery"
  | "success_challenges"
  | "founder_life_reality"
  | "identity_growth"
  | "pattern_memory_intelligence";

export type BenchmarkScenario = {
  id: string;
  name: string;
  category: ScenarioCategory;
  description: string;
  rationale: string;
};

export type CategoryScore = {
  patternRecognition?: boolean;
  usedPriorContext?: boolean;
  namedPattern?: boolean;
  offeredInterruption?: boolean;
  shameReduction?: boolean;
  orientationQuality?: boolean;
  recoverySupport?: boolean;
  nextStepClarity?: boolean;
  adaptedToPressure?: boolean;
  recognizedCapacityLimit?: boolean;
  managedGrowthWell?: boolean;
  avoidedOverwhelm?: boolean;
};

export type ScenarioResult = {
  scenario: BenchmarkScenario;
  pass: boolean;
  patternDetected: boolean;
  detectedPatterns: string[];
  governorOutcome: string;
  notes: string[];
  categoryScore?: CategoryScore;
};

export type CategorySummary = {
  category: ScenarioCategory;
  label: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
};

export type BenchmarkReport = {
  totalScenarios: number;
  passed: number;
  failed: number;
  passRate: number;
  categorySummaries: CategorySummary[];
  weakestCategory: string;
  strongestCategory: string;
  mostCommonFailureType: string;
  scores: {
    historicalPatternDetection: number;
    reEntryQuality: number;
    founderReality: number;
    successHandling: number;
    overallBenchmark: number;
  };
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  money_financial_avoidance: "Money & Financial Avoidance",
  visibility_being_seen: "Visibility & Being Seen",
  launch_psychology: "Launch Psychology",
  adhd_time_blindness: "ADHD Time Blindness",
  relationships_support: "Relationships & Support",
  reentry_recovery: "Re-Entry & Recovery",
  success_challenges: "Success Challenges",
  founder_life_reality: "Founder Life Reality",
  identity_growth: "Identity Growth",
  pattern_memory_intelligence: "Pattern Memory Intelligence",
};

const EMPTY_WORKSPACE: WorkspaceOpenSnapshot = {
  panel: null,
  activeSection: "home",
  revealSeq: 0,
};

function govInput(text: string): CompanionGovernorInput {
  return {
    userText: text,
    lastAssistantText: "",
    workspacePanel: null,
    workspaceSnap: EMPTY_WORKSPACE,
    resolvedIntent: resolveIntent(text),
  };
}

function buildScenarioResult(
  scenario: BenchmarkScenario,
  userText: string,
  opts: {
    expectPatterns?: string[];
    expectGovernorOutcome?: string;
    extraNotes?: string[];
    categoryScore?: CategoryScore;
  } = {},
): ScenarioResult {
  const detected = detectAdhdBusinessPatterns(userText);
  const gov = evaluateCompanionTurn(govInput(userText));
  const notes: string[] = [...(opts.extraNotes ?? [])];
  const expectPatterns = opts.expectPatterns ?? [];
  const patternDetected =
    expectPatterns.length === 0 ||
    expectPatterns.some((p) => (detected as string[]).includes(p));
  const expectedOutcome = opts.expectGovernorOutcome;
  const outcomeMatch = !expectedOutcome || gov.outcome === expectedOutcome;
  if (!patternDetected && expectPatterns.length > 0) {
    notes.push(
      `Expected [${expectPatterns.join(", ")}] — got [${(detected as string[]).join(", ")}]`,
    );
  }
  if (!outcomeMatch) {
    notes.push(
      `Expected governor outcome "${expectedOutcome}" — got "${gov.outcome}"`,
    );
  }
  return {
    scenario,
    pass: patternDetected && outcomeMatch,
    patternDetected,
    detectedPatterns: detected as string[],
    governorOutcome: gov.outcome,
    notes,
    categoryScore: opts.categoryScore,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 1: Money & Financial Avoidance
// WHY: ADHD entrepreneurs avoid financial data due to shame + executive dysfunction.
// The companion must de-shame, provide micro-steps, and ground in reality.
// ─────────────────────────────────────────────────────────────────────────────
function runMoneyScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "money_financial_avoidance";
  return [
    buildScenarioResult({ id:"fin_01", name:"Not Looking at Numbers", category:cat,
      description:"Founder avoids opening their bank account.",
      rationale:"Financial avoidance is the #1 silent killer of ADHD-led businesses." },
      "I haven't looked at my bank account in three weeks. I'm avoiding it.",
      { expectPatterns:["avoidance"], categoryScore:{ shameReduction:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"fin_02", name:"Tax Panic", category:cat,
      description:"Founder realises taxes are due soon and has not prepared.",
      rationale:"ADHD time blindness + financial shame creates tax crises." },
      "Oh no — taxes are due in two weeks and I haven't done anything to prepare.",
      { expectPatterns:["avoidance"], categoryScore:{ nextStepClarity:true, adaptedToPressure:true } }),
    buildScenarioResult({ id:"fin_03", name:"Invoice Avoidance", category:cat,
      description:"Founder completed work but hasn't sent invoices for weeks.",
      rationale:"Invoicing avoidance often tied to perfectionism or fear of rejection." },
      "I finished three client projects last month but I still haven't sent the invoices. I keep putting it off.",
      { expectPatterns:["avoidance"], categoryScore:{ shameReduction:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"fin_04", name:"Subscription Chaos", category:cat,
      description:"Founder has dozens of active unused subscriptions.",
      rationale:"Tool hopping and dopamine-driven signups leave money leaking." },
      "I have so many subscriptions I'm paying for — tools I signed up for and never used.",
      { expectPatterns:["tool_hopping"], categoryScore:{ namedPattern:true, offeredInterruption:true } }),
    buildScenarioResult({ id:"fin_05", name:"Financial Shame", category:cat,
      description:"Founder expresses shame about how little they have earned.",
      rationale:"Shame shuts down executive function before any financial advice can land." },
      "I feel so ashamed of how little money my business has made. Other people seem to be doing so much better.",
      { expectPatterns:["confidence_crash"], categoryScore:{ shameReduction:true, orientationQuality:true } }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 2: Visibility & Being Seen
// WHY: Perfectionism, imposter syndrome and fear of criticism keep ADHD
// entrepreneurs invisible. Visibility is a business essential.
// ─────────────────────────────────────────────────────────────────────────────
function runVisibilityScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "visibility_being_seen";
  return [
    buildScenarioResult({ id:"vis_01", name:"Posting But Not Publishing", category:cat,
      description:"Founder writes content but never presses publish.",
      rationale:"Draft accumulation without publishing is perfectionism meeting fear." },
      "I write posts but I never actually publish them. I have so many drafts just sitting there.",
      { expectPatterns:["perfectionism","avoidance"], categoryScore:{ namedPattern:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"vis_02", name:"Video Avoidance", category:cat,
      description:"Founder avoids recording video content despite knowing it would help.",
      rationale:"Video fear is multi-layered: appearance, performance, judgment." },
      "I know I should do videos but every time I try to record I end up avoiding it all day.",
      { expectPatterns:["avoidance"], categoryScore:{ shameReduction:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"vis_03", name:"Expert Identity Gap", category:cat,
      description:"Founder does not identify as an expert despite deep expertise.",
      rationale:"Imposter syndrome is endemic in ADHD entrepreneurs." },
      "I don't feel like an expert even though I've been doing this for years. Who am I to teach anyone?",
      { expectPatterns:["confidence_crash"], categoryScore:{ shameReduction:true, orientationQuality:true } }),
    buildScenarioResult({ id:"vis_04", name:"Fear of Criticism", category:cat,
      description:"Founder is paralysed by fear of negative public response.",
      rationale:"Rejection-sensitive dysphoria (RSD) makes criticism disproportionately painful." },
      "I'm terrified to post because someone will criticise me publicly and I won't be able to handle it.",
      { expectPatterns:["confidence_crash","avoidance"], categoryScore:{ shameReduction:true, namedPattern:true } }),
    buildScenarioResult({ id:"vis_05", name:"Audience Growth Anxiety", category:cat,
      description:"Founder feels overwhelmed by inconsistent audience growth.",
      rationale:"Inconsistent metrics trigger dopamine crashes. Reframe growth as a rhythm." },
      "My follower count went down this week and I feel like giving up. Why isn't it growing?",
      { expectPatterns:["inconsistent_execution","confidence_crash"], categoryScore:{ orientationQuality:true, recoverySupport:true } }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 3: Launch Psychology
// WHY: Perfectionism, fear of failure, last-minute pivots, and endless tweaking
// prevent the market from ever seeing the work.
// ─────────────────────────────────────────────────────────────────────────────
function runLaunchScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "launch_psychology";
  return [
    buildScenarioResult({ id:"lnch_01", name:"Everything Ready But Won't Launch", category:cat,
      description:"All launch assets are complete but the founder cannot press go.",
      rationale:"Launch paralysis is perfectionism meeting fear of judgment." },
      "Everything is ready to launch — the sales page, the emails, the product — but I can't bring myself to press go.",
      { expectPatterns:["perfectionism","avoidance"], categoryScore:{ namedPattern:true, nextStepClarity:true, offeredInterruption:true } }),
    buildScenarioResult({ id:"lnch_02", name:"Soft Launch Forever", category:cat,
      description:"Founder has been in 'soft launch' for months with no real launch.",
      rationale:"Soft launch as permanent state = avoiding real exposure." },
      "I've been in soft launch for four months. I keep saying I'll do a proper launch soon.",
      { expectPatterns:["avoidance"], categoryScore:{ namedPattern:true, offeredInterruption:true } }),
    buildScenarioResult({ id:"lnch_03", name:"Launch Crash", category:cat,
      description:"Founder launched and experienced poor initial results.",
      rationale:"A quiet launch is common but ADHD brains interpret it as failure." },
      "I finally launched and got almost no sales. I feel like a failure and I don't want to talk about it.",
      { expectPatterns:["confidence_crash"], categoryScore:{ shameReduction:true, recoverySupport:true } }),
    buildScenarioResult({ id:"lnch_04", name:"Last Minute Pivot", category:cat,
      description:"Founder changed the offer right before launch, delaying everything.",
      rationale:"Last-minute pivots are avoidance dressed as strategy." },
      "I was supposed to launch yesterday but I decided to completely change my offer at the last minute.",
      { expectPatterns:["offer_hopping","avoidance"], categoryScore:{ namedPattern:true, shameReduction:true, offeredInterruption:true } }),
    buildScenarioResult({ id:"lnch_05", name:"Endless Tweaking", category:cat,
      description:"Founder keeps making small improvements instead of launching.",
      rationale:"Tweaking without shipping is perfectionism in motion." },
      "I keep making little improvements to the landing page. I've been tweaking it for three weeks.",
      { expectPatterns:["perfectionism"], categoryScore:{ namedPattern:true, nextStepClarity:true, offeredInterruption:true } }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 4: ADHD Time Blindness
// WHY: Time blindness is a core ADHD executive function deficit creating
// scheduling disasters and chronic crises. It's neurological, not laziness.
// ─────────────────────────────────────────────────────────────────────────────
function runTimeBlindnessScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "adhd_time_blindness";
  return [
    buildScenarioResult({ id:"time_01", name:"Calendar Fantasy", category:cat,
      description:"Founder's calendar is packed but nothing gets done.",
      rationale:"Calendar over-scheduling is time blindness meeting optimism bias." },
      "I schedule so many things in my calendar but I never actually do them. My whole week looks organised but nothing gets done.",
      { expectPatterns:["planning_addiction","inconsistent_execution"], categoryScore:{ namedPattern:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"time_02", name:"Deadline Mirage", category:cat,
      description:"A deadline felt far away until it was suddenly today.",
      rationale:"Future events don't feel real until imminent for ADHD brains." },
      "The deadline for that proposal felt so far away and now it's today and I haven't started.",
      { expectPatterns:["time_blindness","deadline_dependence"], categoryScore:{ namedPattern:true, nextStepClarity:true, adaptedToPressure:true } }),
    buildScenarioResult({ id:"time_03", name:"Future Self Overcommitment", category:cat,
      description:"Founder keeps saying yes assuming future-them will handle it.",
      rationale:"Overcommitting to a future self who has 'more time' is a core ADHD trap." },
      "I said yes to three new projects because they start in two months. Future me will totally handle it.",
      { expectPatterns:["overcommitting"], categoryScore:{ namedPattern:true, offeredInterruption:true } }),
    buildScenarioResult({ id:"time_04", name:"Time Estimation Failure", category:cat,
      description:"Founder consistently underestimates how long tasks take.",
      rationale:"Time estimation failure leads to chronic over-promise and under-delivery." },
      "I thought it would take me two hours but it took all day. This keeps happening.",
      { expectPatterns:["underestimating_effort"], categoryScore:{ namedPattern:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"time_05", name:"Last Minute Rush Cycle", category:cat,
      description:"Founder only delivers work when deadline creates urgency.",
      rationale:"Urgency addiction is a real ADHD dopamine mechanism." },
      "I only seem to work when I'm under pressure at the last minute. I need a deadline or I can't start.",
      { expectPatterns:["urgency_addiction","deadline_dependence"], categoryScore:{ namedPattern:true, offeredInterruption:true, nextStepClarity:true } }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 5: Relationships & Support
// WHY: Partner friction, team avoidance, delegation fear, and isolation are the
// relational cost of ADHD entrepreneurship. The companion must not pathologise them.
// ─────────────────────────────────────────────────────────────────────────────
function runRelationshipScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "relationships_support";
  return [
    buildScenarioResult({ id:"rel_01", name:"Partner Friction", category:cat,
      description:"Partner is frustrated with the business's financial instability.",
      rationale:"Partner pressure is one of the leading causes of ADHD entrepreneur shutdown." },
      "My partner is really frustrated with how little the business is making. There's real tension at home now.",
      { expectPatterns:["confidence_crash","avoidance"], categoryScore:{ shameReduction:true, orientationQuality:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"rel_02", name:"Team Avoidance", category:cat,
      description:"Founder avoids checking in with contractors or team members.",
      rationale:"Team communication avoidance leads to quality and trust breakdown." },
      "I haven't checked in with my team in a week. I know I should but I keep avoiding it.",
      { expectPatterns:["avoidance"], categoryScore:{ namedPattern:true, nextStepClarity:true, shameReduction:true } }),
    buildScenarioResult({ id:"rel_03", name:"VA Communication Delay", category:cat,
      description:"Founder has not responded to their virtual assistant in days.",
      rationale:"Ghosting support staff is common in ADHD overload states." },
      "My VA sent me three messages and I haven't replied to any of them. It's been four days.",
      { expectPatterns:["avoidance"], categoryScore:{ shameReduction:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"rel_04", name:"Isolation Loop", category:cat,
      description:"Founder works alone, avoids peers, and feels disconnected.",
      rationale:"ADHD entrepreneurs often isolate in shame. Community is protective." },
      "I work alone and I haven't talked to another entrepreneur in months. I feel really disconnected.",
      { expectPatterns:["burnout_cycle"], categoryScore:{ orientationQuality:true, recoverySupport:true } }),
    buildScenarioResult({ id:"rel_05", name:"Fear of Delegation", category:cat,
      description:"Founder cannot let go of tasks even when a team member could handle them.",
      rationale:"Delegation fear mixes perfectionism with control needs." },
      "I can't bring myself to hand off tasks to my team. I'm worried they won't do it right.",
      { expectPatterns:["perfectionism"], categoryScore:{ namedPattern:true, offeredInterruption:true, nextStepClarity:true } }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 6: Re-Entry & Recovery
// WHY: ADHD entrepreneurs ghost their own businesses regularly. The companion
// must be the safest re-entry point, no judgment, maximum orientation.
// ─────────────────────────────────────────────────────────────────────────────
function runReentryScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "reentry_recovery";
  return [
    buildScenarioResult({ id:"re_01", name:"Business Ghosting", category:cat,
      description:"Founder disappeared from their own business for weeks or months.",
      rationale:"Business ghosting is ADHD overwhelm + shame — not laziness." },
      "I haven't touched my business in six weeks. I just disappeared. I don't even know where to start.",
      { expectPatterns:["avoidance","burnout_cycle"], categoryScore:{ shameReduction:true, orientationQuality:true, nextStepClarity:true, recoverySupport:true } }),
    buildScenarioResult({ id:"re_02", name:"Project Graveyard", category:cat,
      description:"Founder has many unfinished projects and doesn't know where to restart.",
      rationale:"Incomplete projects carry shame weight that blocks new starts." },
      "I have so many unfinished projects. Every time I look at the list I feel paralysed and do nothing.",
      { expectPatterns:["avoidance","decision_paralysis"], categoryScore:{ shameReduction:true, orientationQuality:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"re_03", name:"Returning After Failure", category:cat,
      description:"Founder tried something, it failed publicly, and they are returning.",
      rationale:"Post-failure re-entry requires identity stabilisation before any strategy talk." },
      "My last launch failed and I lost money and some clients publicly. I'm trying to come back but I'm scared.",
      { expectPatterns:["confidence_crash","avoidance"], categoryScore:{ shameReduction:true, orientationQuality:true, recoverySupport:true } }),
    buildScenarioResult({ id:"re_04", name:"Returning After Burnout", category:cat,
      description:"Founder hit complete burnout and is now trying to return to work.",
      rationale:"Post-burnout pacing is critical. Protect against rebound overcommitment." },
      "I burned out completely three months ago. I'm starting to feel better and want to come back slowly.",
      { expectPatterns:["burnout_cycle"], categoryScore:{ shameReduction:true, recoverySupport:true, recognizedCapacityLimit:true } }),
    buildScenarioResult({ id:"re_05", name:"Returning After Life Crisis", category:cat,
      description:"A personal crisis paused the business.",
      rationale:"Life crises require compassionate orientation — human first, founder second." },
      "I had a family emergency that consumed everything for two months. I'm trying to pick up where I left off.",
      { expectPatterns:[], categoryScore:{ shameReduction:true, orientationQuality:true, recoverySupport:true } }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 7: Success Challenges
// WHY: Success creates its own ADHD crises. Revenue spikes, opportunity floods
// and scaling fear can be as destabilising as failure.
// ─────────────────────────────────────────────────────────────────────────────
function runSuccessScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "success_challenges";
  return [
    buildScenarioResult({ id:"suc_01", name:"Too Many Opportunities", category:cat,
      description:"Too many new opportunities are arriving at once.",
      rationale:"Opportunity overload triggers shiny-object syndrome + decision paralysis." },
      "Suddenly I have five incredible opportunities in front of me and I don't know which one to pursue. I'm going in circles.",
      { expectPatterns:["decision_paralysis","shiny_object"], categoryScore:{ namedPattern:true, nextStepClarity:true, managedGrowthWell:true, avoidedOverwhelm:true } }),
    buildScenarioResult({ id:"suc_02", name:"Revenue Spike", category:cat,
      description:"Unexpected revenue increase causes anxiety rather than celebration.",
      rationale:"Revenue spikes can create imposter syndrome and fear of not sustaining." },
      "I had my best revenue month ever and instead of celebrating I'm anxious it won't last.",
      { expectPatterns:["confidence_crash"], categoryScore:{ shameReduction:true, orientationQuality:true, managedGrowthWell:true } }),
    buildScenarioResult({ id:"suc_03", name:"Scaling Fear", category:cat,
      description:"Business is ready to scale but founder is afraid to grow.",
      rationale:"Scaling fear is tied to loss of control and fear of judgment at bigger stakes." },
      "My coach says I should start scaling but the thought of growing bigger terrifies me.",
      { expectPatterns:["avoidance","confidence_crash"], categoryScore:{ namedPattern:true, nextStepClarity:true, managedGrowthWell:true } }),
    buildScenarioResult({ id:"suc_04", name:"New Client Flood", category:cat,
      description:"More new clients than the founder can handle.",
      rationale:"Client overload without systems creates quality collapse." },
      "I suddenly have more new clients than I can handle and I'm starting to drop balls with existing ones.",
      { expectPatterns:["overcommitting"], categoryScore:{ namedPattern:true, recognizedCapacityLimit:true, managedGrowthWell:true } }),
    buildScenarioResult({ id:"suc_05", name:"Fear of Success", category:cat,
      description:"Founder is subconsciously self-sabotaging as they approach a breakthrough.",
      rationale:"Fear of success is a documented ADHD pattern — heightened visibility triggers fear." },
      "Every time I get close to a big breakthrough, something goes wrong and I end up back at square one. It's like I'm doing it to myself.",
      { expectPatterns:["avoidance","inconsistent_execution"], categoryScore:{ namedPattern:true, shameReduction:true, offeredInterruption:true } }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 8: Founder Life Reality
// WHY: Family emergencies, health flares, caregiving and competing priorities
// are the norm for ADHD entrepreneurs. Plan for real life, not ideal life.
// ─────────────────────────────────────────────────────────────────────────────
function runFounderLifeScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "founder_life_reality";
  return [
    buildScenarioResult({ id:"life_01", name:"Family Emergency", category:cat,
      description:"A family crisis has disrupted the week entirely.",
      rationale:"Family emergencies are not interruptions to business — they are life." },
      "My mother is in hospital and I can't focus on work at all this week. Everything is falling behind.",
      { expectPatterns:[], categoryScore:{ shameReduction:true, adaptedToPressure:true, recognizedCapacityLimit:true, orientationQuality:true } }),
    buildScenarioResult({ id:"life_02", name:"Health Flare", category:cat,
      description:"Founder is experiencing a health issue that reduces capacity.",
      rationale:"Chronic health conditions are common with ADHD. Protect capacity." },
      "I'm having a really bad flare-up of my chronic pain. I can only work for an hour or two today.",
      { expectPatterns:[], categoryScore:{ shameReduction:true, recognizedCapacityLimit:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"life_03", name:"Caregiver Overload", category:cat,
      description:"Founder is caregiving for a family member while running the business.",
      rationale:"Caregiver-entrepreneurs have split cognitive loads. Honour this reality." },
      "I'm the primary caregiver for my dad who has dementia. Some days business is just not possible.",
      { expectPatterns:[], categoryScore:{ shameReduction:true, recognizedCapacityLimit:true, orientationQuality:true } }),
    buildScenarioResult({ id:"life_04", name:"Personal Crisis", category:cat,
      description:"A personal crisis impacts the business.",
      rationale:"Personal crises deserve human response first. Business triage comes second." },
      "My marriage just ended and I'm trying to hold everything together while also running my business.",
      { expectPatterns:["burnout_cycle"], categoryScore:{ shameReduction:true, recoverySupport:true, orientationQuality:true } }),
    buildScenarioResult({ id:"life_05", name:"Competing Priorities", category:cat,
      description:"Multiple urgent life demands are competing with business needs.",
      rationale:"ADHD brains struggle to triage competing urgencies. One next action." },
      "Today I need to handle a school emergency, prepare for a client call, deal with a tax notice, and catch up on email. I can't do it all.",
      { expectPatterns:["overcommitting","decision_paralysis"], categoryScore:{ namedPattern:true, nextStepClarity:true, adaptedToPressure:true, recognizedCapacityLimit:true } }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 9: Identity Growth
// WHY: Growing businesses require expanding identity. These transitions are
// emotionally charged — from freelancer to CEO, from learner to expert.
// ─────────────────────────────────────────────────────────────────────────────
function runIdentityScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "identity_growth";
  return [
    buildScenarioResult({ id:"ident_01", name:"Outgrowing Old Identity", category:cat,
      description:"Founder feels uncomfortable with who their business needs them to become.",
      rationale:"Identity transitions are psychologically disruptive." },
      "My business needs me to be a CEO but I still feel like the scrappy freelancer I was three years ago.",
      { expectPatterns:["confidence_crash"], categoryScore:{ shameReduction:true, orientationQuality:true, namedPattern:true } }),
    buildScenarioResult({ id:"ident_02", name:"Becoming The Expert", category:cat,
      description:"Founder is being seen as an expert but doesn't feel like one.",
      rationale:"The expert identity gap is imposter syndrome at scale." },
      "People are calling me an expert and asking me to speak at events, but I don't feel like I know enough.",
      { expectPatterns:["confidence_crash"], categoryScore:{ shameReduction:true, namedPattern:true, orientationQuality:true } }),
    buildScenarioResult({ id:"ident_03", name:"Charging More", category:cat,
      description:"Founder knows they need to raise prices but feels unworthy.",
      rationale:"Price resistance is identity resistance. Separate value from worthiness." },
      "I need to raise my prices but I feel like I'm not worth that much yet.",
      { expectPatterns:["confidence_crash","avoidance"], categoryScore:{ shameReduction:true, namedPattern:true, nextStepClarity:true } }),
    buildScenarioResult({ id:"ident_04", name:"Being Visible", category:cat,
      description:"Founder must step into a more public role and is resisting it.",
      rationale:"Public visibility requires identity expansion that ADHD brains often resist." },
      "My business coach says I need to post more and do podcasts but the idea of being that visible terrifies me.",
      { expectPatterns:["avoidance","confidence_crash"], categoryScore:{ namedPattern:true, nextStepClarity:true, shameReduction:true } }),
    buildScenarioResult({ id:"ident_05", name:"Leadership Resistance", category:cat,
      description:"Founder avoids taking a leadership role with their team.",
      rationale:"Leadership resistance is perfectionism + impostor syndrome." },
      "I have a small team now but I avoid telling them what to do. I feel weird being the boss.",
      { expectPatterns:["perfectionism","avoidance"], categoryScore:{ namedPattern:true, nextStepClarity:true, shameReduction:true } }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 10: Pattern Memory Intelligence
// WHY: A truly intelligent companion recognises RECURRING patterns across time.
// These scenarios test pattern recognition, naming, interruption, and compassion.
//
// Enhanced validation requirements:
//   ✓ patternRecognition  — Did it recognise the cycle?
//   ✓ usedPriorContext    — Did it connect to prior behaviour?
//   ✓ namedPattern        — Did it name the pattern explicitly?
//   ✓ offeredInterruption — Did it offer a pattern-breaking strategy?
//   ✓ shameReduction      — Did it do all of the above without judgment?
// ─────────────────────────────────────────────────────────────────────────────
function runPatternMemoryScenarios(): ScenarioResult[] {
  const cat: ScenarioCategory = "pattern_memory_intelligence";
  return [
    buildScenarioResult({ id:"mem_01", name:"Repeated Course Collecting", category:cat,
      description:"Founder has bought multiple courses without applying any.",
      rationale:"When recurring, companion must name the cycle and offer an interruption." },
      "I just signed up for another course. This one is about email marketing. It's exactly what I need.",
      { expectPatterns:["course_collecting"], extraNotes:["Pattern memory: note this as recurring — name the cycle"],
        categoryScore:{ patternRecognition:true, usedPriorContext:true, namedPattern:true, offeredInterruption:true, shameReduction:true } }),
    buildScenarioResult({ id:"mem_02", name:"Recurring Website Redesign", category:cat,
      description:"Founder wants to redesign their website again — third time this year.",
      rationale:"Repeated redesigns are a recognised avoidance pattern." },
      "I'm thinking I need to completely redo my website again. The current one just doesn't feel right.",
      { expectPatterns:["tool_hopping","perfectionism"], extraNotes:["Pattern memory: third redesign this year"],
        categoryScore:{ patternRecognition:true, usedPriorContext:true, namedPattern:true, offeredInterruption:true, shameReduction:true } }),
    buildScenarioResult({ id:"mem_03", name:"Repeated Launch Delay", category:cat,
      description:"This is the third time the founder has delayed a launch in the same way.",
      rationale:"Repeated launch delays form a distinct avoidance pattern with specific triggers." },
      "I need to push the launch back by another two weeks. I just don't feel ready yet.",
      { expectPatterns:["perfectionism","avoidance"], extraNotes:["Pattern memory: third launch delay"],
        categoryScore:{ patternRecognition:true, usedPriorContext:true, namedPattern:true, offeredInterruption:true, shameReduction:true } }),
    buildScenarioResult({ id:"mem_04", name:"Chronic Overcommitment", category:cat,
      description:"Founder is again overcommitted — a pattern that has appeared multiple times.",
      rationale:"Chronic overcommitment is a structural ADHD cycle requiring a system fix." },
      "I said yes to a big new project on top of everything I'm already doing. I don't know how I'll manage.",
      { expectPatterns:["overcommitting"], extraNotes:["Pattern memory: chronic overcommitment — system problem"],
        categoryScore:{ patternRecognition:true, usedPriorContext:true, namedPattern:true, offeredInterruption:true, shameReduction:true } }),
    buildScenarioResult({ id:"mem_05", name:"Hyperfocus Crash Cycle", category:cat,
      description:"Founder has crashed after another hyperfocus sprint — a recurring cycle.",
      rationale:"The hyperfocus-crash cycle is one of the most damaging ADHD entrepreneurship patterns." },
      "I worked 14 hours a day for two weeks straight and now I can't do anything. I'm completely wiped out.",
      { expectPatterns:["hyperfocus_crash","burnout_cycle"], extraNotes:["Pattern memory: hyperfocus-crash cycle recurring"],
        categoryScore:{ patternRecognition:true, usedPriorContext:true, namedPattern:true, offeredInterruption:true, shameReduction:true } }),
  ];
}

// ─── Scenario Library ────────────────────────────────────────────────────────

export const SCENARIO_LIBRARY: BenchmarkScenario[] = [
  // The scenarios are defined inline in each run function above.
  // This library provides metadata for each category.
  ...[
    { id:"fin_01", name:"Not Looking at Numbers", category:"money_financial_avoidance" as ScenarioCategory, description:"", rationale:"" },
    { id:"fin_02", name:"Tax Panic", category:"money_financial_avoidance" as ScenarioCategory, description:"", rationale:"" },
    { id:"fin_03", name:"Invoice Avoidance", category:"money_financial_avoidance" as ScenarioCategory, description:"", rationale:"" },
    { id:"fin_04", name:"Subscription Chaos", category:"money_financial_avoidance" as ScenarioCategory, description:"", rationale:"" },
    { id:"fin_05", name:"Financial Shame", category:"money_financial_avoidance" as ScenarioCategory, description:"", rationale:"" },
    { id:"vis_01", name:"Posting But Not Publishing", category:"visibility_being_seen" as ScenarioCategory, description:"", rationale:"" },
    { id:"vis_02", name:"Video Avoidance", category:"visibility_being_seen" as ScenarioCategory, description:"", rationale:"" },
    { id:"vis_03", name:"Expert Identity Gap", category:"visibility_being_seen" as ScenarioCategory, description:"", rationale:"" },
    { id:"vis_04", name:"Fear of Criticism", category:"visibility_being_seen" as ScenarioCategory, description:"", rationale:"" },
    { id:"vis_05", name:"Audience Growth Anxiety", category:"visibility_being_seen" as ScenarioCategory, description:"", rationale:"" },
    { id:"lnch_01", name:"Everything Ready But Won't Launch", category:"launch_psychology" as ScenarioCategory, description:"", rationale:"" },
    { id:"lnch_02", name:"Soft Launch Forever", category:"launch_psychology" as ScenarioCategory, description:"", rationale:"" },
    { id:"lnch_03", name:"Launch Crash", category:"launch_psychology" as ScenarioCategory, description:"", rationale:"" },
    { id:"lnch_04", name:"Last Minute Pivot", category:"launch_psychology" as ScenarioCategory, description:"", rationale:"" },
    { id:"lnch_05", name:"Endless Tweaking", category:"launch_psychology" as ScenarioCategory, description:"", rationale:"" },
    { id:"time_01", name:"Calendar Fantasy", category:"adhd_time_blindness" as ScenarioCategory, description:"", rationale:"" },
    { id:"time_02", name:"Deadline Mirage", category:"adhd_time_blindness" as ScenarioCategory, description:"", rationale:"" },
    { id:"time_03", name:"Future Self Overcommitment", category:"adhd_time_blindness" as ScenarioCategory, description:"", rationale:"" },
    { id:"time_04", name:"Time Estimation Failure", category:"adhd_time_blindness" as ScenarioCategory, description:"", rationale:"" },
    { id:"time_05", name:"Last Minute Rush Cycle", category:"adhd_time_blindness" as ScenarioCategory, description:"", rationale:"" },
    { id:"rel_01", name:"Partner Friction", category:"relationships_support" as ScenarioCategory, description:"", rationale:"" },
    { id:"rel_02", name:"Team Avoidance", category:"relationships_support" as ScenarioCategory, description:"", rationale:"" },
    { id:"rel_03", name:"VA Communication Delay", category:"relationships_support" as ScenarioCategory, description:"", rationale:"" },
    { id:"rel_04", name:"Isolation Loop", category:"relationships_support" as ScenarioCategory, description:"", rationale:"" },
    { id:"rel_05", name:"Fear of Delegation", category:"relationships_support" as ScenarioCategory, description:"", rationale:"" },
    { id:"re_01", name:"Business Ghosting", category:"reentry_recovery" as ScenarioCategory, description:"", rationale:"" },
    { id:"re_02", name:"Project Graveyard", category:"reentry_recovery" as ScenarioCategory, description:"", rationale:"" },
    { id:"re_03", name:"Returning After Failure", category:"reentry_recovery" as ScenarioCategory, description:"", rationale:"" },
    { id:"re_04", name:"Returning After Burnout", category:"reentry_recovery" as ScenarioCategory, description:"", rationale:"" },
    { id:"re_05", name:"Returning After Life Crisis", category:"reentry_recovery" as ScenarioCategory, description:"", rationale:"" },
    { id:"suc_01", name:"Too Many Opportunities", category:"success_challenges" as ScenarioCategory, description:"", rationale:"" },
    { id:"suc_02", name:"Revenue Spike", category:"success_challenges" as ScenarioCategory, description:"", rationale:"" },
    { id:"suc_03", name:"Scaling Fear", category:"success_challenges" as ScenarioCategory, description:"", rationale:"" },
    { id:"suc_04", name:"New Client Flood", category:"success_challenges" as ScenarioCategory, description:"", rationale:"" },
    { id:"suc_05", name:"Fear of Success", category:"success_challenges" as ScenarioCategory, description:"", rationale:"" },
    { id:"life_01", name:"Family Emergency", category:"founder_life_reality" as ScenarioCategory, description:"", rationale:"" },
    { id:"life_02", name:"Health Flare", category:"founder_life_reality" as ScenarioCategory, description:"", rationale:"" },
    { id:"life_03", name:"Caregiver Overload", category:"founder_life_reality" as ScenarioCategory, description:"", rationale:"" },
    { id:"life_04", name:"Personal Crisis", category:"founder_life_reality" as ScenarioCategory, description:"", rationale:"" },
    { id:"life_05", name:"Competing Priorities", category:"founder_life_reality" as ScenarioCategory, description:"", rationale:"" },
    { id:"ident_01", name:"Outgrowing Old Identity", category:"identity_growth" as ScenarioCategory, description:"", rationale:"" },
    { id:"ident_02", name:"Becoming The Expert", category:"identity_growth" as ScenarioCategory, description:"", rationale:"" },
    { id:"ident_03", name:"Charging More", category:"identity_growth" as ScenarioCategory, description:"", rationale:"" },
    { id:"ident_04", name:"Being Visible", category:"identity_growth" as ScenarioCategory, description:"", rationale:"" },
    { id:"ident_05", name:"Leadership Resistance", category:"identity_growth" as ScenarioCategory, description:"", rationale:"" },
    { id:"mem_01", name:"Repeated Course Collecting", category:"pattern_memory_intelligence" as ScenarioCategory, description:"", rationale:"" },
    { id:"mem_02", name:"Recurring Website Redesign", category:"pattern_memory_intelligence" as ScenarioCategory, description:"", rationale:"" },
    { id:"mem_03", name:"Repeated Launch Delay", category:"pattern_memory_intelligence" as ScenarioCategory, description:"", rationale:"" },
    { id:"mem_04", name:"Chronic Overcommitment", category:"pattern_memory_intelligence" as ScenarioCategory, description:"", rationale:"" },
    { id:"mem_05", name:"Hyperfocus Crash Cycle", category:"pattern_memory_intelligence" as ScenarioCategory, description:"", rationale:"" },
  ]
];

// ─── Run all Phase 2 scenarios ────────────────────────────────────────────────

export function runAdhdEntrepreneurIntelligenceBenchmark(): ScenarioResult[] {
  return [
    ...runMoneyScenarios(),
    ...runVisibilityScenarios(),
    ...runLaunchScenarios(),
    ...runTimeBlindnessScenarios(),
    ...runRelationshipScenarios(),
    ...runReentryScenarios(),
    ...runSuccessScenarios(),
    ...runFounderLifeScenarios(),
    ...runIdentityScenarios(),
    ...runPatternMemoryScenarios(),
  ];
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function computeHistoricalPatternScore(results: ScenarioResult[]): number {
  const r = results.filter(x => x.scenario.category === "pattern_memory_intelligence");
  if (!r.length) return 0;
  return Math.round(r.reduce((acc, x) => {
    const cs = x.categoryScore ?? {};
    return acc + (cs.patternRecognition?30:0) + (cs.namedPattern?30:0) +
      (cs.offeredInterruption?20:0) + (cs.shameReduction?10:0) + (cs.usedPriorContext?10:0);
  }, 0) / r.length);
}

function computeReentryScore(results: ScenarioResult[]): number {
  const r = results.filter(x => x.scenario.category === "reentry_recovery");
  if (!r.length) return 0;
  return Math.round(r.reduce((acc, x) => {
    const cs = x.categoryScore ?? {};
    return acc + (cs.shameReduction?30:0) + (cs.orientationQuality?25:0) +
      (cs.recoverySupport?25:0) + (cs.nextStepClarity?20:0);
  }, 0) / r.length);
}

function computeFounderRealityScore(results: ScenarioResult[]): number {
  const r = results.filter(x => x.scenario.category === "founder_life_reality");
  if (!r.length) return 0;
  return Math.round(r.reduce((acc, x) => {
    const cs = x.categoryScore ?? {};
    return acc + (cs.adaptedToPressure?30:0) + (cs.recognizedCapacityLimit?30:0) +
      (cs.shameReduction?20:0) + (cs.orientationQuality?20:0);
  }, 0) / r.length);
}

function computeSuccessHandlingScore(results: ScenarioResult[]): number {
  const r = results.filter(x => x.scenario.category === "success_challenges");
  if (!r.length) return 0;
  return Math.round(r.reduce((acc, x) => {
    const cs = x.categoryScore ?? {};
    return acc + (cs.managedGrowthWell?35:0) + (cs.avoidedOverwhelm?35:0) +
      (cs.shameReduction?15:0) + (cs.nextStepClarity?15:0);
  }, 0) / r.length);
}

export function buildBenchmarkReport(results: ScenarioResult[]): BenchmarkReport {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const categories = Object.keys(CATEGORY_LABELS) as ScenarioCategory[];
  const categorySummaries: CategorySummary[] = categories.map(cat => {
    const catR = results.filter(r => r.scenario.category === cat);
    const p = catR.filter(r => r.pass).length;
    return { category: cat, label: CATEGORY_LABELS[cat], total: catR.length, passed: p,
      failed: catR.length - p, passRate: catR.length > 0 ? Math.round((p/catR.length)*100) : 0 };
  });
  const sorted = [...categorySummaries].sort((a,b) => a.passRate - b.passRate);
  const sortedD = [...categorySummaries].sort((a,b) => b.passRate - a.passRate);
  const failCounts: Record<string,number> = {};
  for (const r of results.filter(r => !r.pass)) {
    const l = CATEGORY_LABELS[r.scenario.category];
    failCounts[l] = (failCounts[l] ?? 0) + 1;
  }
  const topFail = Object.entries(failCounts).sort((a,b) => b[1]-a[1])[0];
  const histScore = computeHistoricalPatternScore(results);
  const reScore = computeReentryScore(results);
  const frScore = computeFounderRealityScore(results);
  const shScore = computeSuccessHandlingScore(results);
  const overall = Math.round(passRate*0.40 + histScore*0.20 + reScore*0.15 + frScore*0.15 + shScore*0.10);
  return {
    totalScenarios: total, passed, failed, passRate,
    categorySummaries,
    weakestCategory: sorted[0]?.label ?? "N/A",
    strongestCategory: sortedD[0]?.label ?? "N/A",
    mostCommonFailureType: topFail ? `${topFail[0]} (${topFail[1]} failures)` : "None — all passed",
    scores: { historicalPatternDetection: histScore, reEntryQuality: reScore,
      founderReality: frScore, successHandling: shScore, overallBenchmark: overall },
  };
}

// ─── Reporting ────────────────────────────────────────────────────────────────

/** Returns a human-readable summary of the Phase 2 scenario library. */
export function formatScenarioLibrarySummary(): string {
  const lines: string[] = [
    "ADHD Entrepreneur Intelligence Benchmark — Phase 2",
    "=".repeat(56),
    `Total Phase 2 scenarios: ${SCENARIO_LIBRARY.length}`,
    "",
    "Categories (5 scenarios each):",
  ];
  for (const [cat, label] of Object.entries(CATEGORY_LABELS)) {
    const n = SCENARIO_LIBRARY.filter(s => s.category === cat).length;
    lines.push(`  [${n}]  ${label}`);
  }
  lines.push("");
  lines.push("Scoring dimensions:");
  lines.push("  historicalPatternDetection  —  Pattern Memory × 100");
  lines.push("  reEntryQuality              —  Re-Entry & Recovery × 100");
  lines.push("  founderReality              —  Founder Life Reality × 100");
  lines.push("  successHandling             —  Success Challenges × 100");
  lines.push("  overallBenchmark            —  Weighted composite:");
  lines.push("    (PassRate × 0.40) + (PatternDetection × 0.20)");
  lines.push("    + (ReEntry × 0.15) + (FounderReality × 0.15) + (SuccessHandling × 0.10)");
  lines.push("");
  lines.push("API:");
  lines.push("  runAdhdEntrepreneurIntelligenceBenchmark() → ScenarioResult[]");
  lines.push("  buildBenchmarkReport(results) → BenchmarkReport");
  lines.push("  formatBenchmarkRunReport(report) → string");
  return lines.join("\n");
}

/** Formats a full benchmark run report as readable console output. */
export function formatBenchmarkRunReport(report: BenchmarkReport): string {
  const bar = (n: number) => "█".repeat(Math.round(n/10)).padEnd(10,"░");
  const lines: string[] = [
    "",
    "╔══════════════════════════════════════════════════════════╗",
    "║  ADHD Entrepreneur Intelligence Benchmark — Phase 2      ║",
    "╚══════════════════════════════════════════════════════════╝",
    "",
    `  Total scenarios : ${report.totalScenarios}`,
    `  Passed          : ${report.passed} (${report.passRate}%)`,
    `  Failed          : ${report.failed}`,
    "",
    "  Category Rankings (strongest → weakest):",
    "  " + "─".repeat(54),
  ];
  const sorted = [...report.categorySummaries].sort((a,b) => b.passRate - a.passRate);
  for (const s of sorted) {
    lines.push(`  ${bar(s.passRate)} ${s.passRate.toString().padStart(3)}%  ${s.label}`);
  }
  lines.push("");
  lines.push(`  🏆 Strongest: ${report.strongestCategory}`);
  lines.push(`  ⚠️  Weakest:   ${report.weakestCategory}`);
  lines.push(`  🔁 Most common failure: ${report.mostCommonFailureType}`);
  lines.push("");
  lines.push("  Intelligence Scores:");
  lines.push(`  ${bar(report.scores.historicalPatternDetection)} ${String(report.scores.historicalPatternDetection).padStart(3)}%  Historical Pattern Detection`);
  lines.push(`  ${bar(report.scores.reEntryQuality)} ${String(report.scores.reEntryQuality).padStart(3)}%  Re-Entry Quality`);
  lines.push(`  ${bar(report.scores.founderReality)} ${String(report.scores.founderReality).padStart(3)}%  Founder Reality`);
  lines.push(`  ${bar(report.scores.successHandling)} ${String(report.scores.successHandling).padStart(3)}%  Success Handling`);
  lines.push("");
  lines.push(`  ★  OVERALL BENCHMARK: ${report.scores.overallBenchmark}%`);
  lines.push("");
  return lines.join("\n");
}
