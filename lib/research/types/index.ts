/** Executive Research Center — research engine types (Founder Studio). */

export type ResearchCategoryId =
  | "artificial-intelligence"
  | "adhd"
  | "entrepreneurship"
  | "marketing"
  | "learning-science"
  | "customer-psychology"
  | "product-design"
  | "accessibility"
  | "technology"
  | "future-trends"
  | "competitors"
  | "social-media"
  | "pinterest"
  | "youtube"
  | "books"
  | "podcasts"
  | "academic-research"
  | "business-strategy"
  | "leadership"
  | "operations"
  | "finance"
  | "automation"
  | "community";

export type ResearchConfidenceLevel = "high" | "medium" | "low" | "exploratory";

export type ResearchAlertAction = "adopt" | "test" | "watch" | "ignore";

export type ResearchPrepKind =
  | "mission"
  | "cursor-prompt"
  | "development-plan"
  | "postcraft-campaign"
  | "marketing-strategy"
  | "workshop"
  | "course"
  | "lead-magnet"
  | "executive-brief"
  | "decision-comparison";

export type SparkApplicationTarget =
  | "founder"
  | "companion"
  | "postcraft"
  | "listening-rooms"
  | "team-hub"
  | "customer-experience"
  | "marketing"
  | "research"
  | "automation"
  | "product-design"
  | "member-success";

export type ResearchBoardPerspectiveId =
  | "ceo"
  | "marketing"
  | "customer"
  | "innovation"
  | "operations"
  | "financial"
  | "adhd"
  | "technology";

export type ResearchSource = {
  id: string;
  title: string;
  url?: string;
  publisher?: string;
  publishedAt?: string;
  kind: "article" | "study" | "report" | "forum" | "podcast" | "book" | "news";
};

export type ResearchValueMetrics = {
  researchTimeSavedHours: number;
  implementationTimeSavedHours: number;
  potentialRevenueOpportunity: "high" | "medium" | "low" | "none";
  memberImpact: "high" | "medium" | "low";
  automationPotential: "high" | "medium" | "low";
  competitiveAdvantage: "high" | "medium" | "low";
  strategicImportance: "high" | "medium" | "low";
};

export type ResearchOutsideTheBox = {
  unexpectedConnections: string[];
  industriesDoingBetter: string[];
  ideasToBorrow: string[];
  futurePossibilities: string[];
  questionsWorthExploring: string[];
};

export type ResearchBoardPerspective = {
  id: ResearchBoardPerspectiveId;
  label: string;
  summary: string;
  recommendation: string;
};

export type ResearchPrepOffer = {
  id: string;
  kind: ResearchPrepKind;
  label: string;
  description: string;
  status: "draft";
};

export type ResearchAlert = {
  id: string;
  title: string;
  whatHappened: string;
  whyItMatters: string;
  suggestedAction: ResearchAlertAction;
  actionRationale: string;
  confidence: ResearchConfidenceLevel;
  categoryId: ResearchCategoryId;
  significant: true;
};

export type ExecutiveResearchReport = {
  id: string;
  query: string;
  categoryId: ResearchCategoryId;
  categoryLabel: string;
  generatedAt: string;
  soWhatScore: number;
  passesSoWhatRule: boolean;
  executiveSummary: string;
  explainLikeImBusy: string;
  whatChangedSinceLastTime?: string;
  whyThisMatters: string;
  howThisAffectsSpark: string;
  howThisHelpsMembers: string;
  howThisHelpsBusiness: string;
  howThisHelpsPersonally: string;
  bestOpportunities: string[];
  potentialRisks: string[];
  recommendedNextSteps: string[];
  confidence: ResearchConfidenceLevel;
  confidenceRationale: string;
  sources: ResearchSource[];
  relatedMissions: string[];
  relatedProducts: string[];
  relatedCustomerProblems: string[];
  relatedContentOpportunities: string[];
  relatedAutomationOpportunities: string[];
  sparkApplications: { target: SparkApplicationTarget; summary: string }[];
  outsideTheBox: ResearchOutsideTheBox;
  valueMetrics: ResearchValueMetrics;
  boardPerspectives?: ResearchBoardPerspective[];
  boardRecommendation?: string;
  prepOffers: ResearchPrepOffer[];
  answer: string;
  evidence: string[];
};

export type ResearchCategory = {
  id: ResearchCategoryId;
  label: string;
  description: string;
};

export type ResearchSuggestedQuery = {
  id: string;
  phrase: string;
  categoryId: ResearchCategoryId;
};

export type ResearchSessionView = {
  product: "founder";
  query: string;
  report: ExecutiveResearchReport;
  generatedAt: string;
};

export type ResearchCenterBootstrap = {
  categories: ResearchCategory[];
  suggestedQueries: ResearchSuggestedQuery[];
  significantAlerts: ResearchAlert[];
  recentSessions: { id: string; query: string; categoryLabel: string; generatedAt: string }[];
  sampleReportId: string;
};
