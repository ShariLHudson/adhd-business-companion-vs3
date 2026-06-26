"use client";

import type { ComponentProps } from "react";
import { CompanionCommunicationAnchor } from "@/components/companion/CompanionCommunicationAnchor";
import { resolveWelcomeChatPlaceholder } from "@/lib/welcomeLivingRoom";
import type { CommunicationAnchorMode } from "@/lib/companionCommunicationAnchor";
import { useWelcomeLivingRoomContext } from "./CompanionWelcomeScene";

type Props = Omit<
  ComponentProps<typeof CompanionCommunicationAnchor>,
  "placeholder" | "onFocus" | "onBlur" | "variant" | "mode"
> & {
  listeningPlaceholder?: string;
  mode?: CommunicationAnchorMode;
};

/** Welcome chat input — soft placeholder on focus; typing nudges the candle once. */
export function WelcomeLivingRoomInput({
  listeningPlaceholder,
  mode = "full",
  onInputChange,
  ...props
}: Props) {
  const { inputFocused, onInputFocus, onInputBlur, noteTyping } =
    useWelcomeLivingRoomContext();

  const placeholder = resolveWelcomeChatPlaceholder({
    focused: inputFocused,
    listeningFallback: listeningPlaceholder,
  });

  return (
    <CompanionCommunicationAnchor
      {...props}
      variant="living-room"
      mode={mode}
      placeholder={placeholder}
      onFocus={onInputFocus}
      onBlur={onInputBlur}
      onInputChange={(value) => {
        if (value.trim()) noteTyping();
        onInputChange(value);
      }}
    />
  );
}
