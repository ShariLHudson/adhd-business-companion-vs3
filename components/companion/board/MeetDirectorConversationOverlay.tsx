"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { BoardDirectorDefinition } from "@/lib/board/types";
import {
  craftMeetDirectorReply,
  createMeetDirectorMessage,
  type MeetDirectorConversation,
  type MeetDirectorMessage,
} from "@/lib/board/meetDirector";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import "@/app/companion/board-director-meet.css";

type Props = {
  director: BoardDirectorDefinition;
  conversation: MeetDirectorConversation;
  onConversationChange: (next: MeetDirectorConversation) => void;
  /** Close Meet overlay — return to profile underneath. */
  onReturnToProfile: () => void;
  includedInBoardReview?: boolean;
  onAddToBoardReview?: () => void;
  onTakeToBoard?: () => void;
};

/**
 * Private Director conversation overlay.
 * Does not navigate to Chamber or auto-start Board discussion.
 * Profile stays faded underneath.
 */
export function MeetDirectorConversationOverlay({
  director,
  conversation,
  onConversationChange,
  onReturnToProfile,
  includedInBoardReview = false,
  onAddToBoardReview,
  onTakeToBoard,
}: Props) {
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const { requestClose, onBackdropClick } = useDismissibleWindow({
    open: conversation.open,
    onClose: onReturnToProfile,
  });

  useEffect(() => {
    if (!conversation.open) return;
    inputRef.current?.focus();
  }, [conversation.open]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [conversation.messages.length]);

  if (!conversation.open) return null;

  function appendMemberAndReply(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const memberMsg = createMeetDirectorMessage("member", trimmed);
    const reply = craftMeetDirectorReply(director, trimmed);
    const directorMsg = createMeetDirectorMessage("director", reply);
    onConversationChange({
      ...conversation,
      messages: [...conversation.messages, memberMsg, directorMsg],
    });
    setDraft("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    appendMemberAndReply(draft);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      appendMemberAndReply(draft);
    }
  }

  function keepTalking() {
    inputRef.current?.focus();
  }

  return (
    <div
      className="meet-director-overlay"
      data-testid="meet-director-overlay"
      role="presentation"
    >
      <button
        type="button"
        className="meet-director-overlay__backdrop"
        aria-label="Return to Director profile"
        data-testid="meet-director-backdrop"
        onClick={() => onBackdropClick()}
        tabIndex={-1}
      />

      <div
        className="meet-director-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="meet-director-panel"
      >
        <header className="meet-director-panel__header">
          <div>
            <p className="meet-director-panel__kicker">Private conversation</p>
            <h2 id={titleId} className="meet-director-panel__title">
              {director.name}
            </h2>
            <p className="meet-director-panel__role">{director.boardRole}</p>
          </div>
          <button
            type="button"
            className="meet-director-panel__close"
            aria-label="Close conversation"
            data-testid="meet-director-close"
            onClick={requestClose}
          >
            ×
          </button>
        </header>

        <div
          ref={listRef}
          className="meet-director-panel__messages"
          data-testid="meet-director-messages"
        >
          {conversation.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} directorName={director.name} />
          ))}
        </div>

        <form className="meet-director-panel__composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="meet-director-input">
            Your message to {director.name}
          </label>
          <textarea
            id="meet-director-input"
            ref={inputRef}
            className="meet-director-panel__input"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share the decision you're examining…"
            data-testid="meet-director-input"
          />
          <button
            type="submit"
            className="meet-director-panel__send"
            disabled={!draft.trim()}
            data-testid="meet-director-send"
          >
            Send
          </button>
        </form>

        <div
          className="meet-director-panel__actions"
          data-testid="meet-director-actions"
        >
          <button
            type="button"
            className="meet-director-panel__action"
            data-testid="meet-director-keep-talking"
            onClick={keepTalking}
          >
            Keep Talking
          </button>
          {onAddToBoardReview ? (
            <button
              type="button"
              className="meet-director-panel__action"
              data-testid="meet-director-add-to-review"
              onClick={onAddToBoardReview}
              disabled={includedInBoardReview}
            >
              {includedInBoardReview
                ? "Included in Board Review"
                : `Add ${director.name.split(/\s+/)[0] ?? "Director"} to Board Review`}
            </button>
          ) : null}
          {onTakeToBoard ? (
            <button
              type="button"
              className="meet-director-panel__action meet-director-panel__action--primary"
              data-testid="meet-director-take-to-board"
              onClick={onTakeToBoard}
            >
              Take This to the Board
            </button>
          ) : null}
          <button
            type="button"
            className="meet-director-panel__return"
            data-testid="meet-director-return-profile"
            onClick={requestClose}
          >
            Return to {director.name.split(/\s+/)[0] ?? "Director"}&apos;s Profile
          </button>
          <button
            type="button"
            className="meet-director-panel__action meet-director-panel__action--ghost"
            data-testid="meet-director-close-action"
            onClick={requestClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  directorName,
}: {
  message: MeetDirectorMessage;
  directorName: string;
}) {
  const isDirector = message.role === "director";
  return (
    <div
      className={`meet-director-msg meet-director-msg--${message.role}`}
      data-role={message.role}
    >
      <p className="meet-director-msg__who">
        {isDirector ? directorName : "You"}
      </p>
      <p className="meet-director-msg__text">{message.content}</p>
    </div>
  );
}
