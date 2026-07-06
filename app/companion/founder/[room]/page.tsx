import { notFound } from "next/navigation";

import { FounderDecisionVault } from "@/components/founderStudio/FounderDecisionVault";
import { FounderExecutiveArchives } from "@/components/founderStudio/FounderExecutiveArchives";
import { FounderExecutiveIntelligence } from "@/components/founderStudio/FounderExecutiveIntelligence";
import { FounderExecutiveBuilder } from "@/components/founderStudio/FounderExecutiveBuilder";
import { FounderExecutiveSimulation } from "@/components/founderStudio/FounderExecutiveSimulation";
import { FounderExecutiveMemoryTheater } from "@/components/founderStudio/FounderExecutiveMemoryTheater";
import { FounderExecutiveIntelligenceGraph } from "@/components/founderStudio/FounderExecutiveIntelligenceGraph";
import { FounderExecutiveRelationshipIntelligence } from "@/components/founderStudio/FounderExecutiveRelationshipIntelligence";
import { FounderExecutiveDiscoveryEngine } from "@/components/founderStudio/FounderExecutiveDiscoveryEngine";
import { FounderExecutiveResourcesCenter } from "@/components/founderStudio/FounderExecutiveResourcesCenter";
import { FounderExecutiveIntegrationCenter } from "@/components/founderStudio/FounderExecutiveIntegrationCenter";
import { FounderAiExtensionsCenter } from "@/components/founderStudio/FounderAiExtensionsCenter";
import { FounderKnowledgeVault } from "@/components/founderStudio/FounderKnowledgeVault";
import { FounderSparkMasterLibrary } from "@/components/founderStudio/FounderSparkMasterLibrary";
import { FounderExecutiveCommandCenter } from "@/components/founderStudio/FounderExecutiveCommandCenter";
import { FounderExecutiveJudgmentEngine } from "@/components/founderStudio/FounderExecutiveJudgmentEngine";
import { FounderOpportunityDiscovery } from "@/components/founderStudio/FounderOpportunityDiscovery";
import { FounderExecutiveResearch } from "@/components/founderStudio/FounderExecutiveResearch";
import { FounderExecutiveStrategy } from "@/components/founderStudio/FounderExecutiveStrategy";
import { FounderRoomPageView } from "@/components/founderStudio/FounderRoomPage";
import { FounderTeamHub } from "@/components/founderStudio/FounderTeamHub";
import { getFounderRoom, isFounderRoomId } from "@/lib/founderStudio/rooms";

type FounderRoomRouteProps = {
  params: Promise<{ room: string }>;
};

export function generateStaticParams() {
  return [
    { room: "morning" },
    { room: "strategy" },
    { room: "innovation" },
    { room: "spark-command" },
    { room: "opportunity-vault" },
    { room: "knowledge-library" },
    { room: "reflection" },
    { room: "creation-studio" },
    { room: "automation-studio" },
    { room: "team-hub" },
    { room: "executive-intelligence" },
    { room: "executive-strategy" },
    { room: "executive-research" },
    { room: "opportunity-discovery" },
    { room: "executive-builder" },
    { room: "executive-simulation" },
    { room: "executive-memory-theater" },
    { room: "executive-intelligence-graph" },
    { room: "executive-relationship-intelligence" },
    { room: "executive-discovery-engine" },
    { room: "executive-resources-center" },
    { room: "executive-integration-center" },
    { room: "founder-knowledge-vault" },
    { room: "spark-master-library" },
    { room: "ai-extensions-center" },
    { room: "executive-judgment-engine" },
    { room: "executive-command-center" },
    { room: "decision-vault" },
  ];
}

export default async function FounderRoomRoute({ params }: FounderRoomRouteProps) {
  const { room: roomId } = await params;

  if (!isFounderRoomId(roomId)) {
    notFound();
  }

  if (roomId === "team-hub") {
    return <FounderTeamHub />;
  }

  if (roomId === "knowledge-library") {
    return <FounderExecutiveArchives />;
  }

  if (roomId === "executive-intelligence") {
    return <FounderExecutiveIntelligence />;
  }

  if (roomId === "executive-strategy") {
    return <FounderExecutiveStrategy />;
  }

  if (roomId === "executive-research") {
    return <FounderExecutiveResearch />;
  }

  if (roomId === "opportunity-discovery") {
    return <FounderOpportunityDiscovery />;
  }

  if (roomId === "executive-builder") {
    return <FounderExecutiveBuilder />;
  }

  if (roomId === "executive-simulation") {
    return <FounderExecutiveSimulation />;
  }

  if (roomId === "executive-memory-theater") {
    return <FounderExecutiveMemoryTheater />;
  }

  if (roomId === "executive-intelligence-graph") {
    return <FounderExecutiveIntelligenceGraph />;
  }

  if (roomId === "executive-relationship-intelligence") {
    return <FounderExecutiveRelationshipIntelligence />;
  }

  if (roomId === "executive-discovery-engine") {
    return <FounderExecutiveDiscoveryEngine />;
  }

  if (roomId === "executive-resources-center") {
    return <FounderExecutiveResourcesCenter />;
  }

  if (roomId === "executive-integration-center") {
    return <FounderExecutiveIntegrationCenter />;
  }

  if (roomId === "founder-knowledge-vault") {
    return <FounderKnowledgeVault />;
  }

  if (roomId === "spark-master-library") {
    return <FounderSparkMasterLibrary />;
  }

  if (roomId === "ai-extensions-center") {
    return <FounderAiExtensionsCenter />;
  }

  if (roomId === "executive-judgment-engine") {
    return <FounderExecutiveJudgmentEngine />;
  }

  if (roomId === "executive-command-center") {
    return <FounderExecutiveCommandCenter />;
  }

  if (roomId === "decision-vault") {
    return <FounderDecisionVault />;
  }

  const room = getFounderRoom(roomId);
  if (!room) {
    notFound();
  }

  return <FounderRoomPageView room={room} />;
}
