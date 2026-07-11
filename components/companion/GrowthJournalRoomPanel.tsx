"use client";

import type { ReactNode } from "react";
import { EstateRoomChatChrome } from "@/components/companion/estate/EstateRoomChatChrome";
import { GrowthJournalPanel } from "@/components/companion/GrowthJournalPanel";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import type { SparkVisualEngineOpenRequest } from "@/lib/sparkVisualEngine";

type Props = {
  nav: GrowthPanelNav;
  chatVisible: boolean;
  onVisualizeThis?: (request: SparkVisualEngineOpenRequest) => void;
  thread: ReactNode;
  footer: ReactNode;
  conversationScrollKey?: string | number;
};

/** Journal Gazebo — immersive writing room; chat only when member enables it in Experience Controls. */
export function GrowthJournalRoomPanel({
  nav,
  chatVisible,
  onVisualizeThis,
  thread,
  footer,
  conversationScrollKey,
}: Props) {
  return (
    <>
      <GrowthJournalPanel nav={nav} onVisualizeThis={onVisualizeThis} />
      {chatVisible ? (
        <EstateRoomChatChrome
          roomId="journal"
          thread={thread}
          footer={footer}
          conversationScrollKey={conversationScrollKey}
          panelClassName="journal-gazebo__chat-panel"
        />
      ) : null}
    </>
  );
}
