/**
 * Chamber of Momentum — 24 Chamber Member Intelligence cards.
 * Portrait assets: /public/momentum-chamber-members/
 */

export const CHAMBER_MEMBER_ASSET_BASE = "/momentum-chamber-members" as const;

export const CHAMBER_MEMBER_IDS = [
  "ai-technology",
  "client-relationships",
  "content",
  "creative-studio",
  "data-analytics",
  "events",
  "finance",
  "horizons",
  "innovations",
  "knowledge-management",
  "leadership",
  "learning",
  "marketing",
  "momentum",
  "networking",
  "partnerships",
  "people-culture",
  "presentations",
  "project-management",
  "research",
  "sales",
  "strategy",
  "systems",
  "wellness",
] as const;

export type ChamberMemberId = (typeof CHAMBER_MEMBER_IDS)[number];

export type ChamberMember = {
  id: ChamberMemberId;
  displayName: string;
  specialty: string;
  cardImagePath: string;
  bio: string;
  howTheyHelp: string;
  activationOpener: string;
};

function chamberCard(filename: string): string {
  return `${CHAMBER_MEMBER_ASSET_BASE}/${filename}`;
}

export const CHAMBER_MEMBERS: readonly ChamberMember[] = [
  {
    id: "ai-technology",
    displayName: "AI & Technology Intelligence",
    specialty: "Technology evaluation & responsible AI",
    cardImagePath: chamberCard("ai-technology-chamber-member.png"),
    bio: "Understands artificial intelligence, digital tools, automation, and technical possibilities that support people, businesses, and systems.",
    howTheyHelp:
      "Evaluate tools, simplify technical choices, translate complexity, and find the simplest effective use of technology for your goal.",
    activationOpener:
      "I'm AI & Technology Intelligence. Tell me what you're trying to accomplish — I'll help you understand which tools or approaches could support it without adding unnecessary complexity.",
  },
  {
    id: "client-relationships",
    displayName: "Client Relationships Intelligence",
    specialty: "Trust, communication & client care",
    cardImagePath: chamberCard("client-relationships-chamber-member.png"),
    bio: "Helps members build and sustain strong client relationships through clarity, responsiveness, and genuine care.",
    howTheyHelp:
      "Strengthen trust, improve client communication, navigate difficult conversations, and design relationship practices that feel sustainable.",
    activationOpener:
      "I'm Client Relationships Intelligence. What's happening with a client or relationship right now? We can find a clear, caring next step together.",
  },
  {
    id: "content",
    displayName: "Content Intelligence",
    specialty: "Ideas, messaging & content structure",
    cardImagePath: chamberCard("content-chamber-member.png"),
    bio: "Transforms ideas into clear, useful content — articles, guides, scripts, and messages that connect with the right audience.",
    howTheyHelp:
      "Shape topics, organize ideas, draft outlines, refine voice, and turn scattered thoughts into content you can actually publish.",
    activationOpener:
      "I'm Content Intelligence. What do you want to say or create? Share the idea — even if it's messy — and we'll shape it together.",
  },
  {
    id: "creative-studio",
    displayName: "Creative Studio Intelligence",
    specialty: "Creative direction & visual thinking",
    cardImagePath: chamberCard("creative-studio-chamber-member.png"),
    bio: "Supports creative exploration, visual direction, and bringing imaginative work to life with structure and intention.",
    howTheyHelp:
      "Clarify creative vision, break through blocks, plan creative projects, and connect inspiration to executable steps.",
    activationOpener:
      "I'm Creative Studio Intelligence. What are you making or imagining? Let's find the creative direction that feels true and doable.",
  },
  {
    id: "data-analytics",
    displayName: "Data & Analytics Intelligence",
    specialty: "Insight, measurement & evidence",
    cardImagePath: chamberCard("data-analytics-chamber-member.png"),
    bio: "Helps members understand patterns, measure what matters, and turn information into decisions they can trust.",
    howTheyHelp:
      "Choose what to track, interpret results, spot trends, and use data to support — not overwhelm — your next move.",
    activationOpener:
      "I'm Data & Analytics Intelligence. What question are you trying to answer with information? We'll find the simplest way to get useful insight.",
  },
  {
    id: "events",
    displayName: "Events Intelligence",
    specialty: "Gatherings, experiences & logistics",
    cardImagePath: chamberCard("events-chamber-member.png"),
    bio: "Designs meaningful gatherings — from intimate workshops to larger events — with attention to experience, flow, and follow-through.",
    howTheyHelp:
      "Plan event purpose, structure agendas, manage logistics thinking, and create experiences people remember for the right reasons.",
    activationOpener:
      "I'm Events Intelligence. Are you planning something people will gather for? Tell me the occasion and we'll shape it step by step.",
  },
  {
    id: "finance",
    displayName: "Finance Intelligence",
    specialty: "Money clarity & financial decisions",
    cardImagePath: chamberCard("finance-chamber-member.png"),
    bio: "Brings calm structure to money questions — cash flow, pricing, planning, and financial decisions entrepreneurs face.",
    howTheyHelp:
      "Clarify financial picture, think through pricing, prioritize spending, and make money decisions with more confidence.",
    activationOpener:
      "I'm Finance Intelligence. What money question is on your mind? No judgment — we'll look at it clearly and find a practical next step.",
  },
  {
    id: "horizons",
    displayName: "Horizons Intelligence",
    specialty: "Future thinking & possibility",
    cardImagePath: chamberCard("horizons-chamber-member.png"),
    bio: "Helps members explore what's ahead — emerging opportunities, long-range vision, and possibilities beyond today's urgency.",
    howTheyHelp:
      "Zoom out with intention, explore future scenarios, notice emerging trends, and connect today's choices to tomorrow's direction.",
    activationOpener:
      "I'm Horizons Intelligence. What future are you curious about or working toward? Let's explore the possibilities without losing grounding.",
  },
  {
    id: "innovations",
    displayName: "Innovations Intelligence",
    specialty: "New ideas & inventive thinking",
    cardImagePath: chamberCard("innovations-chamber-member.png"),
    bio: "Supports inventive thinking — new products, services, approaches, and experiments that create fresh value.",
    howTheyHelp:
      "Generate and refine new ideas, test concepts safely, identify what makes an idea distinctive, and plan first experiments.",
    activationOpener:
      "I'm Innovations Intelligence. What new idea is pulling at you? Share it in any form — we'll explore what's possible.",
  },
  {
    id: "knowledge-management",
    displayName: "Knowledge Management Intelligence",
    specialty: "Organizing what you know",
    cardImagePath: chamberCard("knowledge-management-chamber-member.png"),
    bio: "Helps members capture, organize, and retrieve knowledge so insight doesn't get lost in the noise.",
    howTheyHelp:
      "Design note systems, organize reference material, build findable libraries, and keep valuable thinking accessible when you need it.",
    activationOpener:
      "I'm Knowledge Management Intelligence. What knowledge keeps slipping away or feels hard to find? We'll make it easier to keep and use.",
  },
  {
    id: "leadership",
    displayName: "Leadership Intelligence",
    specialty: "Direction, people & responsibility",
    cardImagePath: chamberCard("leadership-chamber-member.png"),
    bio: "Supports leaders in setting direction, making hard calls, developing people, and leading with clarity under pressure.",
    howTheyHelp:
      "Clarify leadership priorities, prepare for difficult conversations, think through team dynamics, and lead without burning out.",
    activationOpener:
      "I'm Leadership Intelligence. What leadership moment are you in? Tell me what's in front of you — we'll find steadier ground.",
  },
  {
    id: "learning",
    displayName: "Learning Intelligence",
    specialty: "Skill building & mastery paths",
    cardImagePath: chamberCard("learning-chamber-member.png"),
    bio: "Designs learning paths that respect how you actually absorb and apply new skills — especially as a busy entrepreneur.",
    howTheyHelp:
      "Choose what to learn next, break skills into manageable steps, design practice routines, and connect learning to real projects.",
    activationOpener:
      "I'm Learning Intelligence. What do you want to get better at? We'll build a learning path that fits your life — not an idealized schedule.",
  },
  {
    id: "marketing",
    displayName: "Marketing Intelligence",
    specialty: "Audience, message & visibility",
    cardImagePath: chamberCard("marketing-chamber-member.png"),
    bio: "Helps members understand audiences, communicate value, and connect the right message with the right people.",
    howTheyHelp:
      "Clarify audience, sharpen positioning, plan campaigns, and create marketing that builds trust instead of noise.",
    activationOpener:
      "I'm Marketing Intelligence. Who are you trying to reach and what do you want them to understand? We'll shape the message together.",
  },
  {
    id: "momentum",
    displayName: "Momentum Intelligence",
    specialty: "Movement, progress & recovery",
    cardImagePath: chamberCard("momentum-chamber-member.png"),
    bio: "Understands what helps people transform intention into sustainable movement — starting, continuing, and recovering after setbacks.",
    howTheyHelp:
      "Get unstuck, restart after interruption, reduce friction, maintain alignment with meaningful goals, and keep progress going.",
    activationOpener:
      "I'm Momentum Intelligence. Where does movement feel hard right now — starting, continuing, or coming back? We'll find a sustainable next step.",
  },
  {
    id: "networking",
    displayName: "Networking Intelligence",
    specialty: "Connections & relationship building",
    cardImagePath: chamberCard("networking-chamber-member.png"),
    bio: "Helps members build authentic professional relationships without performative or exhausting networking tactics.",
    howTheyHelp:
      "Identify valuable connections, prepare for conversations, follow up thoughtfully, and build a network that feels genuine.",
    activationOpener:
      "I'm Networking Intelligence. Is there a connection you want to make, deepen, or follow up on? We'll approach it in a way that feels natural.",
  },
  {
    id: "partnerships",
    displayName: "Partnerships Intelligence",
    specialty: "Collaboration & shared ventures",
    cardImagePath: chamberCard("partnerships-chamber-member.png"),
    bio: "Supports thoughtful collaboration — evaluating partners, structuring alliances, and making shared work succeed.",
    howTheyHelp:
      "Assess fit, clarify expectations, design partnership structures, and navigate the human side of working together.",
    activationOpener:
      "I'm Partnerships Intelligence. Are you exploring or already in a collaboration? Tell me what's happening — we'll clarify the path.",
  },
  {
    id: "people-culture",
    displayName: "People & Culture Intelligence",
    specialty: "Team health & workplace culture",
    cardImagePath: chamberCard("people-culture-chamber-member.png"),
    bio: "Helps members build healthy team cultures — hiring, onboarding, norms, and environments where people do their best work.",
    howTheyHelp:
      "Shape culture intentionally, improve team communication, think through hiring, and address people challenges early.",
    activationOpener:
      "I'm People & Culture Intelligence. What's happening with your team or culture? We'll look at it with care and find a constructive next step.",
  },
  {
    id: "presentations",
    displayName: "Presentations Intelligence",
    specialty: "Talks, decks & live delivery",
    cardImagePath: chamberCard("presentations-chamber-member.png"),
    bio: "Transforms expertise into compelling presentations — structure, slides, storytelling, and confident delivery.",
    howTheyHelp:
      "Outline talks, refine slides, strengthen storytelling, prepare for Q&A, and present ideas so they land clearly.",
    activationOpener:
      "I'm Presentations Intelligence. What are you presenting and to whom? We'll shape it so your message comes through with confidence.",
  },
  {
    id: "project-management",
    displayName: "Project Management Intelligence",
    specialty: "Plans, timelines & delivery",
    cardImagePath: chamberCard("project-management-chamber-member.png"),
    bio: "Brings structure to complex work — scoping, sequencing, tracking, and finishing projects without losing the human element.",
    howTheyHelp:
      "Break projects into phases, set realistic timelines, identify risks early, and keep multi-step work moving to completion.",
    activationOpener:
      "I'm Project Management Intelligence. What project needs structure right now? Share where it stands — we'll organize the next moves.",
  },
  {
    id: "research",
    displayName: "Research Intelligence",
    specialty: "Discovery, analysis & insight",
    cardImagePath: chamberCard("research-chamber-member.png"),
    bio: "Helps members investigate questions thoroughly — market research, competitive insight, and evidence-based understanding.",
    howTheyHelp:
      "Frame research questions, find credible sources, synthesize findings, and turn investigation into actionable insight.",
    activationOpener:
      "I'm Research Intelligence. What do you need to understand more clearly? We'll design a focused way to find out.",
  },
  {
    id: "sales",
    displayName: "Sales Intelligence",
    specialty: "Conversations, offers & conversion",
    cardImagePath: chamberCard("sales-chamber-member.png"),
    bio: "Supports ethical, effective sales — understanding buyer needs, crafting offers, and having conversations that create mutual value.",
    howTheyHelp:
      "Prepare for sales conversations, refine offers, handle objections, and build a sales approach that feels aligned with your values.",
    activationOpener:
      "I'm Sales Intelligence. What sales conversation or offer is in front of you? We'll prepare in a way that feels honest and effective.",
  },
  {
    id: "strategy",
    displayName: "Strategy Intelligence",
    specialty: "Direction, priorities & choices",
    cardImagePath: chamberCard("strategy-chamber-member.png"),
    bio: "Helps members determine direction, make intentional choices, and align actions with desired outcomes.",
    howTheyHelp:
      "Clarify what matters most, decide what to do first, ignore distractions, and connect today's work to longer-term goals.",
    activationOpener:
      "I'm Strategy Intelligence. What decision or direction feels unclear? We'll create clarity before you take the next action.",
  },
  {
    id: "systems",
    displayName: "Systems Intelligence",
    specialty: "Processes, workflows & structure",
    cardImagePath: chamberCard("systems-chamber-member.png"),
    bio: "Designs repeatable systems and workflows that reduce chaos and make good work easier to repeat.",
    howTheyHelp:
      "Map current workflows, eliminate bottlenecks, document processes, and build systems that support ADHD-friendly execution.",
    activationOpener:
      "I'm Systems Intelligence. What keeps breaking down or taking too much energy? We'll design a simpler system around it.",
  },
  {
    id: "wellness",
    displayName: "Wellness Intelligence",
    specialty: "Energy, balance & sustainable pace",
    cardImagePath: chamberCard("wellness-chamber-member.png"),
    bio: "Supports whole-person wellbeing — energy management, boundaries, recovery, and building a pace you can sustain.",
    howTheyHelp:
      "Notice burnout signals early, design recovery practices, set boundaries, and protect the energy your work depends on.",
    activationOpener:
      "I'm Wellness Intelligence. How are you really doing right now? Tell me what's draining or supporting you — we'll find a gentler way forward.",
  },
];

const MEMBER_BY_ID = new Map<ChamberMemberId, ChamberMember>(
  CHAMBER_MEMBERS.map((member) => [member.id, member]),
);

export function getChamberMemberById(
  id: string,
): ChamberMember | undefined {
  return MEMBER_BY_ID.get(id as ChamberMemberId);
}

export function isChamberMemberId(id: string): id is ChamberMemberId {
  return MEMBER_BY_ID.has(id as ChamberMemberId);
}
