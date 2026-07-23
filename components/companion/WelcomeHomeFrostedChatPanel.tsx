"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CompanionConversationControls } from "@/components/companion/CompanionConversationControls";
import { CompanionConversationQuietState } from "@/components/companion/CompanionConversationQuietState";
import { useCompanionVisibility } from "@/components/companion/CompanionVisibilityContext";
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
  /** Override context — when false, never show Companion On/Off controls */
  companionControlsEnabled?: boolean;
};

/**
 * One frosted conversation card — messages above, input below, single surface.
 * Companion On/Off lives in the conversation area (not buried in Settings).
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
  companionControlsEnabled = true,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const companion = useCompanionVisibility();
  const showCompanionControls =
    companionControlsEnabled && Boolean(companion?.showControls);
  const companionOn =
    !showCompanionControls || companion?.visibility !== "off";

  const showGreeting =
    companionOn && showWelcomeLine && Boolean(welcomeSlot ?? welcomeMessage);
  const showMessages =
    companionOn && (showConversation || showGreeting || alwaysShowInput);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !showMessages) return;
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
      data-companion-participation={companionOn ? "on" : "off"}
      data-everyday-chat=""
      data-testid={estateRoom ? "estate-room-frosted-chat" : "welcome-home-chat"}
    >
      {showCompanionControls && companion ? (
        <div className="shrink-0 px-3 pt-3 pb-1">
          <CompanionConversationControls
            visibility={companion.visibility}
            onToggle={companion.onToggle}
            onNewChat={companion.onNewChat}
            onNewDay={companion.onNewDay}
            onOpenHistory={companion.onOpenHistory}
          />
        </div>
      ) : null}

      {!companionOn && showCompanionControls && companion ? (
        <div className="px-4 py-3" data-companion-chat-body="quiet">
          <CompanionConversationQuietState onTurnOn={companion.onTurnOn} />
        </div>
      ) : null}

      {companionOn && showMessages ? (
        <div
          ref={scrollRef}
          className={scrollClasses}
          data-companion-chat-body="true"
        >
          {showGreeting ? (
            welcomeSlot ?? (
              <p className="welcome-home-page__welcome-line">{welcomeMessage}</p>
            )
          ) : null}
          {showConversation ? thread : null}
        </div>
      ) : null}

      {companionOn && showMessages && (showConversation || showGreeting) ? (
        <div className={dividerClass} aria-hidden />
      ) : null}

      {companionOn ? (
        <footer className={footerClass} data-companion-chat-body="true">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
