"use client";

import { ToolSuggestionCard } from "@/components/companion/ToolSuggestionCard";
import {
  crossWorkspaceAcceptLabel,
  crossWorkspaceSectionEmoji,
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
      toolEmoji={crossWorkspaceSectionEmoji(targetSection)}
      toolLabel={crossWorkspaceAcceptLabel(targetSection)}
      keepTalkingLabel="Not now"
      onAccept={onAccept}
      onDismiss={onDismiss}
    />
  );
}
