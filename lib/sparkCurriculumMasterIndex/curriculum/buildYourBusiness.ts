/**
 * Pillar II — Build Your Business curriculum map
 */

import { buildCurriculumEntry, EXPERIENCE_BUNDLES } from "../buildEntry";
import type { CurriculumMasterIndexEntry } from "../types";

const P = "build_your_business" as const;

function t(
  deptId: string,
  deptTitle: string,
  drawerSlug: string,
  drawerTitle: string,
  slug: string,
  title: string,
  shortDescription: string,
  capabilityFocus: string,
  competencies: string[],
  opts: {
    stages?: ("idea" | "launch" | "growth" | "scale" | "mature" | "all")[];
    adhd?: "none" | "low" | "medium" | "high";
    ai?: "none" | "low" | "medium" | "high";
    difficulty?: "foundational" | "intermediate" | "advanced" | "expert";
    minutes?: number;
    bundle?: keyof typeof EXPERIENCE_BUNDLES;
    sort: number;
  },
): CurriculumMasterIndexEntry {
  return buildCurriculumEntry({
    pillarId: P,
    departmentId: deptId,
    departmentTitle: deptTitle,
    drawerSlug,
    drawerTitle,
    slug,
    title,
    shortDescription,
    capabilityFocus,
    primaryCompetencies: competencies,
    businessStages: opts.stages ?? ["all"],
    adhdRelevance: opts.adhd ?? "low",
    aiRelevance: opts.ai ?? "medium",
    difficulty: opts.difficulty ?? "foundational",
    estimatedMinutes: opts.minutes ?? 15,
    futureLearningExperiences: EXPERIENCE_BUNDLES[opts.bundle ?? "core"],
    sortOrder: opts.sort,
  });
}

export const BUILD_YOUR_BUSINESS_CURRICULUM: CurriculumMasterIndexEntry[] = [
  // Business Foundations
  t("dept-business-foundations", "Business Foundations", "business-models", "Business Models", "model-selection", "Business Model Selection", "Choose how your business creates and captures value.", "Select a business model that fits your strengths.", ["business-foundations", "business-strategy"], { stages: ["idea", "launch"], sort: 1 }),
  t("dept-business-foundations", "Business Foundations", "business-planning", "Business Planning", "one-page-plan", "One Page Business Plan", "A plan you will actually use.", "Create a living plan without overwhelm.", ["business-planning", "business-foundations"], { stages: ["idea", "launch"], adhd: "high", sort: 1 }),
  t("dept-business-foundations", "Business Foundations", "mission", "Mission", "mission-statement", "Mission Statement", "Why your business exists.", "Articulate mission that guides decisions.", ["mission-vision", "business-foundations"], { sort: 1 }),
  t("dept-business-foundations", "Business Foundations", "vision", "Vision", "vision-casting", "Vision Casting", "Where you are building toward.", "Hold a clear vision without rigidity.", ["mission-vision", "business-strategy"], { sort: 1 }),
  t("dept-business-foundations", "Business Foundations", "niche", "Niche", "niche-selection", "Niche Selection", "Who you serve best.", "Choose a niche you can serve exceptionally.", ["business-strategy", "marketing"], { stages: ["idea", "launch"], sort: 1 }),
  t("dept-business-foundations", "Business Foundations", "ideal-client", "Ideal Client", "ideal-client-profile", "Ideal Client Profile", "Know who you are really for.", "Define ideal clients with specificity.", ["marketing", "business-foundations"], { sort: 1 }),
  t("dept-business-foundations", "Business Foundations", "values", "Values", "business-values", "Business Values", "Values that shape culture and offers.", "Operationalize values in daily business.", ["mission-vision", "culture"], { sort: 1 }),
  // Strategy
  t("dept-strategy", "Strategy", "offers", "Offers", "offer-design", "Offer Design", "Design offers people want to buy.", "Design compelling, clear offers.", ["offers", "business-strategy"], { bundle: "mastery", sort: 1 }),
  t("dept-strategy", "Strategy", "offers", "Offers", "offer-stack", "Offer Stack", "How offers relate and ascend.", "Structure offers for growth and clarity.", ["offers", "business-growth"], { difficulty: "intermediate", sort: 2 }),
  t("dept-strategy", "Strategy", "competitive-advantage", "Competitive Advantage", "differentiation", "Differentiation", "What makes you the obvious choice.", "Articulate durable differentiation.", ["business-strategy", "positioning"], { difficulty: "intermediate", sort: 1 }),
  t("dept-strategy", "Strategy", "pivoting", "Pivoting", "strategic-pivot", "Strategic Pivot", "When and how to pivot wisely.", "Pivot with evidence, not panic.", ["business-strategy", "decision-making"], { stages: ["launch", "growth"], sort: 1 }),
  // Marketing
  t("dept-marketing", "Marketing", "pricing", "Pricing", "pricing-psychology", "Pricing Psychology", "How price shapes perception.", "Price with psychology and integrity.", ["pricing", "sales"], { bundle: "mastery", sort: 1 }),
  t("dept-marketing", "Marketing", "pricing", "Pricing", "value-based-pricing", "Value-Based Pricing", "Price on value delivered.", "Align price to value delivered.", ["pricing", "business-strategy"], { difficulty: "advanced", sort: 2 }),
  t("dept-marketing", "Marketing", "messaging", "Messaging", "core-message", "Core Message", "The one thing people should remember.", "Craft a message that lands.", ["messaging", "marketing"], { sort: 1 }),
  t("dept-marketing", "Marketing", "positioning", "Positioning", "market-positioning", "Market Positioning", "Where you sit in the market.", "Position clearly against alternatives.", ["positioning", "marketing"], { difficulty: "intermediate", sort: 1 }),
  t("dept-marketing", "Marketing", "headlines", "Headlines", "headline-writing", "Headline Writing", "Headlines that earn attention.", "Write headlines that earn the click.", ["copywriting", "marketing"], { bundle: "practice", sort: 1 }),
  t("dept-marketing", "Marketing", "storytelling", "Storytelling", "brand-story", "Brand Story", "Stories that build trust.", "Tell stories that connect and convert.", ["storytelling", "branding"], { bundle: "mastery", sort: 1 }),
  t("dept-marketing", "Marketing", "copywriting", "Copywriting", "persuasive-copy", "Persuasive Copy", "Copy that moves people to act.", "Write copy that respects the reader.", ["copywriting", "marketing"], { bundle: "practice", sort: 1 }),
  t("dept-marketing", "Marketing", "content-strategy", "Content Strategy", "content-planning", "Content Planning", "Content that serves strategy.", "Plan content that builds capability and demand.", ["content-creation", "marketing"], { sort: 1 }),
  t("dept-marketing", "Marketing", "email-marketing", "Email Marketing", "email-sequences", "Email Sequences", "Email that nurtures and sells.", "Build email sequences that serve.", ["marketing", "copywriting"], { stages: ["launch", "growth"], sort: 1 }),
  t("dept-marketing", "Marketing", "social-proof", "Social Proof", "testimonials", "Testimonials", "Proof that reduces buyer risk.", "Gather and use social proof ethically.", ["marketing", "sales"], { sort: 1 }),
  t("dept-marketing", "Marketing", "launches", "Launches", "launch-strategy", "Launch Strategy", "Launches without chaos.", "Execute launches with calm structure.", ["marketing", "business-growth"], { stages: ["launch", "growth"], bundle: "mastery", sort: 1 }),
  t("dept-marketing", "Marketing", "funnels", "Funnels", "simple-funnels", "Simple Funnels", "Funnels that do not overwhelm.", "Design funnels you can maintain.", ["marketing", "systems"], { difficulty: "intermediate", sort: 1 }),
  t("dept-marketing", "Marketing", "lead-magnets", "Lead Magnets", "lead-magnet-design", "Lead Magnet Design", "Ethical lead magnets that deliver value.", "Create lead magnets worth opting in for.", ["marketing", "offers"], { sort: 1 }),
  // Branding
  t("dept-branding", "Branding", "branding", "Branding", "brand-identity", "Brand Identity", "Identity beyond logos.", "Build brand identity with coherence.", ["branding", "positioning"], { bundle: "core", sort: 1 }),
  t("dept-branding", "Branding", "brand-voice", "Brand Voice", "voice-and-tone", "Voice And Tone", "Sound like yourself at scale.", "Define voice that scales across channels.", ["branding", "copywriting"], { sort: 1 }),
  t("dept-branding", "Branding", "trust", "Trust", "brand-trust", "Brand Trust", "Trust signals that compound.", "Build trust through consistent signals.", ["branding", "customer-experience"], { sort: 1 }),
  // Sales
  t("dept-sales", "Sales", "sales-psychology", "Sales Psychology", "buyer-psychology", "Buyer Psychology", "How buyers decide.", "Understand buyer psychology ethically.", ["sales", "marketing"], { bundle: "mastery", sort: 1 }),
  t("dept-sales", "Sales", "discovery-calls", "Discovery Calls", "discovery-framework", "Discovery Framework", "Questions that uncover real needs.", "Run discovery that builds trust.", ["sales", "listening"], { bundle: "practice", sort: 1 }),
  t("dept-sales", "Sales", "closing", "Closing", "ethical-closing", "Ethical Closing", "Close without pressure tactics.", "Close sales with confidence and care.", ["sales", "confidence"], { bundle: "practice", sort: 1 }),
  t("dept-sales", "Sales", "objections", "Objections", "handling-objections", "Handling Objections", "Objections as information.", "Handle objections without defensiveness.", ["sales", "communication"], { difficulty: "intermediate", sort: 1 }),
  t("dept-sales", "Sales", "proposals", "Proposals", "winning-proposals", "Winning Proposals", "Proposals that clarify value.", "Write proposals that win fairly.", ["sales", "offers"], { sort: 1 }),
  t("dept-sales", "Sales", "follow-up", "Follow Up", "follow-up-system", "Follow Up System", "Follow up without being annoying.", "Follow up consistently and respectfully.", ["sales", "systems"], { adhd: "medium", sort: 1 }),
  // Customer Experience
  t("dept-customer-experience", "Customer Experience", "customer-journey", "Customer Journey", "journey-mapping", "Journey Mapping", "See the journey through their eyes.", "Map journeys that reveal friction.", ["customer-experience", "systems-thinking"], { bundle: "practice", sort: 1 }),
  t("dept-customer-experience", "Customer Experience", "onboarding", "Onboarding", "client-onboarding", "Client Onboarding", "Onboarding that creates confidence.", "Onboard clients for early wins.", ["customer-experience", "operations"], { sort: 1 }),
  t("dept-customer-experience", "Customer Experience", "retention", "Retention", "customer-retention", "Customer Retention", "Keep clients longer through value.", "Improve retention through experience.", ["customer-experience", "business-growth"], { stages: ["growth", "scale"], sort: 1 }),
  t("dept-customer-experience", "Customer Experience", "support", "Support", "support-excellence", "Support Excellence", "Support that builds loyalty.", "Deliver support that strengthens trust.", ["customer-experience", "communication"], { sort: 1 }),
  t("dept-customer-experience", "Customer Experience", "feedback", "Feedback", "customer-feedback", "Customer Feedback", "Feedback loops that improve offers.", "Use feedback to improve offers.", ["customer-experience", "innovation"], { sort: 1 }),
  // Finance
  t("dept-finance", "Finance", "cash-flow", "Cash Flow", "cash-flow-basics", "Cash Flow Basics", "Cash in, cash out, timing.", "Read and manage cash flow.", ["cash-flow", "finance"], { bundle: "core", sort: 1 }),
  t("dept-finance", "Finance", "profit", "Profit", "profit-first", "Profit First Thinking", "Profit as a design choice.", "Design for profit, not hope.", ["profitability", "finance"], { difficulty: "intermediate", sort: 1 }),
  t("dept-finance", "Finance", "forecasting", "Forecasting", "financial-forecasting", "Financial Forecasting", "Forecasts you can trust enough to use.", "Forecast without false precision.", ["finance", "business-planning"], { difficulty: "intermediate", sort: 1 }),
  t("dept-finance", "Finance", "budgeting", "Budgeting", "business-budget", "Business Budget", "Budgets that guide decisions.", "Budget for decisions, not guilt.", ["finance", "planning"], { adhd: "medium", sort: 1 }),
  t("dept-finance", "Finance", "unit-economics", "Unit Economics", "unit-economics", "Unit Economics", "Know if each sale actually works.", "Understand unit economics clearly.", ["finance", "business-strategy"], { difficulty: "advanced", stages: ["growth", "scale"], sort: 1 }),
  t("dept-finance", "Finance", "tax-awareness", "Tax Awareness", "tax-basics", "Tax Basics", "High-level tax awareness for founders.", "Avoid surprise tax pain.", ["finance", "legal-risk-awareness"], { sort: 1 }),
  // Operations
  t("dept-operations", "Operations", "hiring", "Hiring", "first-hire", "First Hire", "Hire when it truly helps.", "Make first hires with clarity.", ["hiring", "operations"], { stages: ["growth", "scale"], bundle: "mastery", sort: 1 }),
  t("dept-operations", "Operations", "delegation", "Delegation", "effective-delegation", "Effective Delegation", "Delegate outcomes, not just tasks.", "Delegate in ways that stick.", ["delegation", "leadership"], { bundle: "practice", sort: 1 }),
  t("dept-operations", "Operations", "team-onboarding", "Team Onboarding", "onboarding-team", "Onboarding Team Members", "Onboard team for autonomy.", "Onboard team members for success.", ["operations", "hiring"], { sort: 1 }),
  t("dept-operations", "Operations", "vendor-management", "Vendor Management", "working-with-vendors", "Working With Vendors", "Vendors as partners.", "Manage vendors with clear expectations.", ["operations", "negotiation"], { sort: 1 }),
  // Systems
  t("dept-systems", "Systems", "sops", "SOPs", "writing-sops", "Writing SOPs", "SOPs people actually follow.", "Document processes that reduce chaos.", ["systems", "operations"], { bundle: "practice", sort: 1 }),
  t("dept-systems", "Systems", "automation", "Automation", "business-automation", "Business Automation", "Automate repeat work wisely.", "Automate without losing humanity.", ["automation", "systems"], { ai: "high", bundle: "mastery", sort: 1 }),
  t("dept-systems", "Systems", "crm", "CRM", "crm-basics", "CRM Basics", "CRM as relationship memory.", "Use CRM to remember people well.", ["systems", "sales"], { sort: 1 }),
  t("dept-systems", "Systems", "documentation", "Documentation", "documentation-culture", "Documentation Culture", "Document so future-you benefits.", "Build documentation habits.", ["systems", "executive-function"], { adhd: "medium", sort: 1 }),
  // Project Management
  t("dept-project-management", "Project Management", "scopes", "Scopes", "project-scoping", "Project Scoping", "Scopes that prevent scope creep.", "Scope projects to finish them.", ["project-management", "planning"], { sort: 1 }),
  t("dept-project-management", "Project Management", "timelines", "Timelines", "realistic-timelines", "Realistic Timelines", "Timelines ADHD brains can trust.", "Plan timelines that account for reality.", ["project-management", "time-management"], { adhd: "high", sort: 1 }),
  t("dept-project-management", "Project Management", "capacity", "Capacity", "capacity-planning", "Capacity Planning", "Know how much you can carry.", "Plan capacity without overcommitting.", ["project-management", "executive-function"], { adhd: "high", sort: 1 }),
  // AI for Business
  t("dept-ai-for-business", "AI for Business", "ai-literacy", "AI Literacy", "ai-foundations", "AI Foundations", "What AI can and cannot do for business.", "Use AI with realistic expectations.", ["ai-for-business"], { ai: "high", bundle: "core", sort: 1 }),
  t("dept-ai-for-business", "AI for Business", "prompts", "Prompts", "prompt-engineering", "Prompt Engineering", "Prompts that produce useful work.", "Write prompts that save real time.", ["ai-for-business", "content-creation"], { ai: "high", bundle: "practice", sort: 1 }),
  t("dept-ai-for-business", "AI for Business", "ai-workflows", "AI Workflows", "ai-in-operations", "AI In Operations", "Embed AI in repeatable workflows.", "Build AI workflows that compound.", ["ai-for-business", "automation"], { ai: "high", bundle: "mastery", sort: 1 }),
  t("dept-ai-for-business", "AI for Business", "ai-ethics", "AI Ethics", "responsible-ai", "Responsible AI", "Ethical AI use in your business.", "Use AI responsibly with customers.", ["ai-for-business", "legal-risk-awareness"], { ai: "high", sort: 1 }),
  // Business Growth
  t("dept-business-growth", "Business Growth", "scaling", "Scaling", "scaling-basics", "Scaling Basics", "Grow without breaking what works.", "Scale operations thoughtfully.", ["scaling", "business-growth"], { stages: ["growth", "scale"], bundle: "mastery", sort: 1 }),
  t("dept-business-growth", "Business Growth", "partnerships", "Partnerships", "strategic-partnerships", "Strategic Partnerships", "Partnerships that multiply reach.", "Build partnerships with aligned incentives.", ["partnerships", "business-growth"], { bundle: "practice", sort: 1 }),
  t("dept-business-growth", "Business Growth", "expansion", "Expansion", "market-expansion", "Market Expansion", "Enter new markets deliberately.", "Expand with research and restraint.", ["business-growth", "business-strategy"], { difficulty: "advanced", stages: ["scale"], sort: 1 }),
  t("dept-business-growth", "Business Growth", "content-engine", "Content Engine", "content-at-scale", "Content At Scale", "Content systems for growth.", "Build content engines sustainably.", ["content-creation", "business-growth"], { bundle: "legacy", sort: 1 }),
  // Legal & Risk
  t("dept-legal-risk-awareness", "Legal & Risk Awareness", "contracts", "Contracts", "contract-basics", "Contract Basics", "High-level contract awareness.", "Navigate contracts with informed caution.", ["legal-risk-awareness"], { sort: 1 }),
  t("dept-legal-risk-awareness", "Legal & Risk Awareness", "ip-basics", "IP Basics", "intellectual-property", "Intellectual Property", "Protect what you create.", "Understand IP basics for creators.", ["legal-risk-awareness", "content-creation"], { sort: 1 }),
  t("dept-legal-risk-awareness", "Legal & Risk Awareness", "compliance", "Compliance", "compliance-mindset", "Compliance Mindset", "Reduce preventable risk.", "Develop a calm compliance mindset.", ["legal-risk-awareness"], { sort: 1 }),
];
