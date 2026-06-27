"use client";

import { AppBackButton } from "@/components/companion/AppBackButton";
import { NAV_CHAT } from "@/lib/navigationBack";
import {
  LIFE_EXPERIENCE_ROOM_TAGLINE,
} from "@/lib/lifeExperienceRoom";
import type { ReactNode } from "react";

type Props = {
  onBackToChat: () => void;
  children: ReactNode;
};

/** Frosted letter-on-side-table chrome — room stays the hero. */
export function LifeExperienceLetterWorkspace({
  onBackToChat,
  children,
}: Props) {
  return (
    <div
      className="life-experience-letter-workspace"
      data-testid="life-experience-letter-workspace"
    >
      <div className="life-experience-letter-workspace__nav">
        <AppBackButton
          destination={NAV_CHAT}
          onBack={onBackToChat}
          size="compact"
        />
      </div>
      <header className="life-experience-letter-workspace__header">
        <p className="life-experience-letter-workspace__eyebrow">
          Life Experience Room
        </p>
        <h1 className="life-experience-letter-workspace__title">
          {LIFE_EXPERIENCE_ROOM_TAGLINE}
        </h1>
      </header>
      <div className="life-experience-letter-workspace__body">{children}</div>
    </div>
  );
}
