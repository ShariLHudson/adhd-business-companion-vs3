"use client";

import { getChamberCompletionOutputOptions } from "@/lib/universalCreation/sparkEstateCompletionSystem";
import type { ChamberMember } from "@/lib/chamber/chamberMemberRegistry";
import "@/app/companion/chamber-member-gallery.css";

type Props = {
  member: ChamberMember;
  onSave: () => void;
  onPrint: () => void;
  onContinue: () => void;
  onInviteAnother: () => void;
  onNewTopic: () => void;
};

/** Completion actions while talking with a Chamber Member. */
export function ChamberMemberConversationBar({
  member,
  onSave,
  onPrint,
  onContinue,
  onInviteAnother,
  onNewTopic,
}: Props) {
  const options = getChamberCompletionOutputOptions();

  return (
    <section
      className="chamber-conversation-bar"
      aria-label={`Conversation actions with ${member.displayName}`}
      data-testid="chamber-conversation-bar"
    >
      <p className="chamber-conversation-bar__prompt">
        What would you like to do with this conversation?
      </p>
      <div className="chamber-conversation-bar__actions">
        {options.map((option) => {
          if (option.id === "save") {
            return (
              <button
                key={option.id}
                type="button"
                className="chamber-conversation-bar__btn chamber-conversation-bar__btn--primary"
                onClick={onSave}
                data-testid="chamber-conversation-save"
              >
                {option.label}
              </button>
            );
          }
          if (option.id === "print") {
            return (
              <button
                key={option.id}
                type="button"
                className="chamber-conversation-bar__btn"
                onClick={onPrint}
                data-testid="chamber-conversation-print"
              >
                {option.label}
              </button>
            );
          }
          if (option.id === "continue") {
            return (
              <button
                key={option.id}
                type="button"
                className="chamber-conversation-bar__btn"
                onClick={onContinue}
                data-testid="chamber-conversation-continue"
              >
                Continue Conversation
              </button>
            );
          }
          return null;
        })}
        <button
          type="button"
          className="chamber-conversation-bar__btn"
          onClick={onInviteAnother}
          data-testid="chamber-conversation-invite"
        >
          Invite Another Member
        </button>
        <button
          type="button"
          className="chamber-conversation-bar__btn chamber-conversation-bar__btn--ghost"
          onClick={onNewTopic}
          data-testid="chamber-conversation-new-topic"
        >
          Start New Topic
        </button>
      </div>
      <p className="chamber-conversation-bar__hint">
        Your messages with {member.displayName} continue in the chat panel. Turn
        chat on or off from the estate menu anytime.
      </p>
    </section>
  );
}
