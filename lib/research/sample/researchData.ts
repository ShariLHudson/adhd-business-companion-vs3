import type {
  ExecutiveResearchReport,
  ResearchAlert,
  ResearchCategory,
  ResearchSuggestedQuery,
} from "../types";

export const RESEARCH_PRINCIPLE =
  "Answer what Shari actually needs to know — never stop at information.";

export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  { id: "artificial-intelligence", label: "Artificial Intelligence", description: "Models, tools, and builder impact" },
  { id: "adhd", label: "ADHD", description: "Founder and member executive function" },
  { id: "entrepreneurship", label: "Entrepreneurship", description: "Small business patterns and growth" },
  { id: "marketing", label: "Marketing", description: "Channels, messaging, and campaigns" },
  { id: "learning-science", label: "Learning Science", description: "How people actually learn" },
  { id: "customer-psychology", label: "Customer Psychology", description: "Motivation, trust, and behavior" },
  { id: "product-design", label: "Product Design", description: "Experience and usability" },
  { id: "accessibility", label: "Accessibility", description: "Inclusive design and EF support" },
  { id: "technology", label: "Technology", description: "Platforms, APIs, and build tools" },
  { id: "future-trends", label: "Future Trends", description: "Where the market is moving" },
  { id: "competitors", label: "Competitors", description: "Adjacent products and gaps" },
  { id: "social-media", label: "Social Media", description: "Organic and community patterns" },
  { id: "pinterest", label: "Pinterest", description: "Visual discovery and saves" },
  { id: "youtube", label: "YouTube", description: "Video and long-form reach" },
  { id: "books", label: "Books", description: "Foundational reading" },
  { id: "podcasts", label: "Podcasts", description: "Conversations and thought leaders" },
  { id: "academic-research", label: "Academic Research", description: "Peer-reviewed evidence" },
  { id: "business-strategy", label: "Business Strategy", description: "Positioning and bets" },
  { id: "leadership", label: "Leadership", description: "Team and founder development" },
  { id: "operations", label: "Operations", description: "How work gets done" },
  { id: "finance", label: "Finance", description: "Revenue, cost, and runway" },
  { id: "automation", label: "Automation", description: "Workflows and leverage" },
  { id: "community", label: "Community", description: "Belonging and member culture" },
];

export const SUGGESTED_RESEARCH_QUERIES: ResearchSuggestedQuery[] = [
  { id: "sq-adhd-founders", phrase: "What are ADHD founders struggling with this month?", categoryId: "adhd" },
  { id: "sq-ai-time", phrase: "What AI tools could save us time?", categoryId: "artificial-intelligence" },
  { id: "sq-products", phrase: "What products should Spark build next?", categoryId: "product-design" },
  { id: "sq-reddit", phrase: "What are people asking on Reddit about ADHD business?", categoryId: "community" },
  { id: "sq-competitors", phrase: "What opportunities are competitors missing?", categoryId: "competitors" },
  { id: "sq-learn", phrase: "What should I learn next?", categoryId: "learning-science" },
];

export const SIGNIFICANT_RESEARCH_ALERTS: ResearchAlert[] = [
  {
    id: "alert-ai-dev-speed",
    title: "New coding models may cut implementation time significantly",
    whatHappened:
      "Several teams report 40–60% faster feature delivery when pairing structured specs with newer agentic coding workflows.",
    whyItMatters:
      "Spark ships through Cursor — faster, calmer builds mean more member-facing polish without exhausting you.",
    suggestedAction: "test",
    actionRationale: "Run one bounded experiment on a non-critical Founder room before changing how we spec work.",
    confidence: "medium",
    categoryId: "artificial-intelligence",
    significant: true,
  },
  {
    id: "alert-adhd-restart",
    title: "Shame-free restart rituals are trending among ADHD entrepreneurs",
    whatHappened:
      "Community forums and coaching circles emphasize gentle return flows over streak-based accountability.",
    whyItMatters:
      "Aligns with Spark’s Relationship Constitution — members who feel safe returning stay longer.",
    suggestedAction: "adopt",
    actionRationale: "Already matches Companion voice; formalize in Listening Rooms onboarding copy.",
    confidence: "high",
    categoryId: "adhd",
    significant: true,
  },
  {
    id: "alert-pinterest-algo",
    title: "Pinterest is favoring idea pins with clear save intent",
    whatHappened:
      "Creators report higher reach when pins teach one micro-skill with a single save-worthy takeaway.",
    whyItMatters:
      "PostCraft can test calmer, educational pins without heavy production.",
    suggestedAction: "watch",
    actionRationale: "Track two weeks of saves before shifting campaign strategy.",
    confidence: "medium",
    categoryId: "pinterest",
    significant: true,
  },
];

const DEFAULT_PREP_OFFERS: ExecutiveResearchReport["prepOffers"] = [
  { id: "prep-mission", kind: "mission", label: "Mission update", description: "Draft mission language tied to this research.", status: "draft" },
  { id: "prep-cursor", kind: "cursor-prompt", label: "Cursor prompt", description: "Implementation-ready prompt for Innovation Lab.", status: "draft" },
  { id: "prep-dev", kind: "development-plan", label: "Development plan", description: "Phased build outline with approval gates.", status: "draft" },
  { id: "prep-postcraft", kind: "postcraft-campaign", label: "PostCraft campaign", description: "Content queue outline — not published.", status: "draft" },
  { id: "prep-marketing", kind: "marketing-strategy", label: "Marketing strategy", description: "Channel and message sketch.", status: "draft" },
  { id: "prep-workshop", kind: "workshop", label: "Workshop outline", description: "Session arc from research findings.", status: "draft" },
  { id: "prep-brief", kind: "executive-brief", label: "Executive brief", description: "One-page summary for approval.", status: "draft" },
  { id: "prep-decision", kind: "decision-comparison", label: "Decision comparison", description: "Options with tradeoffs for Decision Vault.", status: "draft" },
];

export const SAMPLE_RESEARCH_REPORTS: ExecutiveResearchReport[] = [
  {
    id: "report-adhd-founders-month",
    query: "What are ADHD founders struggling with this month?",
    categoryId: "adhd",
    categoryLabel: "ADHD",
    generatedAt: "2026-07-06T10:00:00.000Z",
    soWhatScore: 92,
    passesSoWhatRule: true,
    answer:
      "ADHD founders are most strained by restart shame after absence, decision pile-up before creative work, and tools that punish inconsistency.",
    evidence: [
      "Forum themes: ‘afraid to open my business app’ after 3+ day breaks",
      "Coaching posts: micro-restart beats weekly planning for EF load",
      "Member-adjacent signals: Companion returns spike when greeting is non-judgmental",
    ],
    executiveSummary:
      "The dominant pain this month is not lack of ambition — it is the emotional cost of returning after life interrupts. Founders want permission to restart small without losing dignity or momentum.",
    explainLikeImBusy:
      "People aren’t lazy — they’re avoiding the shame hit when they come back. Spark wins by making return feel safe and tiny.",
    whatChangedSinceLastTime:
      "More public conversation about ‘gentle accountability’ vs. streaks compared to last quarter’s hustle content.",
    whyThisMatters:
      "Visual Spark Studios serves entrepreneurs with ADHD patterns. If we optimize for daily streaks, we fight our members’ nervous systems.",
    howThisAffectsSpark:
      "Companion arrival copy, Founder morning tone, and Listening Rooms follow-up should assume irregular rhythm — not failure.",
    howThisHelpsMembers:
      "Members stay when return feels welcoming. Micro-wins beat grand plans on day one back.",
    howThisHelpsBusiness:
      "Retention and word-of-mouth improve when people feel understood — not managed.",
    howThisHelpsPersonally:
      "You can stop measuring yourself against daily SaaS metrics that were never built for your brain.",
    bestOpportunities: [
      "‘Welcome back’ Companion flow without day-count surveillance",
      "Listening Room module on shame-free restart",
      "Founder playbook: Recovery Before Productivity",
    ],
    potentialRisks: [
      "Over-indexing on return may under-serve high-momentum days",
      "Copy that sounds therapeutic without permission",
    ],
    recommendedNextSteps: [
      "Approve draft Companion return phrases for CT-11 review",
      "Queue PostCraft pin: ‘The first five minutes back’",
      "Add lesson to Institutional Memory under Recovery",
    ],
    confidence: "high",
    confidenceRationale: "Consistent across forums, coaching discourse, and our own member themes.",
    sources: [
      { id: "src-adhd-reddit", title: "r/ADHD entrepreneurs weekly thread themes", kind: "forum", publisher: "Reddit" },
      { id: "src-spark-companion", title: "Companion return conversation patterns (internal)", kind: "report", publisher: "Visual Spark Studios" },
      { id: "src-learning-ef", title: "Executive function and re-engagement", kind: "article", publisher: "Learning science summary" },
    ],
    relatedMissions: ["listening-rooms", "companion-trust"],
    relatedProducts: ["Spark Companion", "Listening Rooms"],
    relatedCustomerProblems: ["Return guilt", "Decision fatigue before action"],
    relatedContentOpportunities: ["Restart ritual workshop", "Pinterest save: 5-minute return"],
    relatedAutomationOpportunities: ["GHL gentle check-in sequence (permission required)"],
    sparkApplications: [
      { target: "companion", summary: "Soften return greetings; one question only" },
      { target: "listening-rooms", summary: "Workshop on shame-free restart" },
      { target: "marketing", summary: "Lead with belonging, not productivity shame" },
      { target: "member-success", summary: "Celebrate return, not streaks" },
    ],
    outsideTheBox: {
      unexpectedConnections: ["Hospitality industry ‘welcome back’ rituals", "Game design ‘continue’ screens vs. punishment"],
      industriesDoingBetter: ["Fitness apps with pause-not-fail", "Banking apps with no ‘you’ve been away’ guilt"],
      ideasToBorrow: ["Single ‘resume here’ card instead of inbox dump"],
      futurePossibilities: ["Arrival Intelligence that detects absence tone, not day count"],
      questionsWorthExploring: ["What does Shari need on her own return days?"],
    },
    valueMetrics: {
      researchTimeSavedHours: 4,
      implementationTimeSavedHours: 6,
      potentialRevenueOpportunity: "medium",
      memberImpact: "high",
      automationPotential: "medium",
      competitiveAdvantage: "high",
      strategicImportance: "high",
    },
    boardPerspectives: [
      { id: "ceo", label: "CEO", summary: "This is brand-defining — we teach what we live.", recommendation: "Prioritize return experience in Q3 mission." },
      { id: "marketing", label: "Marketing", summary: "Message will resonate widely if authentic.", recommendation: "Test one story-led email — not a funnel blast." },
      { id: "customer", label: "Customer", summary: "Members describe relief when not judged.", recommendation: "Interview three members who returned after absence." },
      { id: "adhd", label: "ADHD", summary: "EF load spikes on re-entry; reduce choices.", recommendation: "One next action on return — always." },
    ],
    boardRecommendation:
      "Adopt gentle return as a cross-ecosystem standard. Test marketing story first; implement Companion copy with permission.",
    prepOffers: DEFAULT_PREP_OFFERS,
  },
  {
    id: "report-ai-tools-time",
    query: "What AI tools could save us time?",
    categoryId: "artificial-intelligence",
    categoryLabel: "Artificial Intelligence",
    generatedAt: "2026-07-06T11:30:00.000Z",
    soWhatScore: 88,
    passesSoWhatRule: true,
    answer:
      "The highest leverage for Visual Spark Studios is not more AI tools — it is structured specs + agentic coding for Founder builds, and research synthesis before Shari reads anything.",
    evidence: [
      "Internal: Cursor + clear packets beats ad-hoc prompting",
      "Market: teams report largest gains from spec discipline, not model swaps",
      "Risk: tool sprawl increases context switching for ADHD founders",
    ],
    executiveSummary:
      "Consolidate on Cursor for build, Founder Research for synthesis, and PostCraft for content prep. Avoid adding new chat surfaces.",
    explainLikeImBusy:
      "You don’t need ten AI apps. You need one research department and one build lane that already knows Spark.",
    whatChangedSinceLastTime: "Agentic coding maturity improved; model brand matters less than workflow.",
    whyThisMatters: "Every new tool is a tax on your attention.",
    howThisAffectsSpark: "Executive Research Center becomes the synthesis layer — not another chat box.",
    howThisHelpsMembers: "Faster, calmer shipping means better Companion and Estate.",
    howThisHelpsBusiness: "Hours returned to creation and relationships.",
    howThisHelpsPersonally: "Less ‘which tool was that in?’ searching.",
    bestOpportunities: [
      "Research Center → Cursor prompt pipeline",
      "Overnight research summaries into morning brief",
      "PostCraft queue from research packets",
    ],
    potentialRisks: ["Over-automation without approval gates", "Generic AI voice leaking into Spark"],
    recommendedNextSteps: [
      "Use Research Center prep offers after your next inquiry",
      "Pilot one Founder room build from research packet only",
      "Decline new AI subscriptions until leverage proven",
    ],
    confidence: "high",
    confidenceRationale: "Matches our build practice and Constitution attention principle.",
    sources: [
      { id: "src-cursor-practice", title: "Spark build sprint retrospectives", kind: "report", publisher: "Internal" },
      { id: "src-ai-news", title: "Agentic development workflow surveys", kind: "news", publisher: "Industry summary" },
    ],
    relatedMissions: ["founder-studio", "innovation-lab"],
    relatedProducts: ["Founder Studio", "Innovation Lab"],
    relatedCustomerProblems: ["Slow feature polish"],
    relatedContentOpportunities: ["‘How we build Spark calmly’ founder letter"],
    relatedAutomationOpportunities: ["Research → implementation packet automation"],
    sparkApplications: [
      { target: "founder", summary: "Research Center as private research department" },
      { target: "automation", summary: "Packet handoff to Cursor — draft only" },
      { target: "product-design", summary: "Fewer tools, clearer packets" },
    ],
    outsideTheBox: {
      unexpectedConnections: ["Executive chiefs of staff who pre-read everything"],
      industriesDoingBetter: ["Studios with single ‘research brief’ format"],
      ideasToBorrow: ["Hollywood story department packets"],
      futurePossibilities: ["Research that remembers every past launch"],
      questionsWorthExploring: ["Which tasks still require Shari’s judgment vs. prep?"],
    },
    valueMetrics: {
      researchTimeSavedHours: 8,
      implementationTimeSavedHours: 12,
      potentialRevenueOpportunity: "medium",
      memberImpact: "medium",
      automationPotential: "high",
      competitiveAdvantage: "high",
      strategicImportance: "high",
    },
    boardPerspectives: [
      { id: "innovation", label: "Innovation", summary: "Spec discipline unlocks speed.", recommendation: "Standardize research packets before build." },
      { id: "technology", label: "Technology", summary: "Cursor remains primary build surface.", recommendation: "No parallel dev AI without Governor review." },
      { id: "operations", label: "Operations", summary: "Fewer tools, clearer handoffs.", recommendation: "Document Research → Cursor path in Team Hub." },
    ],
    boardRecommendation: "Invest in Research Center workflow — not new AI subscriptions.",
    prepOffers: DEFAULT_PREP_OFFERS,
  },
];

export function getSampleReport(id: string): ExecutiveResearchReport | undefined {
  return SAMPLE_RESEARCH_REPORTS.find((r) => r.id === id);
}

export function listSampleReports(): ExecutiveResearchReport[] {
  return SAMPLE_RESEARCH_REPORTS.map((r) => ({ ...r }));
}
