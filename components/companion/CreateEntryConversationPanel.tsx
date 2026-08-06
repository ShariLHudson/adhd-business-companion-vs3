"use client";

import { useRef, useState } from "react";
import { SimpleChat } from "@/components/companion/SimpleChat";
import {
  CREATE_ESTATE_ENTRY_CONVERSATION_HEADING,
  CREATE_ESTATE_ENTRY_CONVERSATION_SUBTEXT,
} from "@/lib/createEstate/copy";
import {
  acknowledgeEntryText,
  combineEntryConversationText,
  type EntryConversationStage,
} from "@/lib/createEstate/entryConversation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  /**
   * Fires once, after the member's second (elaboration) turn, with the
   * opening message + elaboration combined into one string. The parent
   * hands this straight to the existing, unmodified
   * resolveCreateBeginOutcome()/submitPrompt() pipeline — this component
   * never classifies a Build Type itself.
   */
  onReady: (combinedText: string) => void;
  /** Mirrors the parent's beginBusy — disables input while classifying/opening. */
  disabled?: boolean;
  /** Lets the parent preserve its existing composerEngaged-driven layout. */
  onEngagementChange?: (engaged: boolean) => void;
  /**
   * Checked once, against the opening message only, before any
   * acknowledgment is shown — Estate navigation phrases ("take me to my
   * focus") outrank Create intent and must not be swallowed into the
   * conversation. Return true when the parent handled it (e.g. navigated
   * away); the panel then does nothing further with that turn.
   */
  onOpeningMessage?: (text: string) => boolean;
};

/**
 * Conversational Create Entrance (2026-08-06) — Screen 1 (opening question)
 * and the single topic-aware acknowledgment turn. Exactly two member turns:
 * the opening message, then one elaboration. No categories, no template
 * grid, no section UI — "one helpful question → one useful insight → next
 * step," never an interview. The reflection ("Here's what I think we're
 * working on…") and the guided/independent choice are rendered by the
 * parent (CreateEstateEntrancePanel), reusing its existing, already-tested
 * confirm UI rather than duplicating it here.
 */
export function CreateEntryConversationPanel({
  onReady,
  disabled = false,
  onEngagementChange,
  onOpeningMessage,
}: Props) {
  const [stage, setStage] = useState<EntryConversationStage>("opening");
  const [openingText, setOpeningText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  function handleSend() {
    const text = inputValue.trim();
    if (!text || disabled) return;

    if (stage === "opening") {
      if (onOpeningMessage?.(text)) {
        setInputValue("");
        return;
      }
      const ack = acknowledgeEntryText(text);
      setOpeningText(text);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: ack.message },
      ]);
      setStage("acknowledged");
      setInputValue("");
      onEngagementChange?.(true);
      return;
    }

    // stage === "acknowledged" — the one elaboration turn. Hand off to the
    // existing confirm pipeline; no further bot turn is rendered here.
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputValue("");
    onReady(combineEntryConversationText(openingText, text));
  }

  return (
    <section
      className="mt-6 flex flex-col gap-3"
      data-testid="create-estate-entry-conversation"
      aria-labelledby="create-estate-entry-conversation-heading"
    >
      <h2
        id="create-estate-entry-conversation-heading"
        className="text-lg font-semibold text-[#1f1c19]"
      >
        {CREATE_ESTATE_ENTRY_CONVERSATION_HEADING}
      </h2>
      <p className="max-w-xl whitespace-pre-line text-base leading-relaxed text-[#6b635a]">
        {CREATE_ESTATE_ENTRY_CONVERSATION_SUBTEXT}
      </p>

      <SimpleChat
        messages={messages}
        stateHint={null}
        showHint={false}
        isLoading={false}
        hideEmptyState
      />

      <div className="flex max-w-2xl items-end gap-2 rounded-2xl border border-[#cfc6b8] bg-white/95 p-2 shadow-sm">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={2}
          disabled={disabled}
          placeholder="Say whatever's on your mind…"
          className="max-h-32 min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-base leading-relaxed text-[#1f1c19] focus:outline-none disabled:opacity-70"
          data-testid="create-estate-entry-input"
          aria-label={CREATE_ESTATE_ENTRY_CONVERSATION_HEADING}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
          className="shrink-0 rounded-xl bg-[#3d3429] px-5 py-2.5 text-base font-semibold text-[#f7f2ea] transition enabled:hover:bg-[#2c241c] disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="create-estate-entry-send"
          data-primary-action="begin"
        >
          Send
        </button>
      </div>
    </section>
  );
}
