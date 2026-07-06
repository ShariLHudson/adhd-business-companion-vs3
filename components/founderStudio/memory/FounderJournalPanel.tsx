"use client";

import { useEffect, useState } from "react";

import type { FounderJournalEntry, FounderJournalEntryKind } from "@/lib/founder/memory/types";

const JOURNAL_STORAGE_KEY = "founder-memory-journal";

const KIND_OPTIONS: { value: FounderJournalEntryKind; label: string }[] = [
  { value: "thought", label: "Executive thought" },
  { value: "lesson", label: "Lesson" },
  { value: "idea", label: "Idea" },
  { value: "reflection", label: "Reflection" },
  { value: "future-letter", label: "Future letter" },
  { value: "note-to-self", label: "Note to self" },
];

type FounderJournalPanelProps = {
  sampleEntries: FounderJournalEntry[];
};

function readLocalJournal(): FounderJournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FounderJournalEntry[];
  } catch {
    return [];
  }
}

export function FounderJournalPanel({ sampleEntries }: FounderJournalPanelProps) {
  const [entries, setEntries] = useState<FounderJournalEntry[]>(sampleEntries);
  const [kind, setKind] = useState<FounderJournalEntryKind>("reflection");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const local = readLocalJournal();
    setEntries([...local, ...sampleEntries]);
    setHydrated(true);
  }, [sampleEntries]);

  const saveEntry = () => {
    if (!title.trim() && !body.trim()) return;
    const entry: FounderJournalEntry = {
      id: `jour-local-${Date.now()}`,
      kind,
      title: title.trim() || "Untitled entry",
      body: body.trim(),
      writtenAt: new Date().toISOString(),
      relatedRefs: [],
    };
    const local = readLocalJournal();
    const nextLocal = [entry, ...local];
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(nextLocal));
    setEntries([entry, ...entries]);
    setTitle("");
    setBody("");
  };

  if (!hydrated) return null;

  return (
    <section className="memory-journal" aria-labelledby="memory-journal-heading">
      <h2 className="memory-journal__heading" id="memory-journal-heading">
        Founder Journal
      </h2>
      <p className="memory-journal__note">
        Private — stored on this device only until backend memory ships.
      </p>

      <div className="memory-journal__compose">
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value as FounderJournalEntryKind)}
          aria-label="Entry kind"
        >
          {KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          aria-label="Journal title"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Executive thoughts, lessons, reflections, letters…"
          rows={4}
          aria-label="Journal body"
        />
        <button type="button" className="memory-journal__save" onClick={saveEntry}>
          Save Entry
        </button>
      </div>

      <ul className="memory-journal__list">
        {entries.map((entry) => (
          <li key={entry.id} className="memory-journal__entry">
            <span className="memory-journal__kind">{entry.kind}</span>
            <h3 className="memory-journal__title">{entry.title}</h3>
            <p className="memory-journal__body">{entry.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
