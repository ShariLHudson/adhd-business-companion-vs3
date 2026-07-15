"use client";

import { AppBackButton } from "@/components/companion/AppBackButton";
import { NAV_CHAT } from "@/lib/navigationBack";
import {
  CLEAR_MY_MIND_HEADER,
  CLEAR_MY_MIND_WELCOME_LINES,
  CLEAR_MY_MIND_WORKSPACE_SUBTITLE,
} from "@/lib/clearMyMindCopy";
import type { ReactNode } from "react";
import "@/app/companion/clear-my-mind-panel.css";

type Props = {
  onBackToChat: () => void;
  children: ReactNode;
};

/**
 * Clear My Mind journal surface — warm paper over glass, not application chrome.
 * Page photograph: Sunroom by default (member may change via Room → Change background).
 */
export function ClearMyMindConservatoryWorkspace({
  onBackToChat,
  children,
}: Props) {
  return (
    <article
      className="clear-my-mind-sunroom-workspace clear-my-mind-journal-page clear-my-mind-panel"
      data-testid="clear-my-mind-conservatory-workspace"
    >
      <div className="clear-my-mind-sunroom-workspace__nav">
        <AppBackButton
          destination={NAV_CHAT}
          onBack={onBackToChat}
          size="compact"
        />
      </div>
      <div className="clear-my-mind-panel__content">
        <header className="clear-my-mind-sunroom-workspace__opening">
          <p className="clear-my-mind-sunroom-workspace__whisper">
            {CLEAR_MY_MIND_WORKSPACE_SUBTITLE}
          </p>
          <h1 className="clear-my-mind-sunroom-workspace__title">
            {CLEAR_MY_MIND_HEADER}
          </h1>
          <p
            className="clear-my-mind-sunroom-workspace__lead"
            data-testid="clear-my-mind-promise"
          >
            {CLEAR_MY_MIND_WELCOME_LINES[0]}
          </p>
        </header>
        <div className="clear-my-mind-sunroom-workspace__body">{children}</div>
      </div>
    </article>
  );
}
