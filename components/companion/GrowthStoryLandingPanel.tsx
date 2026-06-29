"use client";

import { useEffect, useState } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthStoryRoomShell } from "@/components/companion/GrowthStoryRoomShell";
import { GrowthWritingCompose } from "@/components/companion/GrowthWritingCompose";
import { createYourStoryEntry } from "@/lib/growthJournalStore";
import "@/app/companion/growth-journal.css";

type StoryOption = {
  id: string;
  title: string;
  description: string;
  onSelect: () => void;
};

type Props = {
  onBack: () => void;
  onOpenJournal: () => void;
  onOpenCapture: () => void;
  onOpenMilestones: () => void;
  onOpenStorybook: () => void;
};

/** Your Story — universal Growth layout; same family as Journal and Capture. */
export function GrowthStoryLandingPanel({
  onBack,
  onOpenJournal,
  onOpenCapture,
  onOpenMilestones,
  onOpenStorybook,
}: Props) {
  const [draft, setDraft] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusRole, setStatusRole] = useState<"status" | "alert">("status");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!statusMessage || statusRole === "alert") return;
    const t = window.setTimeout(() => setStatusMessage(null), 4000);
    return () => window.clearTimeout(t);
  }, [statusMessage, statusRole]);

  const options: StoryOption[] = [
    {
      id: "capture",
      title: "Capture a Moment",
      description: "Save something meaningful from today.",
      onSelect: onOpenCapture,
    },
    {
      id: "journal",
      title: "Journal",
      description: "Write what is on your mind.",
      onSelect: onOpenJournal,
    },
    {
      id: "milestones",
      title: "Milestones",
      description: "Remember important moments and turning points.",
      onSelect: onOpenMilestones,
    },
    {
      id: "storybook",
      title: "Storybook",
      description: "Turn your journey into a beautiful keepsake.",
      onSelect: onOpenStorybook,
    },
  ];

  function saveQuickNote() {
    const text = draft.trim();
    if (!text || saving) return;
    setSaving(true);
    setStatusMessage(null);
    const { ok } = createYourStoryEntry({ content: text, type: "story_reflection" });
    setSaving(false);
    if (ok) {
      setDraft("");
      setStatusRole("status");
      setStatusMessage("Saved to Your Story.");
    } else {
      setStatusRole("alert");
      setStatusMessage("This was not saved yet. Please try again.");
    }
  }

  return (
    <GrowthStoryRoomShell>
      <EstateWorkspace className="journal-room-panel">
        <GrowthPanelBackButton onBack={onBack} label="Growth" />

        <header className="journal-room__header">
          <p className="estate-workspace__kicker">Your Story Room</p>
          <h1 className="estate-workspace__title">Your Story</h1>
          <p className="estate-workspace__lead">
            A quiet place to gather the moments, lessons, and memories that shape your
            life.
          </p>
        </header>

        <div className="journal-room__intro">
          <p className="journal-room__intro-lead">Your story lives here.</p>
          <p className="journal-room__intro-support">
            Capture meaningful moments, reflections, lessons, milestones, and pieces of
            your journey so they are not forgotten.
          </p>
        </div>

        <GrowthWritingCompose
          id="your-story-quick-note"
          label="Save a quick note to Your Story"
          value={draft}
          onChange={setDraft}
          placeholder="A thought, reflection, or memory worth keeping…"
          rows={4}
          saveLabel="Save to Your Story"
          onSave={saveQuickNote}
          saveDisabled={!draft.trim() || saving}
          statusMessage={statusMessage}
          statusRole={statusRole}
        />

        <nav className="journal-room__options" aria-label="Your Story destinations">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="journal-room__option"
              onClick={option.onSelect}
              data-testid={`your-story-option-${option.id}`}
            >
              <span className="journal-room__option-title">{option.title}</span>
              <span className="journal-room__option-desc">{option.description}</span>
            </button>
          ))}
        </nav>
      </EstateWorkspace>
    </GrowthStoryRoomShell>
  );
}
