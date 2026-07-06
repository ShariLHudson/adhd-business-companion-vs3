import type { FounderRoomCard } from "../types";
import { sampleRoomContentRepository } from "../repositories";

export function getRoomCards(roomId: string): FounderRoomCard[] {
  return sampleRoomContentRepository.getRoomCards(roomId);
}
