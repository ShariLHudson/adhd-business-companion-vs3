"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EstateRoomVisitChrome } from "@/components/companion/estate/EstateRoomVisitChrome";
import { MomentumInstituteRoomShell } from "@/components/companion/momentumInstitute/MomentumInstituteRoomShell";
import { InstituteDrawerWall } from "@/components/companion/momentumInstitute/InstituteDrawerWall";
import { InstituteKnowledgeCardPanel } from "@/components/companion/momentumInstitute/InstituteKnowledgeCardPanel";
import { INSTITUTE_CABINET_UPDATED_EVENT } from "@/lib/momentumInstitute/cabinetStore";
import { INSTITUTE_LEARNING_UPDATED_EVENT } from "@/lib/momentumInstitute/learningExperienceStore";
import {
  INITIAL_DRAWER_WALL_STATE,
  PHASE1_DRAWER_WALL_LAYOUT,
  reduceDrawerWallState,
  resolveDrawerWallItems,
} from "@/lib/momentumInstitute/drawerWall";
import { engageKnowledgeCard } from "@/lib/momentumInstitute/drawerWall/knowledgeCardEngagement";
import type { InstituteDiscussMode } from "@/lib/momentumInstitute/drawerWall/instituteLearningChat";
import {
  instituteDiscussTurn,
  instituteMakeItMineTurn,
  resolveKnowledgeCardLearningPanel,
  resolveKnowledgeCardViewModels,
} from "@/lib/momentumInstitute/drawerWall/knowledgeCardViewModel";
import type { EstateRoomInvitationItem } from "@/lib/estate/estateRoomInvitation";
import "@/lib/momentumInstitute/catalog/bootstrapPhase1Catalog";

export type InstituteLearningChatTurn = {
  memberText: string;
  chatHint: string;
};

type Props = {
  thread: ReactNode;
  footer: ReactNode;
  /** Estate Intelligence — open a drawer on arrival (Phase 3) */
  initialOpenDrawerId?: string | null;
  onInstituteLearningChat?: (turn: InstituteLearningChatTurn) => void;
  conversationScrollKey?: string | number;
  onInvitationSelect: (item: EstateRoomInvitationItem) => void;
  onConversationStart?: (roomId: string) => void;
};

export function MomentumInstituteRoomPanel({
  thread,
  footer,
  initialOpenDrawerId,
  onInstituteLearningChat,
  conversationScrollKey,
  onInvitationSelect,
  onConversationStart,
}: Props) {
  const [wallState, setWallState] = useState(INITIAL_DRAWER_WALL_STATE);
  const [memberStateTick, setMemberStateTick] = useState(0);
  const [browseEngaged, setBrowseEngaged] = useState(Boolean(initialOpenDrawerId));

  useEffect(() => {
    if (!initialOpenDrawerId) return;
    setBrowseEngaged(true);
    setWallState((prev) =>
      reduceDrawerWallState(prev, {
        type: "open_drawer",
        drawerId: initialOpenDrawerId,
      }),
    );
  }, [initialOpenDrawerId]);

  useEffect(() => {
    const bump = () => setMemberStateTick((tick) => tick + 1);
    window.addEventListener(INSTITUTE_CABINET_UPDATED_EVENT, bump);
    window.addEventListener(INSTITUTE_LEARNING_UPDATED_EVENT, bump);
    return () => {
      window.removeEventListener(INSTITUTE_CABINET_UPDATED_EVENT, bump);
      window.removeEventListener(INSTITUTE_LEARNING_UPDATED_EVENT, bump);
    };
  }, []);

  const wallItems = useMemo(
    () => resolveDrawerWallItems(),
    [memberStateTick],
  );

  const drawerItems = useMemo(
    () =>
      wallItems.map((item) => ({
        hotspot: item.hotspot,
        drawerTitle: item.drawer.title,
        cardCount: item.knowledgeCards.length,
        cardViewModels: resolveKnowledgeCardViewModels(
          item.knowledgeCards,
          item.drawer,
        ),
      })),
    [wallItems],
  );

  const cardPanel = wallState.openKnowledgeCardId
    ? resolveKnowledgeCardLearningPanel(wallState.openKnowledgeCardId)
    : null;

  const activityEngaged = browseEngaged;

  const openCard = (knowledgeCardId: string) => {
    engageKnowledgeCard(knowledgeCardId);
    setWallState((prev) =>
      reduceDrawerWallState(prev, {
        type: "open_knowledge_card",
        knowledgeCardId,
      }),
    );
  };

  const sendInstituteTurn = (mode: InstituteDiscussMode) => {
    if (!cardPanel || !onInstituteLearningChat) return;
    onInstituteLearningChat(instituteDiscussTurn(cardPanel, mode));
  };

  const sendMakeItMine = () => {
    if (!cardPanel || !onInstituteLearningChat) return;
    onInstituteLearningChat(instituteMakeItMineTurn(cardPanel));
  };

  const handleInvitation = (item: EstateRoomInvitationItem) => {
    if (item.action.kind === "institute-browse") {
      setBrowseEngaged(true);
      return;
    }
    onInvitationSelect(item);
  };

  return (
    <MomentumInstituteRoomShell>
      {browseEngaged ? (
        <InstituteDrawerWall
          wallRegion={PHASE1_DRAWER_WALL_LAYOUT.wallRegion}
          items={drawerItems}
          openDrawerId={wallState.openDrawerId}
          openKnowledgeCardId={wallState.openKnowledgeCardId}
          hoveredDrawerId={wallState.hoveredDrawerId}
          onHover={(drawerId) =>
            setWallState((prev) => ({ ...prev, hoveredDrawerId: drawerId }))
          }
          onOpenDrawer={(drawerId) =>
            setWallState((prev) =>
              reduceDrawerWallState(prev, { type: "open_drawer", drawerId }),
            )
          }
          onSelectCard={openCard}
          onCloseDrawer={() =>
            setWallState((prev) =>
              reduceDrawerWallState(prev, { type: "close_drawer" }),
            )
          }
        />
      ) : null}

      {cardPanel ? (
        <InstituteKnowledgeCardPanel
          model={cardPanel}
          onClose={() =>
            setWallState((prev) =>
              reduceDrawerWallState(prev, { type: "close_knowledge_card" }),
            )
          }
          onDiscuss={sendInstituteTurn}
          onMakeItMine={sendMakeItMine}
        />
      ) : null}

      <EstateRoomVisitChrome
        roomId="momentum-institute"
        thread={thread}
        footer={footer}
        activityEngaged={activityEngaged}
        panelClassName="momentum-institute-room__chat-panel"
        conversationScrollKey={conversationScrollKey}
        onInvitationSelect={handleInvitation}
        onConversationStart={onConversationStart}
      />
    </MomentumInstituteRoomShell>
  );
}
