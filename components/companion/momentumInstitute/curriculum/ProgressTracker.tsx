"use client";

import {
  KNOWLEDGE_CARD_STATUS_LABELS,
  resolveKnowledgeCardMemberStatus,
} from "@/lib/momentumInstitute/drawerWall/knowledgeCardMemberState";

type Props = {
  knowledgeCardId: string;
  statusLabel?: string;
};

export function ProgressTracker({ knowledgeCardId, statusLabel }: Props) {
  const status = resolveKnowledgeCardMemberStatus(knowledgeCardId);
  const label = statusLabel ?? KNOWLEDGE_CARD_STATUS_LABELS[status];

  return (
    <div
      className="institute-curriculum-progress"
      aria-label="Learning progress"
      data-testid="progress-tracker"
      data-status={status}
    >
      <span className="institute-curriculum-progress__label">{label}</span>
    </div>
  );
}
