/**
 * Document Creation Profiles — what each artifact type needs before drafting.
 *
 * Email ≠ newsletter ≠ funnel ≠ website. Same journey, type-specific discovery.
 */

import type {
  UniversalDiscoveryQuestion,
  UniversalDiscoverySlot,
  UniversalDocumentType,
} from "./types";

export type DocumentCreationProfile = {
  label: string;
  /** What makes this type different — used in hints and draft headers. */
  essence: string;
  intro: string;
  /** Sections the finished draft should include. */
  draftSections: readonly string[];
  discoveryQuestions: readonly UniversalDiscoveryQuestion[];
};

const SKIP_SIGNAL = /\b(?:skip|none|not yet|n\/a)\b/i;

function q(
  prefix: string,
  id: string,
  slot: UniversalDiscoverySlot,
  prompt: string,
  signalPatterns?: readonly RegExp[],
): UniversalDiscoveryQuestion {
  return {
    id: `${prefix}-${id}`,
    slot,
    prompt,
    signalPatterns: signalPatterns,
  };
}

const EMAIL: DocumentCreationProfile = {
  label: "Email",
  essence:
    "One person, one purpose, one clear ask — not a broadcast.",
  intro:
    "Let's write this email so it lands with the one person who needs to read it.\n\nI'll ask what this type of email needs — one thing at a time, and skip what you've already told me.",
  draftSections: [
    "Subject line options",
    "Opening line",
    "Body (context + message)",
    "Clear ask or next step",
    "Sign-off",
  ],
  discoveryQuestions: [
    q("email", "recipient", "who", "Who is receiving this email — one person, a role, or a small group?"),
    q("email", "relationship", "who", "What's your relationship with them right now?", [
      /\b(?:client|prospect|team|vendor|partner|existing|new|cold|warm|rough|strained)\b/i,
    ]),
    q("email", "purpose", "why", "What is this email trying to accomplish in one sentence?", [
      /\b(?:follow up|update|ask|request|deliver|introduce|remind|thank|follow through|agreed|boundary)\b/i,
    ]),
    q("email", "context", "what", "What do they already know — and what context do they need first?", [
      /\b(?:already|know|background|context|last time|project|agreed)\b/i,
    ]),
    q("email", "ask", "what", "What's the one thing you need them to do or understand?", [
      /\b(?:need them|want them|ask|reply|approve|schedule|click|follow through)\b/i,
    ]),
    q("email", "success", "success", "What would a good response look like?", [
      /\b(?:reply|yes|book|sign|approve|schedule|outcome)\b/i,
    ]),
  ],
};

const NEWSLETTER: DocumentCreationProfile = {
  label: "Newsletter",
  essence:
    "A broadcast to your list — story, value, and one invitation.",
  intro:
    "Let's create a newsletter that feels like you.\n\nI'll ask a few things one at a time — so the draft actually sounds like you.",
  draftSections: [
    "Subject line + preview text",
    "Opening hook",
    "Main story or value",
    "Proof or example",
    "Call to action",
  ],
  discoveryQuestions: [
    q("newsletter", "why", "why", "What's the main reason you're creating this newsletter?", [
      /\b(?:announce|launch|let people know|update|nurture|grow)\b/i,
    ]),
    q("newsletter", "who", "who", "Who is this for?", [
      /\b(?:audience|list|subscribers|readers|entrepreneur|business)\b/i,
    ]),
    q("newsletter", "core-message", "what", "What's the one thing you most want readers to understand or feel?", [
      /\b(?:understand|feel|take away|message|realize)\b/i,
    ]),
    q("newsletter", "offering", "what", "What are you introducing or inviting them to?", [
      /\b(?:app|offer|product|story|invite|launch|service)\b/i,
    ]),
    q("newsletter", "tone", "why", "How should this sound — friend checking in, or guide teaching?", [
      /\b(?:friend|warm|guide|teach|conversational|professional)\b/i,
    ]),
    q("newsletter", "cta", "success", "When they're done reading, what's the one action you'd love them to take?", [
      /\b(?:sign up|click|try|download|reply|book|visit|join)\b/i,
    ]),
    q("newsletter", "proof", "why", "Is there a story, win, or proof point to include? (Say skip if not yet.)", [
      SKIP_SIGNAL,
      /\b(?:story|win|proof|testimonial|example)\b/i,
    ]),
    q("newsletter", "success", "success", "What would success look like for this issue?", [
      /\b(?:success|outcome|open|reply|convert|grow)\b/i,
    ]),
  ],
};

const SALES_FUNNEL: DocumentCreationProfile = {
  label: "Sales Funnel",
  essence:
    "A path from stranger to buyer — each step earns the next.",
  intro:
    "Let's map a funnel that moves people naturally toward your offer.\n\nOne question at a time.",
  draftSections: [
    "Funnel overview (entry → offer)",
    "Stage-by-stage purpose",
    "Key messages per stage",
    "Calls to action between stages",
    "Success metrics",
  ],
  discoveryQuestions: [
    q("funnel", "offer", "what", "What offer sits at the bottom of this funnel?", [
      /\b(?:offer|product|service|course|program|app|package)\b/i,
    ]),
    q("funnel", "who", "who", "Who is this funnel for — and how well do they know you today?", [
      /\b(?:cold|warm|hot|audience|list|prospect|stranger)\b/i,
    ]),
    q("funnel", "entry", "why", "How do people enter — ad, lead magnet, webinar, social, or something else?", [
      /\b(?:ad|lead magnet|webinar|social|referral|content|entry)\b/i,
    ]),
    q("funnel", "stages", "what", "What stages do you need — awareness, nurture, pitch, checkout, onboarding?", [
      /\b(?:awareness|nurture|pitch|checkout|onboard|stage|step)\b/i,
    ]),
    q("funnel", "assets", "why", "What do you already have — emails, pages, videos — and what's missing?", [
      /\b(?:already|have|missing|need|page|email|video|nothing)\b/i,
    ]),
    q("funnel", "objection", "what", "What's the main hesitation people have before they buy?", [
      /\b(?:hesitat|objection|worry|concern|price|trust|time)\b/i,
    ]),
    q("funnel", "success", "success", "What would success look like — sign-ups, calls booked, sales?", [
      /\b(?:sign up|sales|revenue|book|convert|purchase)\b/i,
    ]),
  ],
};

const WEBSITE: DocumentCreationProfile = {
  label: "Website",
  essence:
    "Pages that orient visitors and make the next step obvious.",
  intro:
    "Let's shape website copy that welcomes the right people and guides them forward.\n\nOne question at a time.",
  draftSections: [
    "Homepage hero (headline + subhead)",
    "Who it's for",
    "Core promise / transformation",
    "Proof or credibility",
    "Primary call to action",
    "Supporting pages outline",
  ],
  discoveryQuestions: [
    q("website", "who", "who", "Who is this website for — be as specific as you can.", [
      /\b(?:for|audience|customer|client|visitor|entrepreneur)\b/i,
    ]),
    q("website", "goal", "why", "When someone lands here, what should they do or feel first?", [
      /\b(?:feel|do|sign up|book|buy|learn|trust|understand)\b/i,
    ]),
    q("website", "offer", "what", "What are you offering — product, service, app, or something else?", [
      /\b(?:offer|product|service|app|program|business)\b/i,
    ]),
    q("website", "pages", "what", "Which pages or sections do you need — home, about, pricing, contact, blog?", [
      /\b(?:home|about|pricing|contact|blog|page|section)\b/i,
    ]),
    q("website", "differentiator", "why", "What makes you different from the obvious alternative?", [
      /\b(?:different|unique|only|unlike|instead|why us)\b/i,
    ]),
    q("website", "starting", "why", "Starting from scratch, or refreshing copy you already have?", [
      /\b(?:scratch|refresh|existing|rewrite|new|already)\b/i,
    ]),
    q("website", "tone", "why", "How should the site sound — premium, warm, bold, or quiet?", [
      /\b(?:premium|warm|bold|quiet|professional|friendly)\b/i,
    ]),
    q("website", "success", "success", "What would success look like — inquiries, sign-ups, sales?", [
      /\b(?:inquir|sign up|sales|book|contact|convert)\b/i,
    ]),
  ],
};

const PRESENTATION: DocumentCreationProfile = {
  label: "Presentation",
  essence:
    "Slides + story arc for a live room — not a document pasted on screens.",
  intro:
    "Let's shape a presentation that lands clearly.\n\nI'll ask what the room needs — one question at a time.",
  draftSections: [
    "Title + big promise",
    "Slide outline with beats",
    "Speaker notes per section",
    "Audience takeaway",
    "Call to action / Q&A close",
  ],
  discoveryQuestions: [
    q("presentation", "why", "why", "What's the main reason you're giving this presentation?", [
      /\b(?:pitch|teach|update|sell|introduce|explain|launch)\b/i,
    ]),
    q("presentation", "who", "who", "Who is in the room — and what do they already believe?", [
      /\b(?:audience|room|team|investor|client|prospect|student)\b/i,
    ]),
    q("presentation", "occasion", "what", "What's the setting — meeting, conference, webinar, or pitch?", [
      /\b(?:meeting|conference|webinar|pitch|workshop|stage)\b/i,
    ]),
    q("presentation", "length", "success", "About how long do you have — and how many slides feels right?", [
      /\b(?:\d+\s*(?:min|minute|slide|hour)|short|long|20|30|45|60)\b/i,
    ]),
    q("presentation", "core", "what", "What's the one idea you need them to leave remembering?", [
      /\b(?:remember|take away|one idea|message|point)\b/i,
    ]),
    q("presentation", "objection", "why", "What skepticism or confusion might they bring in?", [
      /\b(?:skeptic|confus|worry|doubt|objection|pushback)\b/i,
    ]),
    q("presentation", "cta", "success", "What should they do when you're done?", [
      /\b(?:do when|next step|sign|buy|book|try|follow up)\b/i,
    ]),
  ],
};

const SOP: DocumentCreationProfile = {
  label: "SOP",
  essence:
    "Repeatable steps someone else can follow without guessing.",
  intro:
    "I'd be happy to help.\n\nLet me understand what you're trying to build.",
  draftSections: [
    "Purpose + scope",
    "Who this is for",
    "Prerequisites",
    "Step-by-step procedure",
    "Checklist + troubleshooting",
  ],
  discoveryQuestions: [
    q("sop", "audience-type", "who", "Is this SOP for your own business, or for a client?", [
      /\b(?:my business|our team|client)\b/i,
    ]),
    q("sop", "starting-point", "why", "Starting from scratch, or do you already have this process written down?", [
      /\b(?:scratch|already|written|existing)\b/i,
    ]),
    q("sop", "audience-size", "success", "Will one person use this, or will multiple people need to follow it?", [
      /\b(?:one person|solo|team|multiple|va|staff)\b/i,
    ]),
    q("sop", "process-name", "what", "What process are we documenting today?"),
    q("sop", "frequency", "why", "How often does this process run?", [
      /\b(?:daily|weekly|monthly|each time|every|once)\b/i,
    ]),
    q("sop", "failure", "what", "Where do people usually get stuck or make mistakes?", [
      /\b(?:stuck|mistake|wrong|confus|break|fail)\b/i,
    ]),
  ],
};

const BUSINESS_PLAN: DocumentCreationProfile = {
  label: "Business Plan",
  essence:
    "Strategy on paper — where you're going, how you'll get there, and what matters now.",
  intro:
    "Let's shape a plan you can actually work from.\n\nOne question at a time.",
  draftSections: [
    "Executive summary",
    "Market + ideal customer",
    "Offer + positioning",
    "Go-to-market",
    "Goals + milestones",
  ],
  discoveryQuestions: [
    q("plan", "why", "why", "What's the main reason you're creating this plan right now?", [
      /\b(?:fund|bank|team|clarity|launch|grow|strategy)\b/i,
    ]),
    q("plan", "audience", "who", "Who will read this — you, your team, investors, or a bank?", [
      /\b(?:team|investor|bank|partner|myself|internal)\b/i,
    ]),
    q("plan", "business", "what", "In one sentence, what does your business do and for whom?", [
      /\b(?:business|sell|help|offer|serve)\b/i,
    ]),
    q("plan", "stage", "why", "Where is the business today — idea, early revenue, or scaling?", [
      /\b(?:idea|early|scaling|startup|established|revenue)\b/i,
    ]),
    q("plan", "horizon", "success", "What time horizon — 90 days, one year, or three years?", [
      /\b(?:90 day|quarter|year|three year|month)\b/i,
    ]),
    q("plan", "focus", "what", "What area needs the most clarity — offer, marketing, operations, or finances?", [
      /\b(?:offer|marketing|operations|finance|sales|product)\b/i,
    ]),
    q("plan", "success", "success", "What would success look like when this plan is done?", [
      /\b(?:success|outcome|fund|launch|grow|clarity)\b/i,
    ]),
  ],
};

const PROPOSAL: DocumentCreationProfile = {
  label: "Proposal",
  essence:
    "Trust first — their problem, your approach, clear next yes.",
  intro:
    "Let's build a proposal that wins trust.\n\nFirst, help me understand the opportunity.",
  draftSections: [
    "Cover + warm opening",
    "Their situation + goals",
    "Your approach",
    "Scope + timeline",
    "Investment + next step",
  ],
  discoveryQuestions: [
    q("proposal", "client", "who", "Who is this proposal for — and what do you know about their situation?", [
      /\b(?:client|prospect|company|they|business)\b/i,
    ]),
    q("proposal", "problem", "why", "What problem or opportunity are you solving for them?", [
      /\b(?:problem|pain|need|want|struggling|goal)\b/i,
    ]),
    q("proposal", "scope", "what", "What will you deliver — be as concrete as you can.", [
      /\b(?:deliver|include|scope|build|create|provide)\b/i,
    ]),
    q("proposal", "timeline", "success", "What timeline are you proposing?", [
      /\b(?:week|month|timeline|deadline|start|finish|\d+\s*day)\b/i,
    ]),
    q("proposal", "differentiator", "why", "Why you — what makes your approach the right fit?", [
      /\b(?:why us|different|unique|experience|approach)\b/i,
    ]),
    q("proposal", "investment", "what", "How will pricing work — fixed, phases, or ranges? (Ballpark is fine.)", [
      /\b(?:price|cost|investment|budget|\$\d|fixed|retainer)\b/i,
    ]),
    q("proposal", "success", "success", "What would a yes look like — signed, call booked, deposit?", [
      /\b(?:sign|yes|deposit|book|approve)\b/i,
    ]),
  ],
};

const WORKSHOP: DocumentCreationProfile = {
  label: "Workshop",
  essence:
    "Live transformation — agenda, exercises, and a clear before/after.",
  intro:
    "I'd love to help.\nLet's build it together.\n\nOne question at a time.",
  draftSections: [
    "Workshop promise",
    "Agenda with timings",
    "Activities + materials",
    "Facilitator notes",
    "Follow-up",
  ],
  discoveryQuestions: [
    q("workshop", "who", "who", "Who is the workshop for?", [
      /\b(?:for|audience|entrepreneur|team|beginner)\b/i,
    ]),
    q("workshop", "transformation", "why", "What transformation do you want participants to experience?", [
      /\b(?:walk away|learn|feel|able to|outcome|transform)\b/i,
    ]),
    q("workshop", "duration", "success", "About how long will the workshop be?", [
      /\b(?:\d+\s*(?:hour|minute|min|day)|half day|full day|90)\b/i,
    ]),
    q("workshop", "format", "what", "In person, virtual, or hybrid?", [
      /\b(?:in person|virtual|online|hybrid|zoom)\b/i,
    ]),
    q("workshop", "activities", "what", "Do you want hands-on exercises, discussion, or mostly teaching?", [
      /\b(?:exercise|discussion|teach|hands-on|interactive)\b/i,
    ]),
  ],
};

const WEBINAR: DocumentCreationProfile = {
  label: "Webinar",
  essence:
    "One live session that earns attention and a clear next step.",
  intro:
    "Let's build a webinar that holds attention and delivers real value.\n\nOne question at a time.",
  draftSections: [
    "Registration promise",
    "Run-of-show outline",
    "Slide beats",
    "Engagement moments",
    "Pitch + follow-up",
  ],
  discoveryQuestions: [
    q("webinar", "who", "who", "Who is this webinar for?", [
      /\b(?:for|audience|list|prospect)\b/i,
    ]),
    q("webinar", "goal", "why", "What's the main outcome you want attendees to leave with?", [
      /\b(?:leave with|learn|sign up|buy|understand)\b/i,
    ]),
    q("webinar", "length", "success", "About how long will the webinar run?", [
      /\b(?:\d+\s*(?:min|minute|hour)|45|60|90)\b/i,
    ]),
    q("webinar", "offer", "what", "Is there an offer at the end — or is this pure value?", [
      /\b(?:offer|pitch|sell|value|free|no pitch)\b/i,
    ]),
    q("webinar", "hook", "what", "What's the title or hook that would make the right person register?", [
      /\b(?:title|hook|register|promise|headline)\b/i,
    ]),
  ],
};

function genericProfile(
  id: string,
  label: string,
  essence: string,
  intro: string,
  questions: Array<{ id: string; slot: UniversalDiscoverySlot; prompt: string }>,
  draftSections: string[],
): DocumentCreationProfile {
  return {
    label,
    essence,
    intro,
    draftSections,
    discoveryQuestions: questions.map((item) =>
      q(id, item.id, item.slot, item.prompt),
    ),
  };
}

export const DOCUMENT_CREATION_PROFILES: Record<
  UniversalDocumentType,
  DocumentCreationProfile
> = {
  email: EMAIL,
  newsletter: NEWSLETTER,
  sales_funnel: SALES_FUNNEL,
  website: WEBSITE,
  presentation: PRESENTATION,
  sop: SOP,
  business_plan: BUSINESS_PLAN,
  marketing_plan: BUSINESS_PLAN,
  proposal: PROPOSAL,
  workshop: WORKSHOP,
  webinar: WEBINAR,
  social_post: genericProfile(
    "social",
    "Social Post",
    "One scroll-stopping moment — hook, value, action.",
    "Let's craft something worth stopping the scroll for.\n\nOne question at a time.",
    [
      { id: "platform", slot: "what", prompt: "Which platform — LinkedIn, Instagram, Facebook, or somewhere else?" },
      { id: "who", slot: "who", prompt: "Who should stop scrolling for this?" },
      { id: "message", slot: "what", prompt: "What's the one point this post needs to make?" },
      { id: "cta", slot: "success", prompt: "What should they do after reading — comment, click, DM, save?" },
    ],
    ["Hook", "Body", "Call to action", "Optional hashtags"],
  ),
  checklist: genericProfile(
    "checklist",
    "Checklist",
    "Steps someone can check off — nothing vague.",
    "Let's make a checklist people will actually use.\n\nOne question at a time.",
    [
      { id: "who", slot: "who", prompt: "Who will use this checklist?" },
      { id: "process", slot: "what", prompt: "What process or outcome does it support?" },
      { id: "steps", slot: "what", prompt: "Do you already have the steps in mind, or should we figure them out together?" },
      { id: "success", slot: "success", prompt: "What does done look like when they've checked everything off?" },
    ],
    ["Title", "Numbered steps", "Notes column", "Done criteria"],
  ),
  course: genericProfile(
    "course",
    "Course",
    "A learning path — modules, outcomes, and progression.",
    "Let's design a course that helps people grow.\n\nOne question at a time.",
    [
      { id: "who", slot: "who", prompt: "Who is this course for?" },
      { id: "transformation", slot: "why", prompt: "What transformation should they have by the end?" },
      { id: "format", slot: "what", prompt: "Self-paced, cohort, or live — how will they learn?" },
      { id: "length", slot: "success", prompt: "Roughly how long — modules, weeks, or hours?" },
      { id: "success", slot: "success", prompt: "What would success look like for a graduate?" },
    ],
    ["Course promise", "Module outline", "Lessons per module", "Assignments", "Completion criteria"],
  ),
  blog: genericProfile(
    "blog",
    "Blog",
    "One searchable, skimmable article that earns the click.",
    "Let's write something your reader will be glad they found.\n\nOne question at a time.",
    [
      { id: "who", slot: "who", prompt: "Who is this article for?" },
      { id: "question", slot: "why", prompt: "What question or problem brought them here?" },
      { id: "takeaway", slot: "what", prompt: "What's the one takeaway they should leave with?" },
      { id: "tone", slot: "why", prompt: "How should it sound — conversational, expert, or story-led?" },
      { id: "success", slot: "success", prompt: "What would success look like — shares, sign-ups, trust?" },
    ],
    ["Headline options", "Intro", "Sections", "Conclusion + CTA"],
  ),
  guide: genericProfile(
    "guide",
    "Guide",
    "A path from problem to first win — clear steps, no fluff.",
    "Let's build a guide that makes the path clear.\n\nOne question at a time.",
    [
      { id: "who", slot: "who", prompt: "Who is this guide for?" },
      { id: "problem", slot: "why", prompt: "What problem does it solve for them?" },
      { id: "outcome", slot: "what", prompt: "What should they be able to do after reading it?" },
      { id: "format", slot: "what", prompt: "Lead magnet, client deliverable, or internal playbook?" },
      { id: "success", slot: "success", prompt: "What would success look like?" },
    ],
    ["Promise", "Quick start", "Steps", "Examples", "Next step"],
  ),
  workbook: genericProfile(
    "workbook",
    "Workbook",
    "Pages they fill in — prompts, space, and progression.",
    "Let's create a workbook people can work through step by step.\n\nOne question at a time.",
    [
      { id: "who", slot: "who", prompt: "Who will work through this?" },
      { id: "journey", slot: "why", prompt: "What journey or skill does it walk them through?" },
      { id: "sections", slot: "what", prompt: "How many sections or chapters feel right?" },
      { id: "success", slot: "success", prompt: "What should they have at the end?" },
    ],
    ["Cover promise", "Section prompts", "Worksheets", "Reflection pages"],
  ),
  training_manual: genericProfile(
    "training",
    "Training Manual",
    "Reference material for teaching someone else to do the job.",
    "Let's build training materials that stick.\n\nOne question at a time.",
    [
      { id: "who", slot: "who", prompt: "Who is being trained?" },
      { id: "role", slot: "what", prompt: "What role or skill are they learning?" },
      { id: "format", slot: "why", prompt: "Self-study, trainer-led, or both?" },
      { id: "success", slot: "success", prompt: "How will you know training worked?" },
    ],
    ["Overview", "Modules", "Procedures", "Knowledge checks", "Resources"],
  ),
  book_chapter: genericProfile(
    "chapter",
    "Book Chapter",
    "One chapter arc — opening pull, development, landing.",
    "Let's develop this chapter with a clear arc.\n\nOne question at a time.",
    [
      { id: "book", slot: "what", prompt: "What book is this chapter part of — and where does it sit?" },
      { id: "who", slot: "who", prompt: "Who is the reader?" },
      { id: "purpose", slot: "why", prompt: "What must this chapter accomplish for the book?" },
      { id: "success", slot: "success", prompt: "What should the reader feel or know when they finish it?" },
    ],
    ["Chapter opening", "Sections", "Stories or examples", "Chapter close"],
  ),
  meeting_agenda: genericProfile(
    "agenda",
    "Meeting Agenda",
    "Respect everyone's time — outcomes, topics, owners.",
    "Let's plan a meeting that respects everyone's time.\n\nOne question at a time.",
    [
      { id: "who", slot: "who", prompt: "Who needs to be in the room?" },
      { id: "purpose", slot: "why", prompt: "What's the one outcome this meeting must produce?" },
      { id: "duration", slot: "success", prompt: "How long do you have?" },
      { id: "decisions", slot: "what", prompt: "What decisions or actions need to happen?" },
    ],
    ["Purpose", "Agenda items + time", "Pre-read", "Decisions to capture"],
  ),
  white_paper: genericProfile(
    "whitepaper",
    "White Paper",
    "Authority through evidence — problem, insight, path forward.",
    "Let's build a white paper that earns trust and clarity.\n\nOne question at a time.",
    [
      { id: "who", slot: "who", prompt: "Who is the intended reader?" },
      { id: "problem", slot: "why", prompt: "What industry problem or shift are you addressing?" },
      { id: "thesis", slot: "what", prompt: "What's your core argument or insight?" },
      { id: "evidence", slot: "what", prompt: "What evidence, data, or experience supports it?" },
      { id: "success", slot: "success", prompt: "What should they do after reading?" },
    ],
    ["Executive summary", "Problem", "Analysis", "Recommendations", "Conclusion"],
  ),
  workflow: genericProfile(
    "workflow",
    "Workflow",
    "How work moves — triggers, steps, handoffs.",
    "Let's map a workflow your team can follow.\n\nOne question at a time.",
    [
      { id: "who", slot: "who", prompt: "Who follows this workflow?" },
      { id: "trigger", slot: "why", prompt: "What starts the workflow?" },
      { id: "steps", slot: "what", prompt: "What are the main steps or stages?" },
      { id: "handoffs", slot: "what", prompt: "Where does work pass between people or tools?" },
      { id: "success", slot: "success", prompt: "What does done look like?" },
    ],
    ["Trigger", "Steps", "Handoffs", "Exceptions", "Done definition"],
  ),
  document: genericProfile(
    "document",
    "Document",
    "General create — we'll shape discovery to what you're building.",
    "I'd love to help you create this.\n\nLet me understand what you're building — one question at a time.",
    [
      { id: "why", slot: "why", prompt: "What's the main reason you're creating this?" },
      { id: "who", slot: "who", prompt: "Who is it for?" },
      { id: "what", slot: "what", prompt: "What should it contain or accomplish?" },
      { id: "format", slot: "what", prompt: "Any format in mind — letter, outline, script, plan?" },
      { id: "success", slot: "success", prompt: "What would success look like when this is done?" },
    ],
    ["Purpose", "Audience", "Main content", "Next step"],
  ),
};

export function getDocumentCreationProfile(
  type: UniversalDocumentType,
): DocumentCreationProfile {
  return DOCUMENT_CREATION_PROFILES[type] ?? DOCUMENT_CREATION_PROFILES.document;
}

export function getCreationEssence(type: UniversalDocumentType): string {
  return getDocumentCreationProfile(type).essence;
}
