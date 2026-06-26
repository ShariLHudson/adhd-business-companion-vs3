"use client";

import { ToolSuggestionCard } from "@/components/companion/ToolSuggestionCard";
import {
  crossWorkspaceAcceptLabel,
  crossWorkspaceSectionObjectId,
} from "@/lib/crossWorkspaceSuggestion";
import type { AppSection } from "@/lib/companionUi";

type CrossWorkspaceSuggestionCardProps = {
  line: string;
  targetSection: AppSection;
  onAccept: () => void;
  onDismiss: () => void;
};

export function CrossWorkspaceSuggestionCard({
  line,
  targetSection,
  onAccept,
  onDismiss,
}: CrossWorkspaceSuggestionCardProps) {
  return (
    <ToolSuggestionCard
      line={line}
      toolObjectId={crossWorkspaceSectionObjectId(targetSection)}
      toolLabel={crossWorkspaceAcceptLabel(targetSection)}
      keepTalkingLabel="Not now"
      onAccept={onAccept}
      onDismiss={onDismiss}
    />
  );
}
