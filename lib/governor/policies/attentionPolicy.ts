import type {
  GovernorConfidence,
  GovernorDecision,
  GovernorDisposition,
  IncomingRecommendation,
} from "../types";

function confidence(score: number, rationale: string, evidence: string[]): GovernorConfidence {
  const level = score >= 80 ? "high" : score >= 60 ? "medium" : score >= 40 ? "low" : "exploratory";
  return { level, score, rationale, evidence };
}

export function evaluateAttentionPolicy(item: IncomingRecommendation): GovernorDecision {
  const score = item.leverageScore;
  const evidence = [`Source: ${item.systemLabel}`, `Leverage: ${score}`];

  if (item.source === "executive_brief" && score >= 85) {
    return {
      shouldInterrupt: true,
      shouldWait: false,
      shouldBriefToday: true,
      shouldMissionRecommend: false,
      shouldUpdateMemory: false,
      shouldNotifyFounder: true,
      shouldRememberSilently: false,
      disposition: "notify_founder",
      reasoning: "Founder Alert — significant enough to surface calmly today.",
      confidence: confidence(score, "Executive Brief priority", evidence),
    };
  }

  if (item.source === "executive_decision" && score >= 90) {
    return {
      shouldInterrupt: false,
      shouldWait: false,
      shouldBriefToday: true,
      shouldMissionRecommend: true,
      shouldUpdateMemory: true,
      shouldNotifyFounder: false,
      shouldRememberSilently: false,
      disposition: "mission_recommendation",
      reasoning: "Active decision on the desk — mission-scoped recommendation.",
      confidence: confidence(score, "Decision lifecycle evidence", evidence),
    };
  }

  if (item.source === "awareness" && score >= 75) {
    return {
      shouldInterrupt: false,
      shouldWait: false,
      shouldBriefToday: true,
      shouldMissionRecommend: false,
      shouldUpdateMemory: false,
      shouldNotifyFounder: false,
      shouldRememberSilently: true,
      disposition: "brief_today",
      reasoning: "Awareness noticed meaningful change — include in today's brief.",
      confidence: confidence(score, "Awareness observation", evidence),
    };
  }

  if (item.source === "institutional_memory") {
    return {
      shouldInterrupt: false,
      shouldWait: true,
      shouldBriefToday: false,
      shouldMissionRecommend: false,
      shouldUpdateMemory: true,
      shouldNotifyFounder: false,
      shouldRememberSilently: true,
      disposition: "remember_silently",
      reasoning: "Organizational lesson — remember quietly unless Founder asks.",
      confidence: confidence(score, "Institutional memory link", evidence),
    };
  }

  if (score < 55) {
    return {
      shouldInterrupt: false,
      shouldWait: true,
      shouldBriefToday: false,
      shouldMissionRecommend: false,
      shouldUpdateMemory: false,
      shouldNotifyFounder: false,
      shouldRememberSilently: true,
      disposition: "silent",
      reasoning: "Below significance threshold — stays in the background.",
      confidence: confidence(score, "Protected attention", evidence),
    };
  }

  if (score >= 80) {
    return {
      shouldInterrupt: false,
      shouldWait: false,
      shouldBriefToday: true,
      shouldMissionRecommend: item.source === "executive_orchestrator",
      shouldUpdateMemory: false,
      shouldNotifyFounder: false,
      shouldRememberSilently: false,
      disposition: "brief_today",
      reasoning: "High leverage — one calm mention in today's executive flow.",
      confidence: confidence(score, "Governor priority", evidence),
    };
  }

  return {
    shouldInterrupt: false,
    shouldWait: true,
    shouldBriefToday: false,
    shouldMissionRecommend: false,
    shouldUpdateMemory: false,
    shouldNotifyFounder: false,
    shouldRememberSilently: true,
    disposition: "wait",
    reasoning: "Valid signal — can wait without cost to today's focus.",
    confidence: confidence(score, "Deferred by attention policy", evidence),
  };
}

export function isFounderFacing(disposition: GovernorDisposition): boolean {
  return ["interrupt", "notify_founder", "brief_today", "mission_recommendation"].includes(disposition);
}
