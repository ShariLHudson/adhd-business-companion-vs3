"use client";

import { type ReactNode } from "react";
import { toPlainLanguageDisplay } from "@/lib/plainLanguageFormatting";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type SimpleChatProps = {
  messages: Message[];
  stateHint: string | null;
  showHint: boolean;
  isLoading: boolean;
  // Home owns cold-open copy (starters / continue) — skip the default empty line.
  hideEmptyState?: boolean;
  // Kept for compatibility; assistant text is parsed directly below.
  formatParagraphs?: (content: string) => string[];
  /** Founder-test: render directly under Shari's latest reply (conversation thread). */
  afterLastAssistant?: ReactNode;
};

// Turn an assistant message into readable blocks: bullet runs become lists,
// other lines become short paragraphs.
function renderAssistant(content: string): ReactNode[] {
  const normalized = toPlainLanguageDisplay(content);
  const lines = normalized.split("\n").map((l) => l.trim());
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
          <li key={i}>{b}</li>
        ))}
      </ul>,
    );
  };

  lines.forEach((line, i) => {
    if (!line) {
      flushBullets();
      return;
    }
    const bullet = line.match(/^(?:•|[-*])\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
    } else {
      flushBullets();
      blocks.push(
        <p key={`p-${i}`} className="text-lg leading-[1.75] text-[#1f1c19]">
          {line}
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
  hideEmptyState = false,
  afterLastAssistant,
}: SimpleChatProps) {
  const visible = messages.filter((m) => m.role !== "system");
  const lastAssistantIdx = visible.reduce(
    (acc, m, i) => (m.role === "assistant" ? i : acc),
    -1,
  );

  return (
    <section className="simple-chat mx-auto w-full max-w-xl" aria-live="polite">
      {showHint && stateHint && visible.length === 0 && (
        <p className="state-hint mb-6 text-center text-base leading-relaxed text-[#6b635a]">
          {stateHint}
        </p>
      )}

      {visible.length === 0 && !isLoading && !stateHint && !hideEmptyState && (
        <p className="mb-6 text-center text-lg leading-relaxed text-[#5c534a]">
          Start typing — I&apos;m listening.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {visible.map((msg, i) => {
          // A lone opening line (welcome / New Day) reads as a centered
          // companion prompt — aligned with the greeting stack, not a wide
          // left-aligned banner. Real conversation bubbles stay left/right.
          const isGreeting = visible.length === 1 && msg.role === "assistant";
          return (
            <li
              key={i}
              className={`companion-fade-in flex flex-col ${
                msg.role === "user"
                  ? "items-end"
                  : isGreeting
                    ? "items-center"
                    : "items-start"
              }`}
            >
              {msg.role === "user" ? (
                <p className="inline-block max-w-[85%] rounded-2xl bg-[#1e4f4f] px-4 py-2.5 text-lg leading-[1.6] text-white shadow-sm">
                  {msg.content}
                </p>
              ) : (
                <div
                  className={
                    isGreeting
                      ? "mx-auto max-w-md space-y-2 rounded-2xl bg-white/85 px-5 py-4 text-center shadow-sm backdrop-blur-sm"
                      : "max-w-[90%] space-y-2 rounded-2xl bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm"
                  }
                >
                  {renderAssistant(msg.content)}
                </div>
              )}
              {afterLastAssistant && i === lastAssistantIdx && (
                <div className="mt-2 w-full max-w-[90%]">{afterLastAssistant}</div>
              )}
            </li>
          );
        })}

        {isLoading && (
          <li className="flex flex-col items-start gap-1.5">
            <span
              className="flex gap-1.5 rounded-2xl bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm"
              aria-label="Shari is thinking"
            >
              <span className="h-2 w-2 rounded-full bg-[#6b635a]/40" />
              <span className="h-2 w-2 rounded-full bg-[#6b635a]/25" />
              <span className="h-2 w-2 rounded-full bg-[#6b635a]/15" />
            </span>
            <span className="pl-1 text-sm text-[#6b635a]">Thinking…</span>
          </li>
        )}
      </ul>
    </section>
  );
}
