"use client";

import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { GrowRoomShell } from "@/components/companion/GrowRoomShell";
import type { GrowSectionId } from "@/lib/growNavigation";
import "@/app/companion/grow-room.css";

type GrowCard = {
  id: GrowSectionId;
  title: string;
  description: string;
  buttonLabel: string;
};

const GROW_LANDING_CARDS: GrowCard[] = [
  {
    id: "grow-momentum-builders",
    title: "Momentum Builder™",
    description: "Find the easiest way to move forward today.",
    buttonLabel: "Step inside",
  },
  {
    id: "grow-spark-cards",
    title: "Spark Cards",
    description:
      "Practical entrepreneurial wisdom personalized to your business, goals, and current work.",
    buttonLabel: "Browse Cards",
  },
  {
    id: "grow-guilds",
    title: "Guilds",
    description:
      "Long-term mastery journeys for the entrepreneurial capabilities you want to strengthen.",
    buttonLabel: "Enter Guilds",
  },
  {
    id: "grow-daily-discoveries",
    title: "Daily Discoveries",
    description:
      "Remarkable business insights, founder stories, and ideas you can apply right away.",
    buttonLabel: "Discover Today",
  },
  {
    id: "grow-business-history",
    title: "Business History Today",
    description:
      "Explore the decisions, patterns, and turning points that shaped modern business.",
    buttonLabel: "Explore History",
  },
  {
    id: "grow-observatory",
    title: "Observatory",
    description:
      "Curated discoveries in AI, business, technology, and innovation to help you stay ahead.",
    buttonLabel: "Open Observatory",
  },
];

type Props = {
  onBack: () => void;
  onOpenSection: (section: GrowSectionId) => void;
};

export function GrowLandingPanel({ onBack, onOpenSection }: Props) {
  return (
    <GrowRoomShell>
      <EstateWorkspace className="grow-room-panel grow-room-panel--landing">
        <GrowPanelBackButton onBack={onBack} label="Today" />

        <header className="grow-room__header">
          <p className="estate-workspace__kicker">Entrepreneurial capability</p>
          <h1 className="estate-workspace__title">Grow</h1>
          <p className="grow-room__statement grow-room__intro-lead">
            Become the entrepreneur your business needs you to be.
          </p>
          <p className="grow-room__lead grow-room__intro-support">
            Strengthen your thinking, sharpen your skills, and build real entrepreneurial
            capability through guided experiences designed for your business.
          </p>
        </header>

        <div className="grow-room__cards journal-room__options" role="list">
          {GROW_LANDING_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              className="grow-room__card journal-room__option"
              role="listitem"
              data-testid={`grow-card-${card.id}`}
              onClick={() => onOpenSection(card.id)}
            >
              <span className="journal-room__option-title">{card.title}</span>
              <span className="journal-room__option-desc">{card.description}</span>
              <span className="grow-room__card-action">{card.buttonLabel}</span>
            </button>
          ))}
        </div>
      </EstateWorkspace>
    </GrowRoomShell>
  );
}
