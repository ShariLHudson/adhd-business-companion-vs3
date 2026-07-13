"use client";

import { useMemo } from "react";
import { pickChatPlaceholder } from "@/lib/chatCanvas/chatPlaceholders";
import { INPUT_PLACEHOLDER } from "@/lib/companionUi";
import { COMMUNICATION_ANCHOR_TEST_IDS } from "@/lib/companionCommunicationAnchor";
import { handleChatTextareaKeyDown } from "@/lib/chatInputKeyboard";
import { ESTATE_CHAT_INPUT_ATTR } from "@/lib/estateChatInputFocus";

type ChatInputBarProps = {
  input: string;
  isLoading: boolean;
  isListening: boolean;
  speechSupported: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleListening: () => void;
  onSend: (overrideText?: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  conversationMode?: boolean;
};

export function ChatInputBar({
  input,
  isLoading,
  isListening,
  speechSupported,
  inputRef,
  onInputChange,
  onKeyDown,
  onToggleListening,
  onSend,
  placeholder,
  onFocus,
  onBlur,
  conversationMode = false,
}: ChatInputBarProps) {
  const resolvedPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    if (INPUT_PLACEHOLDER) return INPUT_PLACEHOLDER;
    return pickChatPlaceholder();
  }, [placeholder]);

  return (
    <div
      className={`companion-chat-input input-glass flex items-end gap-2 rounded-[2rem] p-2 sm:gap-3 sm:p-2.5 ${
        conversationMode ? "input-glass-conversation" : ""
      }`}
      aria-busy={isLoading || undefined}
    >
      <button
        type="button"
        data-testid={COMMUNICATION_ANCHOR_TEST_IDS.mic}
        data-icon-slot="voice-input"
        onClick={onToggleListening}
        disabled={!speechSupported}
        aria-label={isListening ? "Stop listening" : "Voice input"}
        aria-pressed={isListening}
        title={
          speechSupported ? "Voice input" : "Voice not supported in this browser"
        }
        className={`companion-chat-input__icon-slot flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
          isListening
            ? "mic-active bg-[#1e4f4f] text-white shadow-lg"
            : "bg-[#f5f0e8] text-[#1e4f4f] hover:bg-[#efe8de]"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
          data-temp-icon="microphone"
        >
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
          <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z" />
        </svg>
      </button>

      <textarea
        ref={inputRef}
        data-estate-chat-input="true"
        data-testid={COMMUNICATION_ANCHOR_TEST_IDS.input}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          const liveText = e.currentTarget.value;
          handleChatTextareaKeyDown(e, (text) => onSend(text), {
            canSend: Boolean(liveText.trim()),
            onOtherKey: onKeyDown,
          });
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={resolvedPlaceholder}
        rows={1}
        className="max-h-32 min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-3 text-base leading-relaxed text-[#1f1c19] focus:outline-none"
      />

      <button
        type="button"
        data-testid={COMMUNICATION_ANCHOR_TEST_IDS.send}
        data-icon-slot="send"
        onClick={() => {
          const liveText = inputRef.current?.value ?? input;
          onSend(liveText);
        }}
        disabled={!input.trim()}
        className={`send-soft flex h-12 shrink-0 items-center justify-center rounded-full px-6 text-base font-medium text-white transition-all disabled:cursor-not-allowed disabled:bg-[#9aaba8] disabled:shadow-none ${conversationMode ? "send-soft-conversation" : ""}`}
      >
        Send
      </button>
    </div>
  );
}
