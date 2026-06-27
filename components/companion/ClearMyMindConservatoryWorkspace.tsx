"use client";

import { AppBackButton } from "@/components/companion/AppBackButton";
import { NAV_CHAT } from "@/lib/navigationBack";
import {
  CLEAR_MY_MIND_HEADER,
  CLEAR_MY_MIND_WELCOME_LINES,
  CLEAR_MY_MIND_WORKSPACE_SUBTITLE,
} from "@/lib/clearMyMindCopy";
import type { ReactNode } from "react";

type Props = {
  onBackToChat: () => void;
  children: ReactNode;
};

/**
 * Single frosted workspace chrome — all copy lives inside the panel.
 */
export function ClearMyMindConservatoryWorkspace({
  onBackToChat,
  children,
}: Props) {
  return (
    <div
      className="clear-my-mind-conservatory-workspace"
      data-testid="clear-my-mind-conservatory-workspace"
    >
      <div className="clear-my-mind-conservatory-workspace__nav">
        <AppBackButton
          destination={NAV_CHAT}
          onBack={onBackToChat}
          size="compact"
        />
      </div>
      <header className="clear-my-mind-conservatory-workspace__header">
        <h1 className="clear-my-mind-conservatory-workspace__title">
          {CLEAR_MY_MIND_HEADER}
        </h1>
        <p className="clear-my-mind-conservatory-workspace__subtitle">
          {CLEAR_MY_MIND_WORKSPACE_SUBTITLE}
        </p>
        <p className="clear-my-mind-conservatory-workspace__welcome">
          {CLEAR_MY_MIND_WELCOME_LINES[0]}
        </p>
      </header>
      <div className="clear-my-mind-conservatory-workspace__body">{children}</div>
    </div>
  );
}
