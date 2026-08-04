"use client";

import { useEffect, useRef, type ReactNode } from "react";
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
};

/**
 * One frosted conversation card — messages above, input below, single surface.
 *
 * Companion On/Off and New Chat / New Day live in the SH Conversations menu —
 * never as a button row inside the Welcome Home daily opening card.
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
  const hideConversationRef = useRef<HTMLButtonElement>(null);
  const showConversationRef = useRef<HTMLButtonElement>(null);
  const prevCompanionOnRef = useRef<boolean | null>(null);
  const companion = useCompanionVisibility();
  const companionOn = companion == null || companion.visibility !== "off";
  /**
   * Estate full-screen backgrounds get an inline Hide/Show conversation control.
   * It drives the SAME CompanionVisibility authority (no new state, no second
   * chat surface); hiding only quiets the thread — messages/context are kept.
   */
  const estateVisibilityControls =
    estateRoom && Boolean(companion) && companion?.showControls === true;

  /** Daily opening / arrival greeting — never suppressed by Companion Off. */
  const showGreeting =
    showWelcomeLine && Boolean(welcomeSlot ?? welcomeMessage);

  /** Chat thread messages — quiet when Companion is Off. */
  const showThread = companionOn && showConversation;

  /**
   * Quiet state only when Companion is Off and there is no daily/arrival card
   * occupying the panel (never replace Welcome Home daily opening).
   */
  const showQuietState =
    !companionOn && !showGreeting && Boolean(companion);

  const showMessageScroll = showGreeting || showThread;
  // `alwaysShowInput` is a true override: Welcome Home / estate rooms keep the
  // composer visible even when Companion is Off, and a welcome card or greeting
  // never suppresses it. Companion Off only quiets the *thread*, not the input.
  const showFooter =
    alwaysShowInput || (companionOn && (showConversation || showGreeting));
  const showDivider =
    companionOn && showMessageScroll && (showConversation || showGreeting);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !showMessageScroll) return;
    if (welcomeSlot && showGreeting) {
      const toTop = () => {
        el.scrollTop = 0;
      };
      toTop();
      requestAnimationFrame(() => requestAnimationFrame(toTop));
      return;
    }
    if (!showThread) return;
    const revealLatestFromTop = () => {
      scrollConversationToLatestExchange(el, { behavior: "auto" });
    };
    revealLatestFromTop();
    requestAnimationFrame(() => requestAnimationFrame(revealLatestFromTop));
  }, [
    conversationScrollKey,
    showMessageScroll,
    showThread,
    thread,
    showGreeting,
    welcomeSlot,
  ]);

  // When the member hides/shows the conversation, move focus to the now-relevant
  // control so keyboard users are not stranded. Skips initial mount and no-ops.
  useEffect(() => {
    if (!estateVisibilityControls) {
      prevCompanionOnRef.current = companionOn;
      return;
    }
    const prev = prevCompanionOnRef.current;
    prevCompanionOnRef.current = companionOn;
    if (prev === null || prev === companionOn) return;
    if (companionOn) hideConversationRef.current?.focus();
    else showConversationRef.current?.focus();
  }, [companionOn, estateVisibilityControls]);

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
        alwaysShowInput && !showMessageScroll
          ? "welcome-home-page__input-wrap--solo"
          : "",
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
      {estateVisibilityControls && companionOn ? (
        <div className="flex justify-end px-1 pt-1">
          <button
            ref={hideConversationRef}
            type="button"
            className="min-h-[44px] rounded-full border border-white/30 bg-black/45 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => companion?.onToggle()}
            aria-label="Hide conversation"
            data-testid="estate-hide-conversation"
          >
            Hide conversation
          </button>
        </div>
      ) : null}

      {showMessageScroll ? (
        <div
          ref={scrollRef}
          className={scrollClasses}
          data-companion-chat-body="true"
          data-testid="welcome-home-chat-body"
        >
          {showGreeting ? (
            welcomeSlot ?? (
              <p className="welcome-home-page__welcome-line">{welcomeMessage}</p>
            )
          ) : null}
          {showThread ? thread : null}
        </div>
      ) : null}

      {showQuietState && companion ? (
        <div className="px-4 py-3" data-companion-chat-body="quiet">
          <CompanionConversationQuietState
            onTurnOn={companion.onTurnOn}
            turnOnLabel={estateRoom ? "Show conversation" : undefined}
            buttonRef={estateRoom ? showConversationRef : undefined}
          />
        </div>
      ) : null}

      {showDivider ? <div className={dividerClass} aria-hidden /> : null}

      {showFooter ? (
        <footer className={footerClass} data-companion-chat-body="true">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
