"use client";

import { useEffect, useState } from "react";
import { JournalRoomShell } from "@/components/companion/JournalRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  GROWTH_JOURNAL_UPDATED_EVENT,
  type JournalEntry,
} from "@/lib/growthJournalStore";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import "@/app/companion/growth-journal.css";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GrowthJournalPanel({
  nav,
}: {
  refreshKey?: string;
  nav: GrowthPanelNav;
}) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [savedPulse, setSavedPulse] = useState(false);

  useEffect(() => {
    const load = () => setEntries(getJournalEntries());
    load();
    window.addEventListener(GROWTH_JOURNAL_UPDATED_EVENT, load);
    return () => window.removeEventListener(GROWTH_JOURNAL_UPDATED_EVENT, load);
  }, []);

  function saveDraft() {
    const text = draft.trim();
    if (!text) return;
    createJournalEntry({ body: text, attachments: [] });
    setDraft("");
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 2400);
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
          <h1 className="estate-workspace__title">Journal</h1>
          <p className="estate-workspace__lead">A quiet place to write what matters.</p>
        </header>

        <div className="journal-room__compose">
          <label className="sr-only" htmlFor="journal-compose">
            What&apos;s on your mind today?
          </label>
          <textarea
            id="journal-compose"
            className="journal-room__textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What's on your mind today?"
            rows={5}
          />
          <div className="journal-room__compose-actions">
            <button
              type="button"
              className="journal-room__save"
              disabled={!draft.trim()}
              onClick={saveDraft}
            >
              Save Reflection
            </button>
            {savedPulse ? (
              <span className="journal-room__saved-note" role="status">
                Saved quietly.
              </span>
            ) : null}
          </div>
        </div>

        {entries.length > 0 ? (
          <section className="estate-workspace__section journal-room__recent" aria-label="Recent Reflections">
            <h2 className="estate-workspace__section-title">Recent Reflections</h2>
            <ul className="journal-room__entries">
              {entries.map((entry) => (
                <li key={entry.id} className="journal-room__entry">
                  <time className="journal-room__entry-date">{formatDate(entry.createdAt)}</time>
                  <p className="journal-room__entry-body">{entry.body}</p>
                  {entry.attachments.length > 0 ? (
                    <div className="journal-room__entry-attachments">
                      <GrowthAttachmentsField
                        attachments={entry.attachments}
                        onAttachmentsChange={() => {}}
                      />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="journal-room__entry-remove"
                    onClick={() => deleteJournalEntry(entry.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </EstateWorkspace>
    </JournalRoomShell>
  );
}
