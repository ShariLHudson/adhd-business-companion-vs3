import type { AwarenessDomain, AwarenessSignal } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID, missionService } from "@/lib/founder/missions";
import { composeExecutiveDesk, composeFocus } from "@/lib/founder/commandCenter";
import { composeCompanyState, composeExecutiveState } from "@/lib/executiveOS";
import { getFounderDigitalTwinBundle } from "@/lib/founder/services/founderProfileBridge";
import { improvementService } from "@/lib/improvement";
import { prepareFounderResearchSummary } from "@/lib/founder/services/overnightExecutiveCycleBridge";
import { executiveBriefService } from "@/lib/founder/executiveBrief";

const now = () => new Date().toISOString();

function signal(
  partial: Omit<AwarenessSignal, "observedAt"> & { observedAt?: string },
): AwarenessSignal {
  return { ...partial, observedAt: partial.observedAt ?? now() };
}

export function collectAwarenessSignals(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): AwarenessSignal[] {
  const signals: AwarenessSignal[] = [];
  const mission = missionService.getMission(missionId) ?? missionService.getActiveMission();
  const desk = composeExecutiveDesk(missionId);
  const focus = composeFocus(missionId).focus;
  const exec = composeExecutiveState({ missionId });
  const company = composeCompanyState({ missionId });
  const profile = getFounderDigitalTwinBundle(missionId);
  const research = prepareFounderResearchSummary();
  const improvements = improvementService.prioritizeImprovements(missionId);
  const alerts = executiveBriefService.listFounderAlerts();

  signals.push(
    signal({
      id: `sig-mission-${mission.id}`,
      domain: "mission_movement",
      title: `${mission.name} progress`,
      summary: `Mission at ${mission.progress}% — ${mission.phase} phase.`,
      source: "missions",
      missionId: mission.id,
      metric: mission.progress,
    }),
  );

  for (const opp of desk.topOpportunities.slice(0, 2)) {
    signals.push(
      signal({
        id: `sig-opp-${opp.id}`,
        domain: "growing_opportunity",
        title: opp.title,
        summary: opp.summary,
        source: "command_center",
        missionId,
        metric: 70,
      }),
    );
  }

  signals.push(
    signal({
      id: "sig-founder-focus",
      domain: "founder_behavior",
      title: "Executive focus score",
      summary: `Focus at ${focus.score} — context switch risk ${focus.contextSwitchRisk}.`,
      source: "command_center",
      missionId,
      metric: focus.score,
    }),
  );

  if (profile.friction[0]) {
    signals.push(
      signal({
        id: `sig-friction-${profile.friction[0].id}`,
        domain: "repeated_problem",
        title: profile.friction[0].noticedPhrase,
        summary: profile.friction[0].reduction,
        source: "founder_profile",
        missionId,
        metric: profile.friction[0].occurrences * 10,
      }),
    );
  }

  for (const r of research.filter((item) => item.worthReading).slice(0, 2)) {
    signals.push(
      signal({
        id: `sig-research-${r.id}`,
        domain: "research_change",
        title: r.title,
        summary: r.headline,
        source: "overnight",
        missionId,
        metric: r.itemsReviewed,
      }),
    );
  }

  for (const imp of improvements.slice(0, 2)) {
    signals.push(
      signal({
        id: `sig-improve-${imp.id}`,
        domain: imp.priority === "high" ? "operational_bottleneck" : "learning_opportunity",
        title: imp.title,
        summary: imp.summary,
        source: "improvement",
        missionId,
        metric: imp.roi.score,
      }),
    );
  }

  const marketing = company.health.dimensions.find((d) => d.dimension === "marketing");
  if (marketing) {
    signals.push(
      signal({
        id: "sig-marketing-momentum",
        domain: "marketing_momentum",
        title: "Marketing health",
        summary: marketing.summary,
        source: "executive_os",
        missionId,
        metric: marketing.score,
      }),
    );
  }

  const product = company.health.dimensions.find((d) => d.dimension === "product");
  if (product) {
    signals.push(
      signal({
        id: "sig-product-momentum",
        domain: "product_momentum",
        title: "Product momentum",
        summary: product.summary,
        source: "executive_os",
        missionId,
        metric: product.score,
      }),
    );
  }

  if (exec.improvement.topOpportunity) {
    signals.push(
      signal({
        id: "sig-exec-improvement",
        domain: "weak_signal",
        title: "Operating improvement signal",
        summary: exec.improvement.topOpportunity,
        source: "executive_os",
        missionId,
        metric: 45,
      }),
    );
  }

  for (const alert of alerts.slice(0, 2)) {
    signals.push(
      signal({
        id: `sig-alert-${alert.id}`,
        domain: "customer_behavior",
        title: alert.title,
        summary: alert.simpleExplanation,
        source: "executive_brief",
        missionId,
        metric: alert.priority.score,
      }),
    );
  }

  return signals;
}

export function signalsByDomain(
  signals: AwarenessSignal[],
  domain: AwarenessDomain,
): AwarenessSignal[] {
  return signals.filter((s) => s.domain === domain);
}
