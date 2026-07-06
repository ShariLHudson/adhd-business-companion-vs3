import { notFound } from "next/navigation";

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

  const room = getFounderRoom(roomId);
  if (!room) {
    notFound();
  }

  return <FounderRoomPageView room={room} />;
}
