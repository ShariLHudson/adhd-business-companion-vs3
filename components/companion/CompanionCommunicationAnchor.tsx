"use client";

import type { ComponentProps } from "react";
import { ChatInputBar } from "@/components/companion/ChatInputBar";
import {
  COMMUNICATION_ANCHOR_TEST_IDS,
  type CommunicationAnchorMode,
  type CommunicationAnchorVariant,
} from "@/lib/companionCommunicationAnchor";

type Props = ComponentProps<typeof ChatInputBar> & {
  variant?: CommunicationAnchorVariant;
  mode?: CommunicationAnchorMode;
  className?: string;
};

/**
 * Companion Communication Anchor™ — every primary screen renders this.
 * Style may change by room; access must never disappear.
 */
export function CompanionCommunicationAnchor({
  variant = "default",
  mode = "full",
  className = "",
  ...chatProps
}: Props) {
  return (
    <div
      data-testid={COMMUNICATION_ANCHOR_TEST_IDS.anchor}
      data-communication-variant={variant}
      data-communication-mode={mode}
      className={`companion-communication-anchor companion-communication-anchor--${variant} companion-communication-anchor--${mode} ${className}`.trim()}
    >
      <ChatInputBar {...chatProps} />
    </div>
  );
}
