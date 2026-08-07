/**
 * Canonical Chamber Expert Registry™ — Phase A.
 *
 * Compiled digest of the 24 Chamber Expert Intelligence Profiles
 * (docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles/).
 * This is the single source of truth for Chamber expert identity going
 * forward — see docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md §1.3.
 *
 * Phase A only: this file is data. It is not imported by the chat runtime
 * and does not change any conversation behavior on its own.
 *
 * Field notes:
 * - `activationSignals` are short, compiled trigger phrases derived from
 *   each profile's §0 "Invite when" line — not verbatim copy, since those
 *   are narrative prose written for humans. Kept short for matching.
 * - `expertiseAreas` are taken directly from each profile's §3 "Core
 *   expertise" line.
 * - `outcomeSignals` (V2-2) are a second, deliverable/outcome-shaped
 *   vocabulary — see types.ts's field doc and
 *   docs/estate/CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md §2/§3. Only
 *   authored where a real activation gap was found (Finance, Marketing,
 *   Systems, People & Culture) — empty for the rest, consistent with
 *   keeping the remaining 21 experts' deeper migration (I-4) deferred.
 * - `expertCategory` (V2-2) is "generalist" for Strategy, Momentum, and
 *   Horizons (meta/direction-setting) and "specialist" for everyone else
 *   — a tiebreak-only input, never a scoring multiplier. See
 *   docs/estate/CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md §5.2.
 * - `founderPlainLanguagePhrase` (V2-2) is a short, plain-language phrase
 *   naming what this expert helps a founder DO — used only when building
 *   an "insufficient evidence" clarifying question, never in a normal
 *   hint. See docs/estate/CHAMBER_ACTIVATION_DECISION_TABLE.md.
 * - `supportingRelationships` are curated from each profile's §11
 *   Cross-Chamber Collaboration section, ordered by general relevance —
 *   this order matters (see resolveChamberExpertActivation.ts).
 * - `intentAffinities` / `estateCategories` connect this registry to the
 *   *existing* Work Recognition signals (lib/intentRoutingIntelligence.ts,
 *   lib/estateBrain/intelligenceTypes.ts) rather than inventing new ones.
 */

import type {
  ChamberExpertId,
  ChamberExpertRegistryEntry,
} from "./types";
import { CHAMBER_EXPERT_IDS } from "./types";

/** Lightweight domain grouping — a lookup convenience, not a routing signal. */
export type ChamberExpertCategory =
  | "strategy"
  | "operations"
  | "marketing"
  | "sales_growth"
  | "finance"
  | "people"
  | "technology"
  | "research_learning"
  | "momentum_wellbeing"
  | "events";

const PROFILE_DIR =
  "docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles";

function profilePath(fileName: string): string {
  return `${PROFILE_DIR}/${fileName}`;
}

export type ChamberExpertRegistryEntryWithCategory = ChamberExpertRegistryEntry & {
  category: ChamberExpertCategory;
};

export const CHAMBER_EXPERT_REGISTRY: readonly ChamberExpertRegistryEntryWithCategory[] = [
  {
    id: "STR",
    name: "Strategy Intelligence",
    category: "strategy",
    expertThinkingPattern:
      "Notices when busy has quietly replaced chosen. Names the one bet worth protecting, then defends it against every equally-interesting alternative.",
    activationSignals: [
      "unclear direction",
      "too many priorities",
      "what should i focus on",
      "choosing between paths",
      "growth strategy",
      "strategic plan",
      "business strategy",
      "direction for the business",
      "growth plan",
      "strategy",
      "priorities",
      "which one to focus on",
      "different offers",
      "too many offers",
    ],
    expertiseAreas: [
      "Opportunity filtering",
      "goal hierarchy",
      "competitive positioning at founder scale",
      "resource allocation",
      "strategic tradeoffs",
      "vision to weekly action bridge",
    ],
    expertCategory: "generalist",
    founderPlainLanguagePhrase: "deciding the direction",
    supportingRelationships: ["SYS", "FIN", "MKT"],
    possibleRelationships: ["PM"],
    intentAffinities: ["decide", "plan", "build"],
    estateCategories: ["business"],
    profilePath: profilePath("STR_Expert_Intelligence_Profile.md"),
  },
  {
    id: "SYS",
    name: "Systems Intelligence",
    category: "operations",
    expertThinkingPattern:
      "Notices friction before the founder names it. Reduces repeated decisions into a written path. Creates the repeatable route once, so willpower is never the plan again.",
    activationSignals: [
      "onboarding process",
      "create a process",
      "document a process",
      "build a system",
      "standard process",
      "same process every time",
      "workflow",
      "checklist",
      "sop",
      "system",
      "handoffs fail",
      "hand off a task",
      "tools multiply",
      "tools talk to each other",
      "wing it differently every time",
      "same steps every time",
      "explain the process",
    ],
    expertiseAreas: [
      "Repeatable steps and process design",
      "checklist architecture",
      "handoff design",
      "documentation of what happens before, during, and after the work",
      "exception handling",
      "tooling for flow",
      "quality gates",
      "delegation readiness",
    ],
    outcomeSignals: [
      "written down how we work",
      "document how we work",
      "write down our process",
      "put our process in writing",
      "how we do things isn't written down",
      "figure out how we operate",
      "how we actually operate",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "creating the system",
    supportingRelationships: ["CR"],
    possibleRelationships: ["KMG", "PM"],
    intentAffinities: ["build", "organize", "execute"],
    estateCategories: ["business"],
    profilePath: profilePath("SYS_Expert_Intelligence_Profile.md"),
  },
  {
    id: "MKT",
    name: "Marketing Intelligence",
    category: "marketing",
    expertThinkingPattern:
      "Notices when a message is technically true but unclear to a stranger. Connects what the audience actually needs to what the offer already provides — before reaching for more channels.",
    activationSignals: [
      "marketing strategy",
      "marketing plan",
      "get noticed",
      "visibility strategy",
      "launch plan",
      "marketing",
      "visibility",
      "audience",
      "campaign",
      "launch",
      "nobody knows i exist",
      "what to post",
      "know what to post",
      "wipes me out",
      "launch fatigue",
      "promote my workshop",
      "promoting my workshop",
      "help promoting",
    ],
    expertiseAreas: [
      "Audience clarity",
      "positioning",
      "channel strategy",
      "offer messaging and message clarity",
      "testing and simple measurement",
      "campaign design",
      "launch architecture",
      "nurture",
      "proof and trust assets",
    ],
    outcomeSignals: [
      "how to market it",
      "how to market this",
      "get the word out",
      "figure out marketing",
      "how to sell it",
      "how to sell this",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "getting customers",
    supportingRelationships: ["STR", "CR"],
    possibleRelationships: ["CNT", "SALES"],
    intentAffinities: ["plan", "build"],
    estateCategories: ["business", "create"],
    profilePath: profilePath("MKT_Expert_Intelligence_Profile.md"),
  },
  {
    id: "CR",
    name: "Client Relationships Intelligence",
    category: "people",
    expertThinkingPattern:
      "Notices the gap between what the client was told and what they now expect. Repairs trust with a small honest update before it becomes a bigger silence.",
    activationSignals: [
      "client onboarding",
      "new client experience",
      "onboarding experience",
      "client journey",
      "welcome a new client",
      "client chaos",
      "unclear expectations",
      "ghosted a client",
      "clients ghosting",
      "keep ghosting me",
      "clients not staying",
      "clients not engaged",
      "client retention",
      "clients leaving",
      "why clients leave",
    ],
    expertiseAreas: [
      "Trust building",
      "client avatar / ICP",
      "journey moments and member experience",
      "onboarding",
      "status communication",
      "feedback loops",
      "retention",
      "referrals",
      "repair after misses",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "keeping clients happy",
    supportingRelationships: ["STR", "MKT"],
    possibleRelationships: ["SYS", "SALES", "PC"],
    intentAffinities: ["organize", "execute", "understand", "decide"],
    estateCategories: ["business"],
    profilePath: profilePath("CR_Expert_Intelligence_Profile.md"),
  },
  {
    id: "FIN",
    name: "Finance Intelligence",
    category: "finance",
    expertThinkingPattern:
      "Notices when growth is being funded by avoidance instead of margin. Protects the founder's resources before protecting the plan's ambition.",
    activationSignals: [
      "pricing fear",
      "runway anxiety",
      "avoiding numbers",
      "am i making money",
      "offer pricing",
      "spending vs investing",
      "cash flow",
    ],
    expertiseAreas: [
      "Offer pricing",
      "package economics",
      "cash flow awareness",
      "simple P&L story",
      "runway",
      "cost of delivery",
      "hire or invest thresholds",
    ],
    outcomeSignals: [
      "stuck on pricing",
      "what to charge",
      "how much to charge",
      "figure out pricing",
      "don't know what to charge",
      "pricing my offer",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "sorting out the money",
    supportingRelationships: ["STR", "SALES"],
    possibleRelationships: ["SYS", "PM"],
    intentAffinities: ["decide", "understand"],
    estateCategories: ["business"],
    profilePath: profilePath("FIN_Expert_Intelligence_Profile.md"),
  },
  {
    id: "SALES",
    name: "Sales Intelligence",
    category: "sales_growth",
    expertThinkingPattern:
      "Notices the moment interest stops being guided toward a real decision. Hears when a founder is explaining value instead of learning what the buyer still needs to trust. Turns follow-up into a clear, kind next step before the lead goes cold.",
    activationSignals: [
      "hate selling",
      "hate sales calls",
      "sales conversation",
      "leads go cold",
      "discovery call",
      "follow up",
      "feels pushy",
      "feel pushy",
      "close the sale",
    ],
    expertiseAreas: [
      "Discovery calls",
      "buyer readiness",
      "value articulation",
      "offer-fit diagnosis",
      "objection handling",
      "ethical closing",
      "follow-up design",
      "sales pipeline hygiene",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "closing the sale",
    supportingRelationships: ["MKT", "CNT"],
    possibleRelationships: ["CR", "FIN"],
    intentAffinities: ["execute", "decide"],
    estateCategories: ["business"],
    profilePath: profilePath("SALES_Expert_Intelligence_Profile.md"),
  },
  {
    id: "CNT",
    name: "Content Intelligence",
    category: "marketing",
    expertThinkingPattern:
      "Notices the one alive idea buried under the founder's tabs, tangents, and almost-posts. Checks whether the format is serving that idea or stealing the wheel. Protects the founder's real voice before polish turns it generic.",
    activationSignals: [
      "many ideas no piece",
      "content inconsistent",
      "hard to explain expertise",
      "perfectionism blocks publishing",
      "content calendar",
      "write a post",
      "newsletter",
      "turn ideas into a post",
      "ideas into a blog post",
    ],
    expertiseAreas: [
      "Idea capture",
      "content angles",
      "educational sequencing",
      "story structure",
      "founder voice",
      "message clarity",
      "content pillars",
      "format selection",
      "repurposing",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "creating content that connects",
    supportingRelationships: ["MKT", "SALES"],
    possibleRelationships: ["CRE", "STR"],
    intentAffinities: ["build", "execute"],
    estateCategories: ["create", "business"],
    profilePath: profilePath("CNT_Expert_Intelligence_Profile.md"),
  },
  {
    id: "PM",
    name: "Project Management Intelligence",
    category: "operations",
    expertThinkingPattern:
      "Notices when a project is missing a finish line, not motivation. Finds the hidden dependency, handoff, or restart point that will quietly break the path later. Makes the next visible step small enough to survive real life.",
    activationSignals: [
      "big idea needs steps",
      "project feels overwhelming",
      "handoffs dropping",
      "timeline is fuzzy",
      "where do i start",
      "milestone",
      "roadmap",
      "action plan",
    ],
    expertiseAreas: [
      "Outcome definition",
      "work breakdown",
      "sequencing",
      "milestones",
      "dependencies",
      "handoffs",
      "timeline shaping",
      "resource mapping",
      "progress tracking",
      "risk planning",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "getting the project moving",
    supportingRelationships: ["STR", "SYS"],
    possibleRelationships: ["MOM", "AI"],
    intentAffinities: ["plan", "organize", "execute"],
    estateCategories: ["momentum", "business"],
    profilePath: profilePath("PM_Expert_Intelligence_Profile.md"),
  },
  {
    id: "AI",
    name: "AI & Technology Intelligence",
    category: "technology",
    expertThinkingPattern:
      "Notices when a shiny tool is being asked to solve an unclear process. Separates the outcome from the app, then checks risk, review, and fallback before anything gets automated. Keeps technology useful enough to reduce friction, not become another thing to babysit.",
    activationSignals: [
      "choosing tools",
      "which ai tool",
      "automate this",
      "tech stack bloated",
      "too many tools",
      "reduce manual work",
      "ai feels overwhelming",
    ],
    expertiseAreas: [
      "AI capability mapping",
      "tool evaluation",
      "automation readiness",
      "workflow integration",
      "data and privacy basics",
      "human-in-the-loop design",
      "prompt or use-case translation",
      "technology sustainability",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "choosing the right tools",
    supportingRelationships: ["SYS", "STR"],
    possibleRelationships: ["PM", "RES"],
    intentAffinities: ["build", "understand", "decide"],
    estateCategories: ["business", "create"],
    profilePath: profilePath("AI_Expert_Intelligence_Profile.md"),
  },
  {
    id: "RES",
    name: "Research Intelligence",
    category: "research_learning",
    expertThinkingPattern:
      "Notices when the real question has been buried under too many open tabs. Separates what is known, what is trustworthy, and what would actually change the decision. Stops the search when the next responsible step is clear enough.",
    activationSignals: [
      "need current information",
      "claims need evidence",
      "compare options",
      "market understanding missing",
      "too many tabs open",
      "research is delaying",
      "look this up",
      "is this market viable",
      "enough information to know",
    ],
    expertiseAreas: [
      "Research question framing",
      "source discovery",
      "credibility assessment",
      "evidence grading",
      "comparative analysis",
      "synthesis",
      "trend scanning",
      "uncertainty mapping",
      "insight translation",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "researching the answer",
    supportingRelationships: ["STR", "MKT"],
    possibleRelationships: ["AI", "CNT"],
    intentAffinities: ["understand", "learn"],
    estateCategories: ["research"],
    profilePath: profilePath("RES_Expert_Intelligence_Profile.md"),
  },
  {
    id: "CRE",
    name: "Creative Studio Intelligence",
    category: "marketing",
    expertThinkingPattern:
      "Notices when the visual work is carrying five feelings at once. Finds the one emotional promise strong enough to guide the assets, then adds the constraint that lets the founder stop redesigning and ship.",
    activationSignals: [
      "visual concept",
      "brand expression flat",
      "idea pile needs direction",
      "creative work stuck",
      "too many aesthetics",
      "campaign assets",
      "design this",
      "brand feels flat",
      "find a visual direction",
    ],
    expertiseAreas: [
      "Creative direction",
      "visual concepting",
      "art direction",
      "design systems at founder scale",
      "campaign asset coherence",
      "moodboards",
      "creative briefs",
      "launch-ready asset decisions",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "designing how it looks and feels",
    supportingRelationships: ["MKT", "CNT"],
    possibleRelationships: ["STR", "CR"],
    intentAffinities: ["build", "execute"],
    estateCategories: ["create"],
    profilePath: profilePath("CRE_Expert_Intelligence_Profile.md"),
  },
  {
    id: "DATA",
    name: "Data & Analytics Intelligence",
    category: "technology",
    expertThinkingPattern:
      "Notices which numbers are creating shame, noise, or false certainty before asking for more data. Keeps only the signals that would change a decision early enough to matter.",
    activationSignals: [
      "what is working",
      "decisions based on vibes",
      "metrics feel intimidating",
      "growth is noisy",
      "spreadsheet maze",
      "which numbers matter",
      "measure this",
    ],
    expertiseAreas: [
      "Decision analytics",
      "metric design",
      "dashboard simplicity",
      "data quality",
      "leading and lagging indicators",
      "cohort thinking",
      "funnel visibility",
      "business signal interpretation",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "understanding what the numbers say",
    supportingRelationships: ["FIN", "MKT"],
    possibleRelationships: ["SALES", "STR"],
    intentAffinities: ["understand", "decide"],
    estateCategories: ["business"],
    profilePath: profilePath("DATA_Expert_Intelligence_Profile.md"),
  },
  {
    id: "EVT",
    name: "Events Intelligence",
    category: "events",
    expertThinkingPattern:
      "Notices the transformation guests are meant to feel before building the agenda. Designs the experience arc, logistics, energy, and ADHD-friendly pacing so the event feels held from invitation through aftercare.",
    activationSignals: [
      "plan an event",
      "plan a workshop",
      "plan a retreat",
      "business retreat",
      "two day retreat",
      "launch event",
      "guest experience",
      "webinar",
      "hosting a workshop",
      "host a workshop",
      "hosting a retreat",
      "agenda keeps growing",
      "crash after events",
      "after the event",
    ],
    expertiseAreas: [
      "Attendee transformation",
      "experience design and guest journey mapping",
      "logistics and run-of-show planning",
      "energy management",
      "ADHD-friendly pacing",
      "hospitality touchpoints",
      "event communications",
      "experience recovery",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "planning the event itself",
    supportingRelationships: ["MKT", "CR"],
    possibleRelationships: ["PM", "CRE"],
    intentAffinities: ["plan", "organize", "build"],
    estateCategories: ["business"],
    profilePath: profilePath("EVT_Expert_Intelligence_Profile.md"),
  },
  {
    id: "HOR",
    name: "Horizons Intelligence",
    category: "strategy",
    expertThinkingPattern:
      "Notices when the future is giving courage and when it is becoming a hiding place. Keeps the horizon alive while finding the bridge back to current capacity, real constraints, and one evidence step.",
    activationSignals: [
      "imagining the future",
      "long term vision",
      "future constraints",
      "where is this going",
      "5 year vision",
      "drifting into fantasy",
    ],
    expertiseAreas: [
      "Long-range vision",
      "scenario thinking",
      "future-state maps",
      "horizon scanning",
      "strategic timing",
      "possibility framing",
      "aspiration-to-action bridges",
      "constraints and dependencies",
    ],
    expertCategory: "generalist",
    founderPlainLanguagePhrase: "seeing where this is headed",
    supportingRelationships: ["STR", "INN"],
    possibleRelationships: ["FIN", "LEAD"],
    intentAffinities: ["reflect", "decide", "plan"],
    estateCategories: ["grow", "business"],
    profilePath: profilePath("HOR_Expert_Intelligence_Profile.md"),
  },
  {
    id: "INN",
    name: "Innovations Intelligence",
    category: "research_learning",
    expertThinkingPattern:
      "Notices the assumption an exciting idea is standing on before the founder starts building. Shrinks possibility into the smallest honest experiment, so novelty becomes learning instead of another unfinished pivot.",
    activationSignals: [
      "new idea",
      "product experiment",
      "pivot temptation",
      "validate this idea",
      "test an experiment",
      "innovation",
    ],
    expertiseAreas: [
      "Hypothesis design",
      "MVP scope",
      "prototype planning",
      "experiment metrics",
      "pivot evaluation",
      "customer discovery",
      "learning loops",
      "innovation portfolio discipline",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "testing a new idea",
    supportingRelationships: ["STR", "RES"],
    possibleRelationships: ["DATA", "CRE"],
    intentAffinities: ["build", "decide"],
    estateCategories: ["business"],
    profilePath: profilePath("INN_Expert_Intelligence_Profile.md"),
  },
  {
    id: "KMG",
    name: "Knowledge Management Intelligence",
    category: "operations",
    expertThinkingPattern:
      "Notices when saved knowledge is comforting the founder now but will disappear when it could help later. Connects each note to the moment, decision, or asset it should return for, then lets the rest move out of the way.",
    activationSignals: [
      "notes scattered everywhere",
      "saved knowledge not retrieved",
      "second brain",
      "organizing is replacing action",
      "where did i save this",
      "knowledge base",
      "documentation system",
      "organize documentation",
      "ai documentation",
      "documentation",
    ],
    expertiseAreas: [
      "Knowledge lifecycle",
      "retrieval architecture",
      "note classification",
      "metadata discipline",
      "decision records",
      "knowledge-to-asset lineage",
      "archive design",
      "search and recall patterns",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "organizing what you already know",
    supportingRelationships: ["AI", "SYS"],
    possibleRelationships: ["DATA", "STR", "CNT"],
    intentAffinities: ["organize", "build"],
    estateCategories: ["business", "learn"],
    profilePath: profilePath("KMG_Expert_Intelligence_Profile.md"),
  },
  {
    id: "LEAD",
    name: "Leadership Intelligence",
    category: "people",
    expertThinkingPattern:
      "Notices where a people problem is really an unstated expectation, an avoided conversation, or the founder quietly rescuing the system. Turns tension into one kind true sentence, one clear agreement, and a rhythm that does not rely on panic.",
    activationSignals: [
      "managing people",
      "expectations unclear",
      "hard conversation avoided",
      "team inconsistency",
      "over functioning",
      "delegation",
      "accountability",
      "avoiding the conversation",
      "doesn't know what's expected",
    ],
    expertiseAreas: [
      "Role clarity",
      "expectation-setting",
      "delegation",
      "feedback",
      "difficult conversations",
      "accountability systems",
      "team communication cadence",
      "founder leadership identity",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "leading and managing people",
    supportingRelationships: ["SYS", "PM"],
    possibleRelationships: ["CR", "STR"],
    intentAffinities: ["decide", "organize"],
    estateCategories: ["business"],
    profilePath: profilePath("LEAD_Expert_Intelligence_Profile.md"),
  },
  {
    id: "LEARN",
    name: "Learning Intelligence",
    category: "research_learning",
    expertThinkingPattern:
      "Notices when a course has become shelter instead of skill. Pulls one live capability out of the notes, then asks where it will be practiced before the next lesson is allowed to multiply.",
    activationSignals: [
      "keep buying courses",
      "learning replaces doing",
      "curricula unfinished",
      "new method feels exciting",
      "skill gap",
      "learn this skill",
    ],
    expertiseAreas: [
      "Applied learning",
      "skill gap diagnosis",
      "curriculum triage",
      "deliberate practice",
      "knowledge capture",
      "implementation planning",
      "reflective learning",
      "transfer of learning",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "building a real skill",
    supportingRelationships: ["STR", "MOM"],
    possibleRelationships: ["PM", "CNT"],
    intentAffinities: ["learn", "organize"],
    estateCategories: ["learn"],
    profilePath: profilePath("LEARN_Expert_Intelligence_Profile.md"),
  },
  {
    id: "MOM",
    name: "Momentum Intelligence",
    category: "momentum_wellbeing",
    expertThinkingPattern:
      "Notices overwhelm before the founder calls it that. Breaks the frozen next move into a step small enough to actually take today.",
    activationSignals: [
      "false starts",
      "boom bust energy",
      "missed streak",
      "interruption derails progress",
      "restarting feels harder",
      "project stalled",
      "stuck again",
      "losing momentum",
      "keep starting projects",
    ],
    expertiseAreas: [
      "Momentum initiation",
      "restart intelligence",
      "interruption recovery",
      "friction reduction",
      "pacing",
      "progress signals",
      "capacity-sensitive action",
      "sustainable consistency",
    ],
    expertCategory: "generalist",
    founderPlainLanguagePhrase: "getting unstuck and moving",
    supportingRelationships: ["STR", "PM"],
    possibleRelationships: ["WELL", "SYS"],
    intentAffinities: ["execute", "restore"],
    estateCategories: ["momentum"],
    profilePath: profilePath("MOM_Expert_Intelligence_Profile.md"),
  },
  {
    id: "NET",
    name: "Networking Intelligence",
    category: "sales_growth",
    expertThinkingPattern:
      "Notices the warm thread after a noisy room, before it disappears into a contact list. Protects one human detail and one natural next touch, so silence does not get to rewrite the relationship.",
    activationSignals: [
      "avoids events",
      "leaves events overwhelmed",
      "fails to follow up",
      "collects contacts",
      "wants referrals",
      "networking event",
      "never followed up",
      "met people at a conference",
    ],
    expertiseAreas: [
      "Event selection",
      "relationship mapping",
      "warm introductions",
      "follow-up design",
      "referral cultivation",
      "social energy pacing",
      "contact context capture",
      "community participation",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "building real connections",
    supportingRelationships: ["SALES", "PART"],
    possibleRelationships: ["MKT", "CR"],
    intentAffinities: ["execute", "organize"],
    estateCategories: ["business"],
    profilePath: profilePath("NET_Expert_Intelligence_Profile.md"),
  },
  {
    id: "PART",
    name: "Partnerships Intelligence",
    category: "sales_growth",
    expertThinkingPattern:
      "Notices when chemistry is carrying promises that capacity has not agreed to yet. Slows the shared idea long enough to name roles, contribution, and the exit path while trust is still warm.",
    activationSignals: [
      "considering a collaboration",
      "excitement moving faster than clarity",
      "roles are fuzzy",
      "uneven contribution",
      "joint venture",
      "affiliate partnership",
      "referral partnership",
      "talked about roles",
      "roles or who gets what",
    ],
    expertiseAreas: [
      "Partner fit assessment",
      "collaboration models",
      "joint offer design",
      "referral partnership design",
      "affiliate and sponsorship logic",
      "contribution mapping",
      "governance basics",
      "exit planning",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "structuring a partnership",
    supportingRelationships: ["NET", "SALES"],
    possibleRelationships: ["FIN", "PM"],
    intentAffinities: ["decide", "plan"],
    estateCategories: ["business"],
    profilePath: profilePath("PART_Expert_Intelligence_Profile.md"),
  },
  {
    id: "PC",
    name: "People & Culture Intelligence",
    category: "people",
    expertThinkingPattern:
      "Notices when everyone is being nice around an expectation nobody has actually said out loud. Turns culture from founder intention into one clear behavior, rhythm, or kind truth the team can experience.",
    activationSignals: [
      "avoids conflict",
      "hires from urgency",
      "team expectations inconsistent",
      "culture is only vibes",
      "hiring readiness",
      "feedback conversation",
      "team trust",
    ],
    expertiseAreas: [
      "Role design",
      "hiring readiness",
      "onboarding clarity",
      "expectation setting",
      "feedback conversations",
      "conflict repair",
      "management cadence",
      "delegation",
      "team norms",
      "culture measurement",
    ],
    outcomeSignals: [
      "hire my first team member",
      "hired my first employee",
      "hiring my first employee",
      "bring on my first hire",
      "ready to hire someone",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "hiring and building the team",
    supportingRelationships: ["SYS", "PM"],
    possibleRelationships: ["STR", "WELL"],
    intentAffinities: ["decide", "organize"],
    estateCategories: ["business"],
    profilePath: profilePath("PC_Expert_Intelligence_Profile.md"),
  },
  {
    id: "PRES",
    name: "Presentations Intelligence",
    category: "marketing",
    expertThinkingPattern:
      "Notices when the deck is getting bigger because being seen feels exposed. Finds the audience shift and message spine first, then gives every slide a job or lets it go.",
    activationSignals: [
      "need a talk",
      "need a pitch",
      "sales deck",
      "blank page freeze",
      "deck is overbuilt",
      "board update",
      "webinar",
      "training session",
    ],
    expertiseAreas: [
      "Audience analysis",
      "message strategy",
      "presentation structure",
      "pitch narrative",
      "slide design principles",
      "speaker notes",
      "rehearsal loops",
      "Q&A preparation",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "putting together a talk or pitch",
    supportingRelationships: ["CNT", "SALES"],
    possibleRelationships: ["STR", "CRE"],
    intentAffinities: ["build", "execute"],
    estateCategories: ["create", "business"],
    profilePath: profilePath("PRES_Expert_Intelligence_Profile.md"),
  },
  {
    id: "WELL",
    name: "Wellness Intelligence",
    category: "momentum_wellbeing",
    expertThinkingPattern:
      "Notices borrowed energy before it looks like burnout. Lets the body's signal change the business plan, choosing the capacity floor before ambition writes another promise.",
    activationSignals: [
      "ignoring body signals",
      "using productivity to avoid rest",
      "all or nothing recovery",
      "burnout",
      "sleep strain",
      "sensory overload",
      "unsustainable pace",
      "running on fumes",
      "ignoring every signal",
    ],
    expertiseAreas: [
      "Capacity planning",
      "burnout prevention",
      "recovery design",
      "body-signal tracking",
      "sensory load reduction",
      "work-rest rhythm",
      "nervous-system-friendly planning",
      "sustainable founder operations",
    ],
    expertCategory: "specialist",
    founderPlainLanguagePhrase: "protecting your energy",
    supportingRelationships: ["MOM", "STR"],
    possibleRelationships: ["PC", "PM"],
    intentAffinities: ["restore", "reflect"],
    estateCategories: ["restore"],
    profilePath: profilePath("WELL_Expert_Intelligence_Profile.md"),
  },
];

/** O(1) lookup map, built once. */
const REGISTRY_BY_ID: ReadonlyMap<ChamberExpertId, ChamberExpertRegistryEntryWithCategory> =
  new Map(CHAMBER_EXPERT_REGISTRY.map((entry) => [entry.id, entry]));

export function chamberExpertById(
  id: ChamberExpertId,
): ChamberExpertRegistryEntryWithCategory | undefined {
  return REGISTRY_BY_ID.get(id);
}

export function chamberExpertName(id: ChamberExpertId): string {
  return REGISTRY_BY_ID.get(id)?.name ?? id;
}

/** Sanity check — every registry entry has a valid canonical ID and non-empty core fields. */
export function assertChamberExpertRegistryIsWellFormed(): void {
  const seen = new Set<string>();
  for (const id of CHAMBER_EXPERT_IDS) {
    const entry = REGISTRY_BY_ID.get(id);
    if (!entry) throw new Error(`Chamber Expert Registry missing entry for ${id}`);
    if (seen.has(id)) throw new Error(`Duplicate Chamber Expert Registry entry for ${id}`);
    seen.add(id);
    if (entry.activationSignals.length === 0) {
      throw new Error(`Chamber Expert Registry entry ${id} has no activationSignals`);
    }
    if (entry.expertiseAreas.length === 0) {
      throw new Error(`Chamber Expert Registry entry ${id} has no expertiseAreas`);
    }
    if (!entry.expertCategory) {
      throw new Error(`Chamber Expert Registry entry ${id} is missing expertCategory (V2-2)`);
    }
    if (!entry.founderPlainLanguagePhrase?.trim()) {
      throw new Error(`Chamber Expert Registry entry ${id} is missing founderPlainLanguagePhrase (V2-2)`);
    }
    for (const related of [...entry.supportingRelationships, ...entry.possibleRelationships]) {
      if (related === id) {
        throw new Error(`Chamber Expert Registry entry ${id} lists itself as a related expert`);
      }
      if (!REGISTRY_BY_ID.has(related) && !CHAMBER_EXPERT_IDS.includes(related)) {
        throw new Error(`Chamber Expert Registry entry ${id} references unknown expert ${related}`);
      }
    }
  }
  if (CHAMBER_EXPERT_REGISTRY.length !== CHAMBER_EXPERT_IDS.length) {
    throw new Error(
      `Chamber Expert Registry has ${CHAMBER_EXPERT_REGISTRY.length} entries, expected ${CHAMBER_EXPERT_IDS.length}`,
    );
  }
}
