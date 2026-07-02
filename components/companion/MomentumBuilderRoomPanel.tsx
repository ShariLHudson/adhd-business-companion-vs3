"use client";

import type { ReactNode, RefObject } from "react";
import { EstateRoomVisitChrome } from "@/components/companion/estate/EstateRoomVisitChrome";
import { MomentumBuilderRoomShell } from "@/components/companion/MomentumBuilderRoomShell";
import type { MomentumBuilderCelebrationKind } from "@/lib/momentumBuilderRoom/estateIntegration";
import type { TodaysPath } from "@/lib/momentumBuilderRoom/types";
import type { EstateRoomInvitationItem } from "@/lib/estate/estateRoomInvitation";

type Props = {
  thread: ReactNode;
  footer: ReactNode;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  todaysPath?: TodaysPath | null;
  celebrationKind?: MomentumBuilderCelebrationKind | null;
  conversationScrollKey?: string | number;
  onInvitationSelect: (item: EstateRoomInvitationItem) => void;
  onConversationStart?: (roomId: string) => void;
};

/**
 * Momentum Builder™ — coaching conversation in a planning studio.
 */
export function MomentumBuilderRoomPanel({
  thread,
  footer,
  inputRef,
  todaysPath,
  celebrationKind,
  conversationScrollKey,
  onInvitationSelect,
  onConversationStart,
}: Props) {
  return (
    <MomentumBuilderRoomShell
      todaysPath={todaysPath}
      celebrationKind={celebrationKind}
    >
      <EstateRoomVisitChrome
        roomId="momentum-builder"
        thread={thread}
        footer={footer}
        inputRef={inputRef}
        panelClassName="momentum-builder-room__chat-panel"
        conversationScrollKey={conversationScrollKey}
        onInvitationSelect={onInvitationSelect}
        onConversationStart={onConversationStart}
      />
    </MomentumBuilderRoomShell>
  );
}

/** @deprecated Grow route — same coaching room. */
export function GrowMomentumBuildersPanel(props: Props) {
  return <MomentumBuilderRoomPanel {...props} />;
}
