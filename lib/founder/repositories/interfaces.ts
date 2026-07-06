import type {
  FounderDailyBrief,
  FounderMemoryItem,
  FounderInsight,
  FounderRecommendation,
  FounderCreationOpportunity,
  FounderAutomationOpportunity,
  FounderReport,
  FounderTaskRecommendation,
  FounderProjectSuggestion,
  FounderRoomCard,
} from "../types";

export interface FounderBriefRepository {
  getTodayBrief(): FounderDailyBrief;
  getBriefByDate(date: string): FounderDailyBrief | null;
}

export interface FounderMemoryRepository {
  list(): FounderMemoryItem[];
  getById(id: string): FounderMemoryItem | null;
  search(query: string): FounderMemoryItem[];
  listByCategory(
    category: FounderMemoryItem["category"],
  ): FounderMemoryItem[];
}

export interface FounderInsightRepository {
  list(): FounderInsight[];
  getTop(limit?: number): FounderInsight[];
  listByCategory(category: string): FounderInsight[];
}

export interface FounderRecommendationRepository {
  list(): FounderRecommendation[];
  getTop(limit?: number): FounderRecommendation[];
  listBuild(): FounderRecommendation[];
  listIgnore(): FounderRecommendation[];
}

export interface FounderCreationRepository {
  listWorkshops(): FounderCreationOpportunity[];
  listCourses(): FounderCreationOpportunity[];
  listNewsletters(): FounderCreationOpportunity[];
  listLeadMagnets(): FounderCreationOpportunity[];
  listSocialCampaigns(): FounderCreationOpportunity[];
  listVideos(): FounderCreationOpportunity[];
  listAll(): FounderCreationOpportunity[];
}

export interface FounderAutomationRepository {
  listIdeas(): FounderAutomationOpportunity[];
  listCandidates(): FounderAutomationOpportunity[];
  listQuickWins(): FounderAutomationOpportunity[];
}

export interface FounderTeamHubRepository {
  listProjects(): FounderProjectSuggestion[];
  listApprovals(): FounderTaskRecommendation[];
  listAssignments(): FounderTaskRecommendation[];
  listWaitingItems(): FounderTaskRecommendation[];
  listCompleted(): FounderTaskRecommendation[];
  listMyTasks(): FounderTaskRecommendation[];
  listAssets(): FounderTaskRecommendation[];
  listSocialQueue(): FounderTaskRecommendation[];
}

export interface FounderKnowledgeRepository {
  listReports(): FounderReport[];
  getReport(id: string): FounderReport | null;
  searchReports(query: string): FounderReport[];
}

export interface FounderRoomContentRepository {
  getRoomCards(roomId: string): FounderRoomCard[];
}
