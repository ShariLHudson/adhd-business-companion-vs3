"use client";

import type { ChatMessage } from "./mockData";

type ConversationThreadProps = {
  messages: ChatMessage[];
};

export function ConversationThread({ messages }: ConversationThreadProps) {
  if (messages.length === 0) return null;

  return (
    <div className="rel-thread" aria-live="polite" aria-label="Conversation">
      {messages.map((message) => (
        <p
          key={message.id}
          className={`rel-thread__line rel-thread__line--${message.role}`}
        >
          {message.text.split("\n").map((line, index) => (
            <span key={`${message.id}-${index}`}>
              {line}
              {index < message.text.split("\n").length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
