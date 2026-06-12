"use client";

import { useState } from "react";
import { getProjects, saveProject, type Project } from "@/lib/companionStore";

export function ProjectPickerModal({
  open,
  artifactTitle,
  preferredProjectName,
  onClose,
  onSelect,
}: {
  open: boolean;
  artifactTitle: string;
  preferredProjectName?: string;
  onClose: () => void;
  onSelect: (project: Project) => void;
}) {
  const [projects, setProjects] = useState<Project[]>(() => getProjects());
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  if (!open) return null;

  const preferred = preferredProjectName?.trim().toLowerCase();
  const sortedProjects = preferred
    ? [...projects].sort((a, b) => {
        const aMatch = a.name.toLowerCase().includes(preferred) ? 1 : 0;
        const bMatch = b.name.toLowerCase().includes(preferred) ? 1 : 0;
        return bMatch - aMatch;
      })
    : projects;

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const next = saveProject({
      name: name.slice(0, 60),
      goal: `Document: ${artifactTitle}`.slice(0, 140),
      nextAction: "Review linked document",
      horizon: "now",
      status: "in-progress",
    });
    const created = next[0];
    if (created) {
      onSelect(created);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] shadow-xl"
        role="dialog"
        aria-label="Choose a project"
      >
        <div className="border-b border-[#e7dfd4] px-4 py-3">
          <p className="text-lg font-semibold text-[#1f1c19]">Add to Project</p>
          <p className="mt-0.5 text-sm text-[#6b635a]">
            Link “{artifactTitle}” to an existing project or create a new one.
          </p>
          {preferredProjectName ? (
            <p className="mt-1 text-sm text-[#1e4f4f]">
              Looking for: <strong>{preferredProjectName}</strong>
            </p>
          ) : null}
        </div>

        <div className="max-h-64 overflow-y-auto px-4 py-3">
          {sortedProjects.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No projects yet — create one below.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sortedProjects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(p);
                      onClose();
                    }}
                    className="w-full rounded-xl border border-[#1e4f4f]/20 bg-white px-4 py-3 text-left hover:bg-[#f0f5f5]"
                  >
                    <p className="font-semibold text-[#1f1c19]">{p.name}</p>
                    {p.goal ? (
                      <p className="mt-0.5 text-sm text-[#6b635a] line-clamp-1">
                        {p.goal}
                      </p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[#e7dfd4] px-4 py-3">
          {creating ? (
            <div className="flex flex-col gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New project name"
                className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base outline-none focus:border-[#1e4f4f]"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
                >
                  Create &amp; Link
                </button>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="rounded-lg border border-[#c9bfb0] px-4 py-2 text-sm font-semibold text-[#6b635a]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreating(true);
                  setProjects(getProjects());
                }}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                + Create New Project
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6b635a] hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
