"use client";

import { useEffect, useState } from "react";
import { JournalRoomShell } from "@/components/companion/JournalRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthWritingCompose } from "@/components/companion/GrowthWritingCompose";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import {
  createJournalEntry,
  deleteJournalEntry,
  getGrowthMemoryEntries,
  GROWTH_ENTRY_TYPE_LABELS,
  GROWTH_JOURNAL_UPDATED_EVENT,
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
  const [entries, setEntries] = useState(() =>
    getGrowthMemoryEntries({ types: ["journal", "capture_moment"] }),
  );
  const [draft, setDraft] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = () =>
      setEntries(getGrowthMemoryEntries({ types: ["journal", "capture_moment"] }));
    load();
    window.addEventListener(GROWTH_JOURNAL_UPDATED_EVENT, load);
    return () => window.removeEventListener(GROWTH_JOURNAL_UPDATED_EVENT, load);
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const t = window.setTimeout(() => setStatusMessage(null), 2400);
    return () => window.clearTimeout(t);
  }, [statusMessage]);

  function saveDraft() {
    const text = draft.trim();
    if (!text) return;
    const { ok } = createJournalEntry({ body: text, attachments: [], type: "journal" });
    if (!ok) return;
    setDraft("");
    setStatusMessage("Saved quietly.");
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

        <GrowthWritingCompose
          id="journal-compose"
          label="What's on your mind today?"
          value={draft}
          onChange={setDraft}
          placeholder="What's on your mind today?"
          saveLabel="Save Reflection"
          onSave={saveDraft}
          statusMessage={statusMessage}
        />

        {entries.length > 0 ? (
          <section
            className="estate-workspace__section journal-room__recent"
            aria-label="Recent memories"
          >
            <h2 className="estate-workspace__section-title">Recent Memories</h2>
            <ul className="journal-room__entries">
              {entries.map((entry) => (
                <li key={entry.id} className="journal-room__entry">
                  <time className="journal-room__entry-date">
                    {formatDate(entry.createdAt)}
                  </time>
                  <span className="journal-room__entry-type">
                    {GROWTH_ENTRY_TYPE_LABELS[entry.type]}
                  </span>
                  {entry.title ? (
                    <p className="journal-room__entry-body font-semibold">{entry.title}</p>
                  ) : null}
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
