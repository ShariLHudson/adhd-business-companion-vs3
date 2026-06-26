"use client";

import type { ComponentProps } from "react";
import { ChatInputBar } from "@/components/companion/ChatInputBar";
import { resolveWelcomeChatPlaceholder } from "@/lib/welcomeLivingRoom";
import { useWelcomeLivingRoomContext } from "./CompanionWelcomeScene";

type Props = Omit<
  ComponentProps<typeof ChatInputBar>,
  "placeholder" | "onFocus" | "onBlur"
> & {
  listeningPlaceholder?: string;
};

/** Welcome chat input — soft placeholder on focus; typing nudges the candle once. */
export function WelcomeLivingRoomInput({
  listeningPlaceholder,
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
    <ChatInputBar
      {...props}
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
