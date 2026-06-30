"use client";

import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { GrowRoomShell } from "@/components/companion/GrowRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import "@/app/companion/grow-room.css";

type BuilderCategory = {
  id: string;
  title: string;
  tagline: string;
  placeholders: string[];
};

const ENTREPRENEURIAL_BUILDER_CATEGORIES: BuilderCategory[] = [
  {
    id: "recommended",
    title: "Recommended for You",
    tagline: "Guidance will suggest Builders that fit your business and journey.",
    placeholders: ["Coming soon — personalized recommendations"],
  },
  {
    id: "thinking",
    title: "Build Your Thinking",
    tagline: "Strategic thinking, decision-making, problem-solving.",
    placeholders: [
      "Opportunity Spotting",
      "Second-Order Thinking",
      "Priority Compass",
    ],
  },
  {
    id: "marketing",
    title: "Build Your Marketing",
    tagline: "Messaging, offers, positioning, storytelling.",
    placeholders: ["Headline Makeover", "Offer Positioning", "Value Proposition"],
  },
  {
    id: "confidence",
    title: "Build Your Confidence",
    tagline: "Courage, clarity, resilience, executive function.",
    placeholders: ["Focus Sprint", "Decision Sorting", "Mental Decluttering"],
  },
  {
    id: "systems",
    title: "Build Your Systems",
    tagline: "AI fluency, workflow design, operations, automation thinking.",
    placeholders: ["Workflow Design", "Automation Thinking", "Prompt Improvement"],
  },
];

type Props = {
  onBack: () => void;
  backLabel?: string | null;
};

export function GrowMomentumBuildersPanel({ onBack, backLabel }: Props) {
  return (
    <GrowRoomShell>
      <EstateWorkspace className="grow-room-panel journal-room-panel">
        <GrowPanelBackButton onBack={onBack} label={backLabel ?? "Grow"} />

        <header className="grow-room__header journal-room__header">
          <p className="estate-workspace__kicker">Grow</p>
          <h1 className="estate-workspace__title">Momentum Builders</h1>
          <p className="grow-room__lead journal-room__intro-support">
            Practice the thinking, decisions, and skills that help you become a stronger
            entrepreneur.
          </p>
        </header>

        <div className="grow-room__sections">
          {ENTREPRENEURIAL_BUILDER_CATEGORIES.map((category) => (
            <section
              key={category.id}
              className="grow-room__section"
              aria-labelledby={`grow-builder-${category.id}`}
            >
              <h2 id={`grow-builder-${category.id}`} className="grow-room__section-title">
                {category.title}
              </h2>
              <p className="grow-room__section-tagline">{category.tagline}</p>
              <ul className="grow-room__placeholder-list">
                {category.placeholders.map((name) => (
                  <li key={name}>
                    <div className="grow-room__placeholder-card">
                      <span className="grow-room__placeholder-title">{name}</span>
                      <span className="grow-room__placeholder-note">Coming soon</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </EstateWorkspace>
    </GrowRoomShell>
  );
}
