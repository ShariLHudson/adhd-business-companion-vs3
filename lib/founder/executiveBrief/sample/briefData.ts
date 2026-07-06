import type { ExecutiveBrief } from "../types";
import { listFounderAlerts } from "../alerts/founderAlerts";
import { buildIfIWereRunningSection } from "../recommendations/advisorSection";
import {
  listSampleOpportunities,
  listSampleRecommendations,
  listSampleRisks,
} from "../recommendations/recommendationBuilder";
import { buildExecutiveExplanation } from "../explanations/explanationBuilder";
import { priorityFromScore } from "../presentation/priorityPresentation";
import { prepareOffice } from "@/lib/overnight";

const BRIEF_DATE = "2026-07-06";

export const SAMPLE_EXECUTIVE_BRIEF: ExecutiveBrief = {
  id: "eb-2026-07-06",
  date: BRIEF_DATE,
  greeting: "Good morning, Shari.",
  summary: {
    headline: "Your office is ready — one mission, one first action.",
    narrative: [
      "While you were away, the ecosystem reviewed research and member themes.",
      "Nothing needs panic. A few items deserve calm attention today.",
    ],
    stats: {
      itemsReviewed: 124,
      opportunitiesWorthAttention: 4,
      decisionsWaiting: 2,
      founderAlerts: 2,
    },
  },
  founderAlerts: listFounderAlerts(),
  alerts: [],
  opportunities: listSampleOpportunities(),
  risks: listSampleRisks(),
  recommendations: listSampleRecommendations(),
  decisions: [
    {
      kind: "decision",
      status: "pending",
      id: "ed-invest-restart",
      title: "Invest fully in restart experience",
      simpleExplanation: "The vault is waiting for your yes on Listening Rooms priority.",
      businessExplanation: "Confirms capital and attention for the flagship member moment.",
      whyItMatters: "Team alignment speeds estate QA and nurture timing.",
      howItAffectsSpark: "Signals that belonging beats feature sprawl.",
      recommendedAction: "Decide in Decision Vault — dec-invest-restart.",
      priority: priorityFromScore(86),
      estimatedImpact: "High — unlocks mission chain",
      timeSensitivity: "this-week",
      relatedMissionIds: ["listening-rooms"],
      relatedResearchIds: ["res-adhd-restart"],
      evidence: [
        {
          id: "ev-dec-restart",
          kind: "founder-decision",
          title: "Decision vault",
          plainSummary: "Board consensus prepared; founder confirmation needed.",
          refId: "dec-invest-restart",
        },
      ],
      explanation: buildExecutiveExplanation({
        title: "Restart investment",
        whatHappened: "Advisory council aligned; decision waits on you.",
        whyItMatters: "Clarity prevents polite drift into too many bets.",
        recommendedAction: "Confirm or adjust in Decision Vault.",
        actionKind: "discuss-strategy-center",
        connections: ["founder", "spark", "revenue"],
        sparkEffect: "Mission chain stays coherent.",
        businessEffect: "Faster path to Gentle Restart launch.",
      }),
    },
  ],
  actions: [
    {
      id: "act-scene-qa",
      label: "Review Listening Rooms scene",
      summary: "Photograph Test — does this feel like somewhere you would stay?",
      priority: priorityFromScore(92),
      timeSensitivity: "today",
      missionId: "listening-rooms",
    },
  ],
  insights: [
    {
      id: "ins-voice-theme",
      title: "Voice helps during overwhelm",
      summary: "Members capture more when they can speak instead of type.",
      explanation: buildExecutiveExplanation({
        title: "Voice",
        whatHappened: "Companion themes show hands-free demand.",
        whyItMatters: "Accessibility and EF support in one path.",
        recommendedAction: "Keep watching voice improvements.",
        actionKind: "keep-watching",
        connections: ["companion", "member-experience"],
        sparkEffect: "Voice as care, not gimmick.",
        businessEffect: "More thoughts saved become offers later.",
      }),
      priority: priorityFromScore(74),
    },
  ],
  learnings: listFounderAlerts().map((a) => a.learning!).filter(Boolean),
  nextSteps: [
    {
      id: "next-listening-rooms",
      label: "Continue Listening Rooms",
      summary: "Highest impact today — estate scene QA.",
      missionId: "listening-rooms",
      timeSensitivity: "today",
    },
  ],
  ifIWereRunning: buildIfIWereRunningSection(),
  calmClose: "One mission. One first action. The rest can wait politely.",
};

export function getSampleExecutiveBrief(date?: string): ExecutiveBrief {
  if (!date || date === BRIEF_DATE) return SAMPLE_EXECUTIVE_BRIEF;
  return { ...SAMPLE_EXECUTIVE_BRIEF, id: `eb-${date}`, date };
}

export function composeExecutiveBriefFromOvernight(): ExecutiveBrief {
  const office = prepareOffice();
  const sample = SAMPLE_EXECUTIVE_BRIEF;
  return {
    ...sample,
    id: `eb-${office.date}`,
    date: office.date,
    greeting: office.brief.greeting,
    summary: {
      ...sample.summary,
      headline: office.brief.calmClose,
      narrative: office.brief.narrative,
      stats: {
        itemsReviewed: office.morning.stats.researchItemsReviewed,
        opportunitiesWorthAttention: office.morning.stats.opportunitiesDeserveAttention,
        decisionsWaiting: office.morning.stats.decisionsWaiting,
        founderAlerts: sample.founderAlerts.length,
      },
    },
    nextSteps: [
      {
        id: "next-primary",
        label: office.recommendedFirstAction,
        summary: office.missionFocus.headline,
        missionId: office.recommendedMission.missionId,
        timeSensitivity: "today",
      },
    ],
    calmClose: office.brief.calmClose,
  };
}
