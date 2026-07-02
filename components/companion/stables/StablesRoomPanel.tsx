"use client";

import { useMemo, useState, type ReactNode } from "react";
import { EstateRoomVisitChrome } from "@/components/companion/estate/EstateRoomVisitChrome";
import { StablesRoomShell } from "@/components/companion/stables/StablesRoomShell";
import { StablesExperienceRail } from "@/components/companion/stables/StablesExperienceRail";
import { StablesExperiencePanel } from "@/components/companion/stables/StablesExperiencePanel";
import { getStablesExperience } from "@/lib/stables/stablesExperiences";
import {
  INITIAL_STABLES_ROOM_STATE,
  reduceStablesRoomState,
} from "@/lib/stables/stablesRoomState";
import type { StablesDiscussMode } from "@/lib/stables/types";
import {
  stablesDiscussTurn,
  type StablesLearningChatTurn,
} from "@/lib/stables/stablesChat";
import type { EstateRoomInvitationItem } from "@/lib/estate/estateRoomInvitation";

export type { StablesLearningChatTurn };

type Props = {
  thread: ReactNode;
  footer: ReactNode;
  onStablesLearningChat?: (turn: StablesLearningChatTurn) => void;
  conversationScrollKey?: string | number;
  onInvitationSelect: (item: EstateRoomInvitationItem) => void;
  onConversationStart?: (roomId: string) => void;
  onBackHome?: () => void;
  conversationStarted?: boolean;
};

export function StablesRoomPanel({
  thread,
  footer,
  onStablesLearningChat,
  conversationScrollKey,
  onInvitationSelect,
  onConversationStart,
  onBackHome,
  conversationStarted = false,
}: Props) {
  const [roomState, setRoomState] = useState(INITIAL_STABLES_ROOM_STATE);

  const selectedExperience = useMemo(() => {
    if (!roomState.selectedExperienceId) return null;
    return getStablesExperience(roomState.selectedExperienceId);
  }, [roomState.selectedExperienceId]);

  const activityEngaged = Boolean(roomState.selectedExperienceId);

  const sendDiscuss = (mode: StablesDiscussMode) => {
    if (!selectedExperience || !onStablesLearningChat) return;
    onStablesLearningChat(stablesDiscussTurn(selectedExperience, mode));
  };

  const handleInvitation = (item: EstateRoomInvitationItem) => {
    const action = item.action;
    if (action.kind === "stables-experience") {
      const { experienceId } = action;
      setRoomState((prev) =>
        reduceStablesRoomState(prev, {
          type: "select_experience",
          experienceId,
        }),
      );
      return;
    }
    onInvitationSelect(item);
  };

  return (
    <StablesRoomShell onBackHome={onBackHome}>
      {activityEngaged ? (
        <StablesExperienceRail
          selectedExperienceId={roomState.selectedExperienceId}
          hoveredExperienceId={roomState.hoveredExperienceId}
          onSelect={(experienceId) =>
            setRoomState((prev) =>
              reduceStablesRoomState(prev, { type: "select_experience", experienceId }),
            )
          }
          onHover={(experienceId) =>
            setRoomState((prev) =>
              reduceStablesRoomState(prev, { type: "hover_experience", experienceId }),
            )
          }
        />
      ) : null}

      {selectedExperience ? (
        <StablesExperiencePanel
          experience={selectedExperience}
          onClose={() =>
            setRoomState((prev) =>
              reduceStablesRoomState(prev, { type: "clear_experience" }),
            )
          }
          onDiscuss={sendDiscuss}
        />
      ) : null}

      <EstateRoomVisitChrome
        roomId="stables"
        thread={thread}
        footer={footer}
        activityEngaged={activityEngaged}
        conversationStarted={conversationStarted}
        panelClassName="stables-room__chat-panel"
        conversationScrollKey={conversationScrollKey}
        onInvitationSelect={handleInvitation}
        onConversationStart={onConversationStart}
      />
    </StablesRoomShell>
  );
}
