"use client";

import { useEffect, type ReactNode } from "react";
import { toPlainLanguageDisplay } from "@/lib/plainLanguageFormatting";
import type { RelationshipResponseUiTrace } from "@/lib/relationshipResponseTrace";
import {
  firstParagraphForTrace,
  logRelationshipResponseTrace,
} from "@/lib/relationshipResponseTrace";
import { RelationshipResponseDevBadge, isRelationshipDebugUiEnabled } from "@/components/companion/RelationshipResponseDevBadge";
import { VisibleThinkingBubble } from "@/components/companion/VisibleThinkingBubble";
import type { EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
import {
  chatVisibleThinkingCopy,
  shouldShowChatVisibleThinking,
} from "@/lib/visibleThinking/chatThinkingUi";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  relationshipTrace?: RelationshipResponseUiTrace;
};

type SimpleChatProps = {
  messages: Message[];
  stateHint: string | null;
  showHint: boolean;
  isLoading: boolean;
  thinkingMessage?: string | null;
  thinkingEmotion?: EmotionalState;
  workspacePanel?: AppSection | null;
  workspaceActiveBeside?: boolean;
  hideEmptyState?: boolean;
  formatParagraphs?: (content: string) => string[];
  afterLastAssistant?: ReactNode;
};

type ThreadItem =
  | { kind: "user"; message: Message; index: number }
  | { kind: "assistant-group"; messages: { message: Message; index: number }[] };

function groupThread(messages: Message[]): ThreadItem[] {
  const items: ThreadItem[] = [];
  let assistantRun: { message: Message; index: number }[] = [];

  const flushAssistant = () => {
    if (assistantRun.length === 0) return;
    items.push({ kind: "assistant-group", messages: [...assistantRun] });
    assistantRun = [];
  };

  messages.forEach((message, index) => {
    if (message.role === "user") {
      flushAssistant();
      items.push({ kind: "user", message, index });
      return;
    }
    if (message.role === "assistant") {
      assistantRun.push({ message, index });
    }
  });
  flushAssistant();
  return items;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <strong key={i} className="companion-chat-emphasis">
          {bold[1]}
        </strong>
      );
    }
    return part;
  });
}

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
      <ul key={`ul-${blocks.length}`} className="companion-chat-list">
        {items.map((b, i) => (
          <li key={i}>{renderInline(b)}</li>
        ))}
      </ul>,
    );
  };

  lines.forEach((line, i) => {
    if (!line) {
      flushBullets();
      return;
    }
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      flushBullets();
      blocks.push(
        <h3 key={`h-${i}`} className="companion-chat-heading">
          {heading[1]}
        </h3>,
      );
      return;
    }
    const bullet = line.match(/^(?:•|[-*])\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]!);
      return;
    }
    flushBullets();
    blocks.push(
      <p key={`p-${i}`} className="companion-chat-body">
        {renderInline(line)}
      </p>,
    );
  });
  flushBullets();
  return blocks;
}

function AssistantMessageWithTrace({
  content,
  trace,
  isGreeting,
}: {
  content: string;
  trace?: RelationshipResponseUiTrace;
  isGreeting: boolean;
}) {
  useEffect(() => {
    if (!trace) return;
    logRelationshipResponseTrace({
      responseId: trace.responseId,
      stage: "ui-render",
      firstParagraph: firstParagraphForTrace(content),
      relationshipResponseRewritten: trace.rewritten,
      memoryConfidence: trace.memoryConfidence,
      relationshipLeadParagraphLength: trace.relationshipLeadParagraphLength,
      enforcementRan: trace.enforcementRan,
      skipReason: trace.enforcementSkipReason,
      violationReason: trace.violationReason,
    });
  }, [content, trace]);

  return (
    <>
      <div
        className={[
          "companion-chat-bubble--companion",
          isGreeting ? "companion-chat-bubble--greeting" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="companion-chat-response">{renderAssistant(content)}</div>
      </div>
      {trace && isRelationshipDebugUiEnabled() ? (
        <RelationshipResponseDevBadge trace={trace} />
      ) : null}
    </>
  );
}

export function SimpleChat({
  messages,
  stateHint,
  showHint,
  isLoading,
  thinkingMessage = null,
  thinkingEmotion = "unclear",
  workspacePanel = null,
  workspaceActiveBeside = false,
  hideEmptyState = false,
  afterLastAssistant,
}: SimpleChatProps) {
  const visible = messages.filter((m) => m.role !== "system");
  const thread = groupThread(visible);
  const lastAssistantIndex = visible.reduce(
    (acc, m, i) => (m.role === "assistant" ? i : acc),
    -1,
  );
  const loneGreeting =
    visible.length === 1 && visible[0]?.role === "assistant";

  return (
    <section className="simple-chat mx-auto w-full max-w-2xl" aria-live="polite">
      {showHint && stateHint && visible.length === 0 && (
        <p className="state-hint mb-6 text-center text-base leading-relaxed text-[#6b635a]">
          {stateHint}
        </p>
      )}

      {visible.length === 0 && !isLoading && !stateHint && !hideEmptyState && (
        <p className="mb-6 text-center text-base leading-relaxed text-[#6b635a]">
          Start typing — I&apos;m listening.
        </p>
      )}

      <ul className="companion-chat-thread">
        {thread.map((item, threadIndex) => {
          const previous = thread[threadIndex - 1];
          const followsUser = previous?.kind === "user";

          if (item.kind === "user") {
            return (
              <li
                key={`user-${item.index}`}
                className="companion-chat-thread__item companion-fade-in flex flex-col items-end"
              >
                <p className="companion-chat-bubble--user">{item.message.content}</p>
              </li>
            );
          }

          return (
            <li
              key={`assistant-${item.messages[0]?.index ?? threadIndex}`}
              className={[
                "companion-chat-thread__item companion-fade-in flex flex-col items-start gap-3",
                followsUser ? "companion-chat-thread__item--reply" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.messages.map(({ message, index }, groupIndex) => (
                <div key={index} className="w-full">
                  <AssistantMessageWithTrace
                    content={message.content}
                    trace={message.relationshipTrace}
                    isGreeting={loneGreeting && groupIndex === 0}
                  />
                  {afterLastAssistant && index === lastAssistantIndex ? (
                    <div className="mt-2 w-full">{afterLastAssistant}</div>
                  ) : null}
                </div>
              ))}
            </li>
          );
        })}

        {shouldShowChatVisibleThinking(isLoading, thinkingMessage) ? (
          <li className="companion-chat-thread__item companion-fade-in flex flex-col items-start">
            <VisibleThinkingBubble
              message={chatVisibleThinkingCopy(thinkingMessage)}
              emotion={thinkingEmotion}
              workspacePanel={workspacePanel}
              workspaceActiveBeside={workspaceActiveBeside}
            />
          </li>
        ) : null}
      </ul>
    </section>
  );
}
