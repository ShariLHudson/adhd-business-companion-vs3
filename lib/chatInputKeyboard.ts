import type { KeyboardEvent } from "react";

/** Enter without Shift — send message; Shift+Enter — newline. */
export function isChatEnterWithoutNewline(
  event: KeyboardEvent<HTMLTextAreaElement>,
): boolean {
  if (event.shiftKey) return false;
  if (event.nativeEvent.isComposing || event.keyCode === 229) return false;
  return (
    event.key === "Enter" ||
    event.key === "Return" ||
    event.key === "NumpadEnter" ||
    event.code === "Enter" ||
    event.code === "NumpadEnter" ||
    event.keyCode === 13
  );
}

export type ChatTextareaKeyDownOptions = {
  canSend?: boolean;
  /** Non-Enter keys (e.g. reset voice-used flag). */
  onOtherKey?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

/**
 * Standard chat input keyboard behavior:
 * Enter → send (preventDefault), Shift+Enter → newline.
 */
export function handleChatTextareaKeyDown(
  event: KeyboardEvent<HTMLTextAreaElement>,
  onSend: (liveText: string) => void,
  opts?: ChatTextareaKeyDownOptions,
): void {
  if (!isChatEnterWithoutNewline(event)) {
    opts?.onOtherKey?.(event);
    return;
  }
  event.preventDefault();
  const liveText = event.currentTarget.value;
  if (opts?.canSend === false) return;
  if (!liveText.trim()) return;
  onSend(liveText);
}
