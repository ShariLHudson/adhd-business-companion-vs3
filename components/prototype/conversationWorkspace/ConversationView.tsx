"use client";

import type { Line } from "./mockData";

type ConversationViewProps = {
  lines: Line[];
  inputVisible: boolean;
  placeholder: string;
  onSend: (text: string) => void;
  researchStatus: string | null;
};

export function ConversationView({
  lines,
  inputVisible,
  placeholder,
  onSend,
  researchStatus,
}: ConversationViewProps) {
  return (
    <div className="cw4-conversation">
      <div className="cw4-conversation__thread" aria-live="polite">
        {lines.map((line) => (
          <p
            key={line.id}
            className={`cw4-conversation__line cw4-conversation__line--${line.role}`}
          >
            {line.text.split("\n").map((part, index) => (
              <span key={`${line.id}-${index}`}>
                {part}
                {index < line.text.split("\n").length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        ))}
        {researchStatus && (
          <p className="cw4-conversation__research" role="status">
            {researchStatus}
          </p>
        )}
      </div>

      {inputVisible && (
        <form
          className="cw4-conversation__input"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const field = form.elements.namedItem("message") as HTMLInputElement;
            const value = field.value.trim();
            if (!value) return;
            onSend(value);
            field.value = "";
          }}
        >
          <input
            type="text"
            name="message"
            placeholder={placeholder}
            aria-label="Message"
            className="cw4-conversation__field"
          />
        </form>
      )}
    </div>
  );
}
