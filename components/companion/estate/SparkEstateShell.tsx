"use client";

import type { ReactNode } from "react";
import { EstatePresence } from "@/components/companion/estate/EstatePresence";
import { EstateRoomChatChrome } from "@/components/companion/estate/EstateRoomChatChrome";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { EstateRoomVisitChrome } from "@/components/companion/estate/EstateRoomVisitChrome";
import type { AppSection } from "@/lib/companionUi";
import { resolveEstateShellState } from "@/lib/estate/estateShellState";
import { resolveEstateRoomBackgroundImage } from "@/lib/estate/estateRoomBackground";
import { resolveEstatePresenceProfile } from "@/lib/estate/estatePresence/registry";
import type { EstateRoomInvitationItem } from "@/lib/estate/estateRoomInvitation";
import {
  isProfileEstateRoomId,
  profileEstateHomesteadRoomId,
  profileEstateRoomBackgroundImage,
} from "@/lib/growth/profileEstateRooms";

export type SparkEstateShellProps = {
  placeId: string;
  section?: AppSection;
  thread: ReactNode;
  footer: ReactNode;
  conversationScrollKey?: string | number;
  activityEngaged?: boolean;
  conversationStarted?: boolean;
  welcomeMessage?: string;
  /** Profile menu rooms — no invitation grid; profile art plates */
  profileEstateMode?: boolean;
  explicitActivityRequested?: boolean;
  userIntent?: string;
  backgroundImageOverride?: string | null;
  onInvitationSelect?: (item: EstateRoomInvitationItem) => void;
  onConversationStart?: (roomId: string) => void;
};

function resolveBackground(
  placeId: string,
  profileEstateMode: boolean,
  canonicalBackground: string | null,
): { imageUrl: string | null; backgroundRoomId: string } {
  if (profileEstateMode && isProfileEstateRoomId(placeId)) {
    return {
      imageUrl: profileEstateRoomBackgroundImage(placeId),
      backgroundRoomId: profileEstateHomesteadRoomId(placeId),
    };
  }

  return {
    imageUrl:
      canonicalBackground ??
      resolveEstateRoomBackgroundImage(placeId),
    backgroundRoomId: placeId,
  };
}

/**
 * SparkEstateShell — one scene, one conversation panel (Phase D.1).
 *
 * Replaces parallel `EstateChatNavigationOverlay` and `ProfileEstateRoomExperience`
 * stacks for direct and profile estate visits.
 */
export function SparkEstateShell({
  placeId,
  section = "home",
  thread,
  footer,
  conversationScrollKey,
  activityEngaged = false,
  conversationStarted = false,
  welcomeMessage,
  profileEstateMode = false,
  explicitActivityRequested = false,
  userIntent,
  backgroundImageOverride = null,
  onInvitationSelect,
  onConversationStart,
}: SparkEstateShellProps) {
  const shellState = resolveEstateShellState(placeId, {
    placeId,
    profileEstateMode,
    explicitActivityRequested,
    userIntent,
  });

  const resolvedPlaceId = shellState?.placeId ?? placeId;
  const { imageUrl, backgroundRoomId } = resolveBackground(
    resolvedPlaceId,
    profileEstateMode,
    backgroundImageOverride ?? shellState?.backgroundImage ?? null,
  );

  const livingPlaceMode = shellState?.livingPlaceMode ?? profileEstateMode;
  const conversationOnly = shellState?.conversationOnly ?? profileEstateMode;
  const estatePresenceProfile = resolveEstatePresenceProfile(resolvedPlaceId);

  const panelClassName = "estate-chat-navigation-overlay__chat-panel";

  return (
    <div
      className="spark-estate-shell estate-chat-navigation-overlay relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      data-testid="spark-estate-shell"
      data-place-id={resolvedPlaceId}
      data-estate-category={shellState?.category ?? "unknown"}
      data-living-place-mode={livingPlaceMode ? "true" : "false"}
    >
      <EstateRoomFullBleedBackground
        roomId={backgroundRoomId}
        imageUrl={imageUrl}
      />
      {estatePresenceProfile ? (
        <EstatePresence
          roomId={resolvedPlaceId}
          className="spark-estate-shell__presence"
        />
      ) : null}
      <div className="estate-chat-navigation-overlay__vignette" aria-hidden />

      {conversationOnly ? (
        <EstateRoomChatChrome
          roomId={resolvedPlaceId}
          thread={thread}
          footer={footer}
          welcomeMessage={welcomeMessage}
          showWelcomeLine={Boolean(welcomeMessage)}
          panelClassName={panelClassName}
          conversationScrollKey={conversationScrollKey}
        />
      ) : (
        <EstateRoomVisitChrome
          roomId={resolvedPlaceId}
          livingPlaceMode={livingPlaceMode}
          thread={thread}
          footer={footer}
          activityEngaged={activityEngaged}
          conversationStarted={conversationStarted}
          onInvitationSelect={onInvitationSelect ?? (() => {})}
          onConversationStart={onConversationStart}
          panelClassName={panelClassName}
          conversationScrollKey={conversationScrollKey}
        />
      )}
    </div>
  );
}
