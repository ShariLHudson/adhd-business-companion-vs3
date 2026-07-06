import type {
  FounderBriefRepository,
  FounderMemoryRepository,
  FounderInsightRepository,
  FounderRecommendationRepository,
  FounderCreationRepository,
  FounderAutomationRepository,
  FounderTeamHubRepository,
  FounderKnowledgeRepository,
  FounderRoomContentRepository,
} from "../interfaces";
import {
  SAMPLE_AUTOMATION,
  SAMPLE_CREATION,
  SAMPLE_GENERIC_ROOM_CARDS,
  SAMPLE_INSIGHTS,
  SAMPLE_MEMORY,
  SAMPLE_RECOMMENDATIONS,
  SAMPLE_REPORTS,
  SAMPLE_TASKS,
  SAMPLE_TODAY_BRIEF,
  automationToRoomCards,
  creationToRoomCards,
  reportsToRoomCards,
} from "./data";

function includesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

export const sampleBriefRepository: FounderBriefRepository = {
  getTodayBrief() {
    return { ...SAMPLE_TODAY_BRIEF };
  },
  getBriefByDate(date) {
    if (date === SAMPLE_TODAY_BRIEF.date) {
      return { ...SAMPLE_TODAY_BRIEF };
    }
    return null;
  },
};

export const sampleMemoryRepository: FounderMemoryRepository = {
  list() {
    return [...SAMPLE_MEMORY];
  },
  getById(id) {
    return SAMPLE_MEMORY.find((item) => item.id === id) ?? null;
  },
  search(query) {
    if (!query.trim()) return [...SAMPLE_MEMORY];
    return SAMPLE_MEMORY.filter(
      (item) =>
        includesQuery(item.title, query) ||
        includesQuery(item.summary, query) ||
        item.tags?.some((tag) => includesQuery(tag, query)),
    );
  },
  listByCategory(category) {
    return SAMPLE_MEMORY.filter((item) => item.category === category);
  },
};

export const sampleInsightRepository: FounderInsightRepository = {
  list() {
    return [...SAMPLE_INSIGHTS];
  },
  getTop(limit = 3) {
    return [...SAMPLE_INSIGHTS].slice(0, limit);
  },
  listByCategory(category) {
    return SAMPLE_INSIGHTS.filter((item) => item.category === category);
  },
};

export const sampleRecommendationRepository: FounderRecommendationRepository = {
  list() {
    return [...SAMPLE_RECOMMENDATIONS];
  },
  getTop(limit = 3) {
    return SAMPLE_RECOMMENDATIONS.filter((item) => item.tone !== "ignore").slice(
      0,
      limit,
    );
  },
  listBuild() {
    return SAMPLE_RECOMMENDATIONS.filter((item) => item.category === "build");
  },
  listIgnore() {
    return SAMPLE_RECOMMENDATIONS.filter((item) => item.category === "ignore");
  },
};

export const sampleCreationRepository: FounderCreationRepository = {
  listAll() {
    return [...SAMPLE_CREATION];
  },
  listWorkshops() {
    return SAMPLE_CREATION.filter((item) => item.format === "workshop");
  },
  listCourses() {
    return SAMPLE_CREATION.filter((item) => item.format === "course");
  },
  listNewsletters() {
    return SAMPLE_CREATION.filter((item) => item.format === "newsletter");
  },
  listLeadMagnets() {
    return SAMPLE_CREATION.filter((item) => item.format === "lead-magnet");
  },
  listSocialCampaigns() {
    return SAMPLE_CREATION.filter(
      (item) =>
        item.format === "campaign" ||
        item.format === "linkedin" ||
        item.format === "pinterest",
    );
  },
  listVideos() {
    return SAMPLE_CREATION.filter((item) => item.format === "video");
  },
};

export const sampleAutomationRepository: FounderAutomationRepository = {
  listIdeas() {
    return [...SAMPLE_AUTOMATION];
  },
  listCandidates() {
    return SAMPLE_AUTOMATION.filter((item) => item.effort !== "high");
  },
  listQuickWins() {
    return SAMPLE_AUTOMATION.filter((item) => item.effort === "low");
  },
};

export const sampleTeamHubRepository: FounderTeamHubRepository = {
  listProjects() {
    return [
      { id: "ap1", title: "Founder Intelligence OS", meta: "Cursor · In progress", status: "active" as const },
      { id: "ap2", title: "Ocean Conservatory polish", meta: "Cursor · Review", status: "active" as const },
    ];
  },
  listApprovals() {
    return SAMPLE_TASKS.filter((t) => t.lane === "approvals");
  },
  listAssignments() {
    return SAMPLE_TASKS.filter(
      (t) => t.lane === "waiting-izna" || t.lane === "waiting-cursor",
    );
  },
  listWaitingItems() {
    return SAMPLE_TASKS.filter(
      (t) =>
        t.lane === "waiting-shari" ||
        t.lane === "waiting-izna" ||
        t.lane === "waiting-cursor",
    );
  },
  listCompleted() {
    return SAMPLE_TASKS.filter((t) => t.lane === "completed");
  },
  listMyTasks() {
    return SAMPLE_TASKS.filter((t) => t.lane === "my-tasks");
  },
  listAssets() {
    return SAMPLE_TASKS.filter((t) => t.lane === "assets");
  },
  listSocialQueue() {
    return SAMPLE_TASKS.filter((t) => t.lane === "social-queue");
  },
};

export const sampleKnowledgeRepository: FounderKnowledgeRepository = {
  listReports() {
    return [...SAMPLE_REPORTS];
  },
  getReport(id) {
    return SAMPLE_REPORTS.find((report) => report.id === id) ?? null;
  },
  searchReports(query) {
    if (!query.trim()) return [...SAMPLE_REPORTS];
    return SAMPLE_REPORTS.filter(
      (report) =>
        includesQuery(report.title, query) ||
        includesQuery(report.summary, query),
    );
  },
};

export const sampleRoomContentRepository: FounderRoomContentRepository = {
  getRoomCards(roomId) {
    switch (roomId) {
      case "creation-studio":
        return creationToRoomCards(SAMPLE_CREATION);
      case "automation-studio":
        return automationToRoomCards(SAMPLE_AUTOMATION);
      case "knowledge-library":
        return reportsToRoomCards(SAMPLE_REPORTS);
      default:
        return [...SAMPLE_GENERIC_ROOM_CARDS];
    }
  },
};
