"use client";

import { useEffect, useMemo, useState } from "react";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import type { HomeResumeItem } from "@/lib/homeResumeItem";
import {
  buildMyWorkHub,
  searchMyWorkHub,
  type MyWorkHubItem,
  type MyWorkHubOpenTarget,
  type MyWorkHubProjectRow,
} from "@/lib/myWorkHub";
import { continuityToHomeResume } from "@/lib/myWorkHubResume";
import { SAVED_WORK_UPDATED_EVENT } from "@/lib/savedWorkStore";
import { initialSectionOpen } from "@/lib/expandableUi";
import { useCategoryColorCoding } from "@/lib/useCategoryColorCoding";
import { projectFileCategoryLabel } from "@/lib/projectFiles";
import { SavedWorkLibrary } from "@/components/companion/SavedWorkLibrary";
import {
  WORKSPACE_PANEL_PADDING_COMPACT_CLASS,
} from "@/lib/workspaceLayoutTokens";

type MyWorkHubPanelProps = {
  onOpenSection: (section: AppSection, nav?: SidebarNavId) => void;
  onResume: (item: HomeResumeItem) => void;
  onOpenProject: (projectId: string) => void;
  onOpenSavedWork: (savedWorkId: string) => void;
  onOpenDecision: () => void;
  onOpenInCreate?: (input: CreationWorkspaceInput) => void;
  refreshKey?: string | number;
};

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function HubSection({
  id,
  title,
  subtitle,
  count,
  accent,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  count?: number;
  accent?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(initialSectionOpen);

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[#e7dfd4] bg-white/90 shadow-sm"
      style={accent ? { borderColor: accent } : undefined}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`hub-${id}`}
        className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div>
          <p className="text-sm font-bold text-[#1f1c19]">
            {title}
            {typeof count === "number" ? (
              <span className="ml-2 rounded-full bg-[#f0ebe3] px-2 py-0.5 text-xs font-semibold text-[#6b635a]">
                {count}
              </span>
            ) : null}
          </p>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[#6b635a]">{subtitle}</p>
          ) : null}
        </div>
        <span className="text-sm text-[#6b635a]" aria-hidden>
          {open ? "▼" : "▶"}
        </span>
      </button>
      {open ? (
        <div
          id={`hub-${id}`}
          className="border-t border-[#efe8de] px-4 py-3"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

function ContinueCard({
  item,
  onContinue,
}: {
  item: MyWorkHubItem;
  onContinue: () => void;
}) {
  return (
    <li className="rounded-xl border border-[#d4e8e8] bg-gradient-to-br from-[#f5fafa] to-[#faf7f2] p-3.5">
      <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]/70">
        {item.typeLabel}
      </p>
      <p className="mt-1 font-semibold text-[#1f1c19]">{item.title}</p>
      <p className="mt-1 text-xs text-[#6b635a]">
        {item.relativeDate ?? formatShortDate(item.date)}
        {item.nextStep ? ` · ${item.nextStep}` : ""}
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="mt-2.5 rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white"
      >
        Continue →
      </button>
    </li>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: MyWorkHubProjectRow;
  onOpen: () => void;
}) {
  const statusColor =
    project.status === "active-focus"
      ? "text-[#1e4f4f] bg-[#e8f4f4]"
      : project.status === "paused"
        ? "text-[#8a7355] bg-[#f5efe8]"
        : "text-[#5c554c] bg-[#f0ebe3]";

  return (
    <li className="rounded-xl border border-[#e4ddd2] bg-[#faf7f2] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[#1f1c19]">{project.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor}`}
            >
              {project.statusLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#6b635a]">
            {project.openTasks} open task{project.openTasks === 1 ? "" : "s"}
            {project.totalTasks > 0
              ? ` · ${project.completionPercent}% complete`
              : ""}
          </p>
          {project.nextAction ? (
            <p className="mt-1 text-xs text-[#5c554c]">Next: {project.nextAction}</p>
          ) : null}
          {project.totalTasks > 0 ? (
            <div className="mt-2 h-1.5 w-full max-w-[12rem] overflow-hidden rounded-full bg-[#e7dfd4]">
              <div
                className="h-full rounded-full bg-[#1e4f4f]/70 transition-all"
                style={{ width: `${project.completionPercent}%` }}
              />
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 rounded-lg border border-[#1e4f4f]/30 bg-white px-2.5 py-1 text-xs font-semibold text-[#1e4f4f]"
        >
          Open
        </button>
      </div>
    </li>
  );
}

export function MyWorkHubPanel({
  onOpenSection,
  onResume,
  onOpenProject,
  onOpenSavedWork,
  onOpenDecision,
  onOpenInCreate,
  refreshKey = 0,
}: MyWorkHubPanelProps) {
  const [query, setQuery] = useState("");
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [savedWorkTick, setSavedWorkTick] = useState(0);
  const colorCoding = useCategoryColorCoding();

  const hub = useMemo(
    () => buildMyWorkHub(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey, savedWorkTick],
  );

  const searchGroups = useMemo(
    () => (query.trim() ? searchMyWorkHub(query, hub) : []),
    [query, hub],
  );

  useEffect(() => {
    const onUpdate = () => setSavedWorkTick((t) => t + 1);
    window.addEventListener(SAVED_WORK_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(SAVED_WORK_UPDATED_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setGoogleConnected(Boolean(j.connected));
      })
      .catch(() => {
        if (!cancelled) setGoogleConnected(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleOpen(target: MyWorkHubOpenTarget) {
    switch (target.kind) {
      case "section":
        onOpenSection(target.section, target.nav);
        break;
      case "project":
        onOpenProject(target.projectId);
        break;
      case "saved-work":
        onOpenSavedWork(target.savedWorkId);
        break;
      case "url":
        window.open(target.url, "_blank", "noopener,noreferrer");
        break;
      case "resume": {
        const item = hub.continueWorking.find((i) => i.id === target.itemId);
        if (item) {
          const resume = continuityToHomeResume(item);
          if (resume) {
            onResume(resume);
            return;
          }
        }
        if (target.continuityType === "decision-compass") onOpenDecision();
        break;
      }
    }
  }

  function handleContinue(item: MyWorkHubItem) {
    const resume = continuityToHomeResume(item);
    if (resume) {
      onResume(resume);
      return;
    }
    handleOpen(item.openTarget);
  }

  const allProjects = [
    ...hub.activeProjects.activeFocus,
    ...hub.activeProjects.inProgress,
    ...hub.activeProjects.paused,
  ];

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-[#f5f0e8]"
      data-testid="my-work-hub"
    >
      <header className={`shrink-0 border-b border-[#e7dfd4] bg-[#faf7f2] ${WORKSPACE_PANEL_PADDING_COMPACT_CLASS}`}>
        <h1 className="text-xl font-bold text-[#1f1c19]">My Work</h1>
        <p className="mt-1 text-sm text-[#6b635a]">
          Everything you&apos;ve created, saved, and started — one trusted home.
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved work, projects, decisions, strategies…"
          aria-label="Search my work"
          data-testid="my-work-search"
          className="mt-3 w-full rounded-xl border border-[#d4cdc3] bg-white px-3 py-2.5 text-sm text-[#1f1c19] shadow-sm placeholder:text-[#9a9289] focus:border-[#1e4f4f] focus:outline-none"
        />
      </header>

      <div className={`flex-1 overflow-y-auto ${WORKSPACE_PANEL_PADDING_COMPACT_CLASS}`}>
        {query.trim() ? (
          <div className="flex flex-col gap-4">
            {searchGroups.length === 0 ? (
              <p className="text-sm text-[#6b635a]">
                No matches for &ldquo;{query}&rdquo;.
              </p>
            ) : (
              searchGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                    {group.label}
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5"
                      >
                        <div>
                          <p className="font-semibold text-[#1f1c19]">
                            {item.title}
                          </p>
                          <p className="text-xs text-[#6b635a]">
                            {item.typeLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpen(item.openTarget)}
                          className="rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white"
                        >
                          Open
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Section 1 — Continue Working */}
            <HubSection
              id="continue"
              title="Continue Working"
              subtitle="Pick up where you left off"
              count={hub.continueWorking.length}
              accent={colorCoding ? "#c5e0e0" : undefined}
            >
              {hub.continueWorking.length === 0 ? (
                <p className="text-sm text-[#6b635a]">
                  Nothing in progress right now. Start in Chat or Create — it
                  will show up here.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {hub.continueWorking.map((item) => (
                    <ContinueCard
                      key={item.id}
                      item={item}
                      onContinue={() => handleContinue(item)}
                    />
                  ))}
                </ul>
              )}
            </HubSection>

            {/* Section 2 — Active Projects */}
            <HubSection
              id="projects"
              title="Active Projects"
              subtitle="Active focus · In progress · Paused"
              count={allProjects.length}
            >
              {allProjects.length === 0 ? (
                <p className="text-sm text-[#6b635a]">
                  No active projects yet. Create one from a plan or open
                  Projects.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {allProjects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onOpen={() => onOpenProject(p.id)}
                    />
                  ))}
                </ul>
              )}
            </HubSection>

            {/* Section 3 — Recent Work */}
            <HubSection
              id="recent"
              title="Recent Work"
              subtitle="Last 20 items across the ecosystem"
            >
              {hub.recentWork.length === 0 ? (
                <p className="text-sm text-[#6b635a]">No recent work yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {hub.recentWork.map((group) => (
                    <div key={group.dateLabel}>
                      <p className="text-xs font-bold text-[#6b635a]">
                        {group.dateLabel}
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {group.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between rounded-lg bg-[#faf7f2] px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#1f1c19]">
                                {item.title}
                              </p>
                              <p className="text-xs text-[#6b635a]">
                                {item.typeLabel}
                                {item.status === "complete" ||
                                item.status === "exported"
                                  ? " · Completed"
                                  : item.status === "draft"
                                    ? " · Edited"
                                    : " · Updated"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpen(item.openTarget)}
                              className="ml-2 shrink-0 text-xs font-semibold text-[#1e4f4f]"
                            >
                              Open
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </HubSection>

            {/* Section 4 — Saved Work Library (embedded) */}
            <HubSection
              id="saved-work"
              title="Saved Work"
              subtitle="SOPs, plans, workshops, emails, documents"
              count={hub.savedWork.length}
            >
              {onOpenInCreate ? (
                <SavedWorkLibrary embedded onOpenInCreate={onOpenInCreate} />
              ) : (
                <p className="text-sm text-[#6b635a]">
                  {hub.savedWork.length} saved item
                  {hub.savedWork.length === 1 ? "" : "s"}.
                </p>
              )}
            </HubSection>

            {/* Section 5 — Files */}
            <HubSection
              id="files"
              title="Files"
              subtitle="Google Docs, Sheets, Forms, PDFs, exports"
              count={hub.files.length}
            >
              {hub.files.length === 0 ? (
                <p className="text-sm text-[#6b635a]">
                  Exports from Create and Decision Compass appear here
                  automatically.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {hub.files.slice(0, 15).map((f) => (
                    <li
                      key={f.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1f1c19]">
                          <span aria-hidden="true">{f.icon} </span>
                          {f.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6b635a]">
                          {projectFileCategoryLabel(f.category)} · {f.source}
                          {f.projectName ? ` · ${f.projectName}` : ""} ·{" "}
                          {formatShortDate(f.date)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpen(f.openTarget)}
                        className="shrink-0 rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </HubSection>

            {/* Section 6 — Ideas Waiting */}
            <HubSection
              id="ideas"
              title="Ideas Waiting"
              subtitle="Clear My Mind — sort, route, or review"
              count={hub.ideasWaiting.total}
            >
              <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[#faf7f2] px-2 py-2">
                  <p className="text-lg font-bold text-[#1f1c19]">
                    {hub.ideasWaiting.unsorted}
                  </p>
                  <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
                    Unsorted
                  </p>
                </div>
                <div className="rounded-xl bg-[#faf7f2] px-2 py-2">
                  <p className="text-lg font-bold text-[#1f1c19]">
                    {hub.ideasWaiting.linkedToProjects}
                  </p>
                  <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
                    Linked
                  </p>
                </div>
                <div className="rounded-xl bg-[#faf7f2] px-2 py-2">
                  <p className="text-lg font-bold text-[#1f1c19]">
                    {hub.ideasWaiting.needingReview}
                  </p>
                  <p className="text-[10px] font-semibold uppercase text-[#6b635a]">
                    Review
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenSection("brain-dump")}
                className="w-full rounded-xl border border-[#1e4f4f]/30 bg-white py-2.5 text-sm font-semibold text-[#1e4f4f]"
              >
                Review Clear My Mind →
              </button>
            </HubSection>

            {/* Section 7 — Client Avatars */}
            <HubSection
              id="avatars"
              title="Client Avatars"
              count={hub.avatars.length}
            >
              {hub.avatars.length === 0 ? (
                <p className="text-sm text-[#6b635a]">No avatars yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {hub.avatars.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-xl border border-[#e4ddd2] bg-[#faf7f2] px-3 py-2.5"
                    >
                      <div>
                        <p className="font-semibold text-[#1f1c19]">
                          {a.isPrimary ? "⭐ " : ""}
                          {a.name}
                        </p>
                        <p className="text-xs text-[#6b635a]">
                          {a.isPrimary ? "Primary" : "Secondary"}
                          {a.tagline ? ` · ${a.tagline}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpen(a.openTarget)}
                        className="rounded-lg border border-[#1e4f4f]/30 bg-white px-2.5 py-1 text-xs font-semibold text-[#1e4f4f]"
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </HubSection>

            {/* Section 8 — Strategies */}
            <HubSection
              id="strategies"
              title="Strategies"
              count={hub.strategies.length}
            >
              {hub.strategies.length === 0 ? (
                <p className="text-sm text-[#6b635a]">No saved strategies yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {hub.strategies.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5"
                    >
                      <div>
                        <p className="font-semibold text-[#1f1c19]">
                          {s.title}
                        </p>
                        <p className="text-xs text-[#6b635a]">
                          {s.isActiveSession
                            ? "Active session"
                            : s.source === "companion_suggested"
                              ? "Companion suggested"
                              : "Saved strategy"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpen(s.openTarget)}
                        className="text-xs font-semibold text-[#1e4f4f]"
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </HubSection>

            {/* Section 9 — Wins This Week (full view) */}
            <HubSection
              id="wins"
              title="Wins This Week"
              subtitle="Encouragement and progress — not on Today"
              accent={colorCoding ? "#e8dfd0" : undefined}
            >
              {hub.momentum.length === 0 ? (
                <p className="text-sm text-[#6b635a]">
                  No wins recorded yet this week. Every small step counts.
                </p>
              ) : (
                <ul className="space-y-1 text-sm text-[#2f261f]">
                  {hub.momentum.map((stat) => (
                    <li key={stat.id}>
                      {stat.icon} {stat.count} {stat.label.toLowerCase()}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => onOpenSection("wins-this-week", "wins-this-week")}
                className="mt-3 text-xs font-semibold text-[#1e4f4f]"
              >
                Open Wins This Week →
              </button>
            </HubSection>
          </div>
        )}
      </div>

      <footer
        className="shrink-0 border-t border-[#e7dfd4] bg-[#faf7f2] px-4 py-3 text-xs text-[#6b635a]"
        data-testid="my-work-trust"
      >
        <p className="font-semibold text-[#1f1c19]">Your work is safe here</p>
        <p className="mt-1">
          {hub.trust.projectCount} active project
          {hub.trust.projectCount === 1 ? "" : "s"} · {hub.trust.savedWorkCount}{" "}
          saved · {hub.trust.resumeItemCount} to continue · Google{" "}
          {googleConnected === null
            ? "…"
            : googleConnected
              ? "connected"
              : "not connected"}
          {hub.trust.lastSaveAt
            ? ` · Last save ${formatShortDate(hub.trust.lastSaveAt)}`
            : ""}
        </p>
      </footer>
    </div>
  );
}
