/**
 * Spark Estate™ Canon Knowledge Source — permanent approved facts for companion Q&A.
 *
 * Runtime authority for identity questions. Do not invent beyond these sources:
 * - docs/estate/01 - Spark Estate Constitution.md
 * - docs/estate/Living in Spark Estate.md
 * - lib/canonContext/canonIdentity.ts
 * - docs/estate-knowledge-base/rooms.json (Live rooms only)
 * - docs/estate-knowledge-base/estate-objects.json (Kinsey)
 */

import { getLiveKnowledgeItems } from "@/lib/estateKnowledgeBase/loader";
import type { EstateKnowledgeItem } from "@/lib/estateKnowledgeBase/types";

export const SPARK_ESTATE_CANON_AUTHORITY = {
  constitution: "docs/estate/01 - Spark Estate Constitution.md",
  experienceGuide: "docs/estate/Living in Spark Estate.md",
  identityRuntime: "lib/canonContext/canonIdentity.ts",
  liveRooms: "docs/estate-knowledge-base/rooms.json",
  estateObjects: "docs/estate-knowledge-base/estate-objects.json",
} as const;

export type CanonRoomSummary = {
  id: string;
  name: string;
  purpose: string;
  description: string;
};

function roomToSummary(room: EstateKnowledgeItem): CanonRoomSummary {
  return {
    id: room.id,
    name: room.officialName,
    purpose: room.purpose,
    description: room.description,
  };
}

/** Live rooms from the Estate Knowledge Base — current navigable places with purposes. */
export function getCanonLiveRooms(): CanonRoomSummary[] {
  return getLiveKnowledgeItems("rooms").map(roomToSummary);
}

export function formatCanonRoomsAnswer(): string {
  const rooms = getCanonLiveRooms();
  if (rooms.length === 0) {
    return "Spark Estate is home to many rooms and destinations. Ask me about a specific place and I will share what I know from the approved Estate guide.";
  }

  const lines = rooms.map((room) => `• ${room.name} — ${room.purpose}`);
  return [
    "Spark Estate™ is a fictional country estate with many living places and destinations. These are some of the current rooms members can visit:",
    "",
    ...lines,
    "",
    "Tell me which room interests you, or say \"take me to…\" when you would like to go there.",
  ].join("\n");
}
