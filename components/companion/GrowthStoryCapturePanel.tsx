"use client";

import { useEffect, useState } from "react";
import { JournalRoomShell } from "@/components/companion/JournalRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthWritingCompose } from "@/components/companion/GrowthWritingCompose";
import {
  createCaptureMomentEntry,
  GROWTH_JOURNAL_UPDATED_EVENT,
} from "@/lib/growthJournalStore";
import "@/app/companion/growth-journal.css";

const CAPTURE_PLACEHOLDER = `What would you like to remember?
A moment...
A thought...
Something someone said...
A win...
A lesson...
A business idea...
Something that mattered today...`;

type CaptureNav = {
  onBack: () => void;
  backLabel?: string | null;
};

/** Capture a Moment — same layout as Journal, capture-specific copy and save. */
export function GrowthStoryCapturePanel({ nav }: { nav: CaptureNav }) {
  const [draft, setDraft] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusRole, setStatusRole] = useState<"status" | "alert">("status");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!statusMessage || statusRole === "alert") return;
    const t = window.setTimeout(() => setStatusMessage(null), 4000);
    return () => window.clearTimeout(t);
  }, [statusMessage, statusRole]);

  async function saveDraft() {
    const text = draft.trim();
    if (!text || saving) return;
    setSaving(true);
    setStatusMessage(null);
    const { ok } = createCaptureMomentEntry({ content: text });
    setSaving(false);
    if (ok) {
      setDraft("");
      setStatusRole("status");
      setStatusMessage(
        "Moment saved. Your companion can help you find it later.",
      );
      window.dispatchEvent(new Event(GROWTH_JOURNAL_UPDATED_EVENT));
    } else {
      setStatusRole("alert");
      setStatusMessage("This moment was not saved yet. Please try again.");
    }
  }

  return (
    <JournalRoomShell>
      <EstateWorkspace className="journal-room-panel">
        <GrowthPanelBackButton
          onBack={nav.onBack}
          label={nav.backLabel ?? "Your Story"}
        />

        <header className="journal-room__header">
          <p className="estate-workspace__kicker">The White Gazebo</p>
          <h1 className="estate-workspace__title">Capture a Moment</h1>
          <p className="estate-workspace__lead">
            A quiet place to save something you may want to remember later.
          </p>
        </header>

        <GrowthWritingCompose
          id="capture-moment-compose"
          label="What would you like to remember?"
          value={draft}
          onChange={setDraft}
          placeholder={CAPTURE_PLACEHOLDER}
          saveLabel="Keep This Moment"
          onSave={saveDraft}
          saveDisabled={!draft.trim() || saving}
          statusMessage={statusMessage}
          statusRole={statusRole}
        />
      </EstateWorkspace>
    </JournalRoomShell>
  );
}
