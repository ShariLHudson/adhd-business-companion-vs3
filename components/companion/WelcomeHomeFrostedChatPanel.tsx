"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { scrollConversationToLatestExchange } from "@/lib/conversation/scrollToLatestExchange";

type Props = {
  welcomeMessage?: string;
  /** Custom arrival UI — takes precedence over welcomeMessage */
  welcomeSlot?: ReactNode;
  showWelcomeLine?: boolean;
  showConversation: boolean;
  thread: ReactNode;
  footer: ReactNode;
  panelClassName?: string;
  /**
   * Bumps when messages change — reveals start of latest exchange at top of
   * scrollport (Spec 109 top-down reading; not pin-to-bottom).
   */
  conversationScrollKey?: string | number;
  /** Estate rooms — input always visible even before first message */
  alwaysShowInput?: boolean;
  /** Bottom-anchored frosted panel for full-bleed estate rooms */
  estateRoom?: boolean;
};

/**
 * One frosted conversation card — messages above, input below, single surface.
 */
export function WelcomeHomeFrostedChatPanel({
  welcomeMessage,
  welcomeSlot,
  showWelcomeLine = false,
  showConversation,
  thread,
  footer,
  panelClassName,
  conversationScrollKey,
  alwaysShowInput = false,
  estateRoom = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const showGreeting =
    showWelcomeLine && Boolean(welcomeSlot ?? welcomeMessage);
  const showMessages = showConversation || showGreeting || alwaysShowInput;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !showMessages) return;
    // Welcome Card must open at the top so the full Shari message is readable.
    if (welcomeSlot && showGreeting) {
      const toTop = () => {
        el.scrollTop = 0;
      };
      toTop();
      requestAnimationFrame(() => requestAnimationFrame(toTop));
      return;
    }
    const revealLatestFromTop = () => {
      scrollConversationToLatestExchange(el, { behavior: "auto" });
    };
    revealLatestFromTop();
    requestAnimationFrame(() => requestAnimationFrame(revealLatestFromTop));
  }, [conversationScrollKey, showMessages, thread, showGreeting, welcomeSlot]);

  const panelClasses = estateRoom
    ? [
        "companion-chat-layer",
        "companion-chat-surface-frosted",
        "estate-room-frosted-chat",
        panelClassName,
      ]
    : [
        "companion-chat-layer",
        "companion-chat-surface-frosted",
        "welcome-home-page__chat-panel",
        panelClassName,
      ];

  const scrollClasses = estateRoom
    ? "estate-room-frosted-chat__messages companion-homestead-chat__reading"
    : "welcome-home-page__messages-scroll companion-homestead-chat__reading";

  const dividerClass = estateRoom
    ? "estate-room-frosted-chat__divider"
    : "welcome-home-page__chat-divider";

  const footerClass = estateRoom
    ? "estate-room-frosted-chat__input-wrap companion-home-input-footer input-footer shrink-0"
    : [
        "welcome-home-page__input-wrap companion-home-input-footer input-footer shrink-0",
        alwaysShowInput && !showMessages ? "welcome-home-page__input-wrap--solo" : "",
      ]
        .filter(Boolean)
        .join(" ");

  return (
    <div
      className={panelClasses.filter(Boolean).join(" ")}
      data-companion-chat-layer="true"
      data-everyday-chat=""
      data-testid={estateRoom ? "estate-room-frosted-chat" : "welcome-home-chat"}
    >
      {showMessages ? (
        <div ref={scrollRef} className={scrollClasses}>
          {showGreeting ? (
            welcomeSlot ?? (
              <p className="welcome-home-page__welcome-line">{welcomeMessage}</p>
            )
          ) : null}
          {showConversation ? thread : null}
        </div>
      ) : null}

      {showMessages && (showConversation || showGreeting) ? (
        <div className={dividerClass} aria-hidden />
      ) : null}

      <footer className={footerClass}>{footer}</footer>
    </div>
  );
}
