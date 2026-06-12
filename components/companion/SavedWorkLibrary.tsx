"use client";

import { useEffect, useState } from "react";
import {
  getSavedWork,
  type SavedWorkItem,
  type SavedWorkStatus,
} from "@/lib/savedWorkStore";
import type { AppSection } from "@/lib/companionUi";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";

const STATUS_TABS: { id: SavedWorkStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "saved", label: "Saved" },
  { id: "draft", label: "Drafts" },
  { id: "exported", label: "Exported" },
];

export function SavedWorkLibrary({
  onBack,
  onOpenInCreate,
}: {
  onBack?: () => void;
  onOpenInCreate?: (input: CreationWorkspaceInput) => void;
}) {
  const [items, setItems] = useState<SavedWorkItem[]>([]);
  const [status, setStatus] = useState<SavedWorkStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    setItems(getSavedWork());
  }, []);

  const visible = items.filter((w) => {
    if (status !== "all" && w.status !== status) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      w.title.toLowerCase().includes(q) ||
      w.artifactType.toLowerCase().includes(q) ||
      w.preview.toLowerCase().includes(q)
    );
  });

  const viewing = viewId ? items.find((w) => w.id === viewId) : null;

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-3xl flex-col px-6 py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-[#1f1c19]">📂 Saved Work</p>
          <p className="mt-1 text-base text-[#6b635a]">
            Your created documents — proposals, SOPs, plans, and more. (Templates
            are reusable patterns; this is your actual work.)
          </p>
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-sm font-semibold text-[#1e4f4f] hover:underline"
          >
            ← Back
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatus(tab.id)}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              status === tab.id
                ? "bg-[#1e4f4f] text-white"
                : "bg-white text-[#6b635a] ring-1 ring-[#e7dfd4]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search saved work…"
        className="mt-3 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base outline-none focus:border-[#1e4f4f]"
      />

      {viewing ? (
        <div className="mt-6 flex min-h-0 flex-1 flex-col rounded-2xl border border-[#e7dfd4] bg-white p-4">
          <button
            type="button"
            onClick={() => setViewId(null)}
            className="self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
          >
            ← All saved work
          </button>
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            {viewing.artifactType} · {viewing.status}
          </p>
          <h2 className="text-xl font-semibold text-[#1f1c19]">{viewing.title}</h2>
          <p className="mt-1 text-sm text-[#6b635a]">{viewing.savedLocation}</p>
          {viewing.projectName ? (
            <p className="text-sm text-[#6b635a]">Project: {viewing.projectName}</p>
          ) : null}
          <pre className="mt-4 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl bg-[#faf7f2] p-4 text-sm leading-relaxed text-[#2d2926]">
            {viewing.body}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            {onOpenInCreate ? (
              <button
                type="button"
                onClick={() =>
                  onOpenInCreate({
                    itemType: viewing.artifactType,
                    title: viewing.title,
                    draftContent: viewing.body,
                    stage: "editing draft",
                    source: "generated",
                    templateId: viewing.id,
                  })
                }
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
              >
                Open in Create
              </button>
            ) : null}
            {viewing.googleDocUrl ? (
              <a
                href={viewing.googleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#1e4f4f]/40 px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                Open Google Doc
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {visible.length === 0 ? (
            <li className="rounded-xl border border-dashed border-[#e7dfd4] p-6 text-center text-sm text-[#6b635a]">
              No saved work yet — create something in **Create** and click **Save**.
            </li>
          ) : (
            visible.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => setViewId(w.id)}
                  className="w-full rounded-xl border border-[#e7dfd4] bg-white px-4 py-3 text-left hover:border-[#1e4f4f]/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[#1f1c19]">{w.title}</p>
                    <span className="shrink-0 text-xs font-bold uppercase text-[#6b635a]">
                      {w.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[#6b635a]">
                    {w.artifactType} · {w.savedLocation}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-[#9a8f82]">
                    {w.preview}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
