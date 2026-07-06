import { notFound } from "next/navigation";

import { FounderDecisionVault } from "@/components/founderStudio/FounderDecisionVault";
import { FounderExecutiveArchives } from "@/components/founderStudio/FounderExecutiveArchives";
import { FounderExecutiveIntelligence } from "@/components/founderStudio/FounderExecutiveIntelligence";
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

  if (roomId === "decision-vault") {
    return <FounderDecisionVault />;
  }

  const room = getFounderRoom(roomId);
  if (!room) {
    notFound();
  }

  return <FounderRoomPageView room={room} />;
}
