"use client";

import { type ReactNode } from "react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type SimpleChatProps = {
  messages: Message[];
  stateHint: string | null;
  showHint: boolean;
  isLoading: boolean;
  // Kept for compatibility; assistant text is parsed directly below.
  formatParagraphs?: (content: string) => string[];
};

// Render **bold** spans within a line of text.
function renderInline(text: string, key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={`${key}-${i}`} className="font-semibold text-[#1f1c19]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${key}-${i}`}>{part}</span>;
  });
}

// Turn an assistant message into readable blocks: bullet runs become lists,
// other lines become short paragraphs. Bold markdown is honored.
function renderAssistant(content: string): ReactNode[] {
  const lines = content.split("\n").map((l) => l.trim());
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul
        key={`ul-${blocks.length}`}
        className="list-disc space-y-1.5 pl-5 text-lg leading-[1.7] text-[#1f1c19]"
      >
        {items.map((b, i) => (
          <li key={i}>{renderInline(b, `b-${blocks.length}-${i}`)}</li>
        ))}
      </ul>,
    );
  };

  lines.forEach((line, i) => {
    if (!line) {
      flushBullets();
      return;
    }
    const bullet = line.match(/^(?:[-•*])\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
    } else {
      flushBullets();
      blocks.push(
        <p key={`p-${i}`} className="text-lg leading-[1.75] text-[#1f1c19]">
          {renderInline(line, `p-${i}`)}
        </p>,
      );
    }
  });
  flushBullets();
  return blocks;
}

export function SimpleChat({
  messages,
  stateHint,
  showHint,
  isLoading,
}: SimpleChatProps) {
  const visible = messages.filter((m) => m.role !== "system");

  return (
    <section className="simple-chat mx-auto w-full max-w-xl" aria-live="polite">
      {showHint && stateHint && visible.length === 0 && (
        <p className="state-hint mb-6 text-center text-base leading-relaxed text-[#6b635a]">
          {stateHint}
        </p>
      )}

      {visible.length === 0 && !isLoading && !stateHint && (
        <p className="mb-6 text-center text-lg leading-relaxed text-[#5c534a]">
          Start typing or tap the mic — I&apos;m listening.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {visible.map((msg, i) => (
          <li
            key={i}
            className={`companion-fade-in flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {msg.role === "user" ? (
              <p className="inline-block max-w-[85%] rounded-2xl bg-[#1e4f4f] px-4 py-2.5 text-lg leading-[1.6] text-white shadow-sm">
                {msg.content}
              </p>
            ) : (
              <div className="max-w-[90%] space-y-2 rounded-2xl bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm">
                {renderAssistant(msg.content)}
              </div>
            )}
          </li>
        ))}

        {isLoading && (
          <li className="flex justify-start">
            <span
              className="flex gap-1.5 rounded-2xl bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm"
              aria-label="Shari is thinking"
            >
              <span className="h-2 w-2 rounded-full bg-[#6b635a]/40" />
              <span className="h-2 w-2 rounded-full bg-[#6b635a]/25" />
              <span className="h-2 w-2 rounded-full bg-[#6b635a]/15" />
            </span>
          </li>
        )}
      </ul>
    </section>
  );
}
