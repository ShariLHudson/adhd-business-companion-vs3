"use client";

import type { ReactNode, RefObject } from "react";
import { SparkEstateShell } from "@/components/companion/estate/SparkEstateShell";
import type { ProfileEstateRoomId } from "@/lib/growth/profileEstateRooms";

type Props = {
  roomId: ProfileEstateRoomId;
  thread: ReactNode;
  footer: ReactNode;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  conversationScrollKey?: string | number;
  welcomeMessage?: string;
};

/**
 * @deprecated Phase D.1 — delegates to SparkEstateShell™
 */
export function ProfileEstateRoomExperience(props: Props) {
  const { roomId, ...rest } = props;
  return (
    <SparkEstateShell placeId={roomId} profileEstateMode {...rest} />
  );
}
