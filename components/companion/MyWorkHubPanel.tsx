"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";
import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import type { HomeResumeItem } from "@/lib/homeResumeItem";
import {
  buildMyWorkHub,
  searchMyWorkHub,
  type MyWorkHubItem,
  type MyWorkHubOpenTarget,
} from "@/lib/myWorkHub";
import { continuityToHomeResume } from "@/lib/myWorkHubResume";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import {
  EcosystemCloseAllButton,
  EcosystemCollapsibleSection,
  EcosystemSubsectionLabel,
} from "@/components/companion/EcosystemCollapsibleSection";
import { SAVED_WORK_UPDATED_EVENT, getArchivedSavedWork } from "@/lib/savedWorkStore";
import { getProjects, getSnippets, getTemplates } from "@/lib/companionStore";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

type MyWorkHubPanelProps = {
  onOpenSection: (section: AppSection, nav?: SidebarNavId) => void;
  onResume: (item: HomeResumeItem) => void;
  onOpenProject: (projectId: string) => void;
  onOpenSavedWork: (savedWorkId: string) => void;
  onOpenDecision: () => void;
  onOpenInCreate?: (input: CreationWorkspaceInput) => void;
  onBack?: () => void;
  backLabel?: string | null;
  registerBack?: (fn: (() => boolean) | null) => void;
  refreshKey?: string | number;
};

type MyWorkSectionId = "continue" | "browse";

type BrowseDestination = {
  id: string;
  title: string;
  count: number;
  description: string;
  isArchive?: boolean;
  onOpen: () => void;
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

function HubListItem({
  item,
  onOpen,
  actionLabel = "Open",
}: {
  item: MyWorkHubItem;
  onOpen: () => void;
  actionLabel?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-800/70">
          {item.typeLabel}
        </p>
        <p className="mt-0.5 truncate font-semibold text-stone-900">{item.title}</p>
        <p className="mt-0.5 text-xs text-stone-500">
          {item.relativeDate ?? formatShortDate(item.date)}
          {item.nextStep ? ` · ${item.nextStep}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
      >
        {actionLabel}
      </button>
    </li>
  );
}

function BrowseRow({
  title,
  count,
  description,
  open,
  isArchive,
  onToggle,
  onOpen,
}: {
  title: string;
  count: number;
  description: string;
  open?: boolean;
  isArchive?: boolean;
  onToggle?: () => void;
  onOpen: () => void;
}) {
  if (isArchive) {
    return (
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-stone-50"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-stone-900">{title}</span>
            <span className="block text-xs text-stone-500">{description}</span>
          </span>
          {count > 0 ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-700">
              {count}
            </span>
          ) : null}
          <span className="text-xs text-stone-400" aria-hidden="true">
            {open ? "▲" : "▼"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left hover:bg-stone-50"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-stone-900">{title}</span>
        <span className="block text-xs text-stone-500">{description}</span>
      </span>
      {count > 0 ? (
        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-700">
          {count}
        </span>
      ) : null}
      <span className="text-xs font-semibold text-teal-800">Open →</span>
    </button>
  );
}

export function MyWorkHubPanel({
  onOpenSection,
  onResume,
  onOpenProject,
  onOpenSavedWork,
  onOpenDecision,
  refreshKey = 0,
  onBack,
  backLabel,
  registerBack,
}: MyWorkHubPanelProps) {
  const [query, setQuery] = useState("");
  const [savedWorkTick, setSavedWorkTick] = useState(0);
  const [openSections, setOpenSections] = useState<Set<MyWorkSectionId>>(new Set());
  const [archiveOpen, setArchiveOpen] = useState(false);

  const hub = useMemo(
    () => buildMyWorkHub(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey, savedWorkTick],
  );

  const searchGroups = useMemo(
    () => (query.trim() ? searchMyWorkHub(query, hub) : []),
    [query, hub],
  );

  const counts = useMemo(() => {
    const allProjects = getProjects();
    const activeProjects = allProjects.filter((p) => p.status !== "completed");
    const completedProjects = allProjects.filter((p) => p.status === "completed");
    const templates = getTemplates().filter((t) => t.status !== "archived");
    const archivedTemplates = getTemplates().filter((t) => t.status === "archived");
    const archivedSaved = getArchivedSavedWork();

    return {
      continue: hub.continueWorking.length,
      projects: activeProjects.length,
      createdContent: hub.savedWork.length,
      strategies: hub.strategies.length,
      templates: templates.length,
      snippets: getSnippets().length,
      archive:
        archivedSaved.length + completedProjects.length + archivedTemplates.length,
      completedProjects,
      archivedSaved,
      archivedTemplates,
    };
  }, [hub]);

  const recentActive = useMemo(
    () => hub.recentWork.flatMap((g) => g.items).slice(0, 8),
    [hub],
  );

  const favorites: MyWorkHubItem[] = useMemo(() => [], []);

  const browseDestinations: BrowseDestination[] = useMemo(
    () => [
      {
        id: "created-content",
        title: "Created Content",
        description: "Workshops, plans, emails, SOPs, and drafts.",
        count: counts.createdContent,
        onOpen: () => onOpenSection("saved-work", "my-work"),
      },
      {
        id: "projects",
        title: "Projects",
        description: "Larger work with multiple steps.",
        count: counts.projects,
        onOpen: () => onOpenSection("projects", "my-work"),
      },
      {
        id: "snippets",
        title: "Snippets",
        description: "Reusable phrases, hooks, CTAs, and content blocks.",
        count: counts.snippets,
        onOpen: () => onOpenSection("snippets", "my-work"),
      },
      {
        id: "strategies",
        title: "Strategies",
        description: "Saved ADHD and business strategies.",
        count: counts.strategies,
        onOpen: () => onOpenSection("playbook", "my-work"),
      },
      {
        id: "templates",
        title: "Templates",
        description: "Reusable frameworks and starting points.",
        count: counts.templates,
        onOpen: () => onOpenSection("templates-library", "my-work"),
      },
      {
        id: "archive",
        title: "Archive",
        description: "Finished or older work you may need later.",
        count: counts.archive,
        isArchive: true,
        onOpen: () => setArchiveOpen((o) => !o),
      },
    ],
    [counts, onOpenSection],
  );

  useEffect(() => {
    const onUpdate = () => setSavedWorkTick((t) => t + 1);
    window.addEventListener(SAVED_WORK_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(SAVED_WORK_UPDATED_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    registerBack?.(() => false);
    return () => registerBack?.(null);
  }, [registerBack]);

  function toggleSection(id: MyWorkSectionId) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function closeAll() {
    setOpenSections(new Set());
    setArchiveOpen(false);
  }

  const hasExpanded =
    openSections.size > 0 || archiveOpen || expandedCardsExist(openSections, archiveOpen);

  function handleOpen(target: MyWorkHubOpenTarget) {
    switch (target.kind) {
      case "section":
        onOpenSection(target.section, "my-work");
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

  return (
    <section
      className={workspacePanelShellClass({
        width: "standard",
        extra: "bg-[#FBF6EE]",
      })}
      data-testid="my-work-hub"
    >
      <header className="space-y-4">
        {onBack ? (
          <GrowthPanelBackButton onBack={onBack} label={backLabel ?? "Chat"} />
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">My Work</h1>
            <p className="mt-1 text-stone-600">
              Find what you started, saved, created, or want to come back to.
            </p>
          </div>
          <EcosystemCloseAllButton onClick={closeAll} disabled={!hasExpanded} />
        </div>

        <div>
          <label htmlFor="my-work-search" className="sr-only">
            Search Everything
          </label>
          <input
            id="my-work-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Everything"
            aria-label="Search Everything"
            data-testid="my-work-search"
            className="w-full rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
        </div>
      </header>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
        {query.trim() ? (
          <div className="flex flex-col gap-4">
            {searchGroups.length === 0 ? (
              <p className="text-sm text-stone-600">
                No matches for &ldquo;{query}&rdquo;.
              </p>
            ) : (
              searchGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                    {group.label}
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {group.items.map((item) => (
                      <HubListItem
                        key={item.id}
                        item={item}
                        onOpen={() => handleOpen(item.openTarget)}
                        actionLabel={
                          group.label === "Continue Working" ? "Continue" : "Open"
                        }
                      />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3" data-testid="my-work-hub-grid">
            <EcosystemCollapsibleSection
              title="Continue Working"
              description="Pick up where you left off."
              emoji="⏱️"
              open={openSections.has("continue")}
              onToggle={() => toggleSection("continue")}
              count={counts.continue}
              testId="my-work-continue-featured"
              accentClass="border-stone-200 border-t-4 border-t-amber-800"
            >
              <EcosystemSubsectionLabel>Favorites</EcosystemSubsectionLabel>
              {favorites.length === 0 ? (
                <p className="px-1 text-sm text-stone-600">
                  Nothing pinned yet. Favorite items will appear here.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {favorites.map((item) => (
                    <HubListItem
                      key={item.id}
                      item={item}
                      onOpen={() => handleContinue(item)}
                      actionLabel="Open"
                    />
                  ))}
                </ul>
              )}

              <EcosystemSubsectionLabel>Recently Active</EcosystemSubsectionLabel>
              {recentActive.length === 0 ? (
                <p className="px-1 text-sm text-stone-600">
                  Recent work will show up here as you use the ecosystem.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentActive.map((item) => (
                    <HubListItem
                      key={item.id}
                      item={item}
                      onOpen={() => handleContinue(item)}
                    />
                  ))}
                </ul>
              )}

              <EcosystemSubsectionLabel>Resume Items</EcosystemSubsectionLabel>
              {hub.continueWorking.length === 0 ? (
                <p className="px-1 text-sm text-stone-600">
                  Nothing in progress right now. Start in Chat or Create — it
                  will show up here.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {hub.continueWorking.map((item) => (
                    <HubListItem
                      key={item.id}
                      item={item}
                      onOpen={() => handleContinue(item)}
                      actionLabel="Continue"
                    />
                  ))}
                </ul>
              )}
            </EcosystemCollapsibleSection>

            <EcosystemCollapsibleSection
              title="Browse My Work"
              description="Projects, content, strategies, templates, snippets, and archive."
              open={openSections.has("browse")}
              onToggle={() => toggleSection("browse")}
              testId="my-work-browse"
            >
              <div className="flex flex-col gap-2">
                {browseDestinations.map((dest) => (
                  <div key={dest.id}>
                    <BrowseRow
                      title={dest.title}
                      count={dest.count}
                      description={dest.description}
                      isArchive={dest.isArchive}
                      open={archiveOpen}
                      onToggle={dest.isArchive ? () => setArchiveOpen((o) => !o) : undefined}
                      onOpen={dest.onOpen}
                    />
                    {dest.isArchive && archiveOpen ? (
                      <div className="mt-2 space-y-4 border-l-2 border-stone-200 pl-3">
                        {counts.archivedSaved.length > 0 ? (
                          <section>
                            <h3 className="text-sm font-bold text-stone-800">
                              Archived saved work
                            </h3>
                            <ul className="mt-2 flex flex-col gap-2">
                              {counts.archivedSaved.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3"
                                >
                                  <div className="min-w-0">
                                    <p className="font-semibold text-stone-900">
                                      {item.title}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                      {item.artifactType} ·{" "}
                                      {formatShortDate(item.updatedAt)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onOpenSavedWork(item.id)}
                                    className="shrink-0 rounded-full border border-teal-700/30 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-700/10"
                                  >
                                    Open
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ) : null}

                        {counts.completedProjects.length > 0 ? (
                          <section>
                            <h3 className="text-sm font-bold text-stone-800">
                              Completed projects
                            </h3>
                            <ul className="mt-2 flex flex-col gap-2">
                              {counts.completedProjects.map((project) => (
                                <li
                                  key={project.id}
                                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3"
                                >
                                  <div className="min-w-0">
                                    <p className="font-semibold text-stone-900">
                                      {project.name}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                      Completed · {formatShortDate(project.updatedAt)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onOpenProject(project.id)}
                                    className="shrink-0 rounded-full border border-teal-700/30 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-700/10"
                                  >
                                    Open
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ) : null}

                        {counts.archive === 0 ? (
                          <p className="text-sm text-stone-600">
                            No archived work yet.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </EcosystemCollapsibleSection>
          </div>
        )}
      </div>
    </section>
  );
}

function expandedCardsExist(
  openSections: Set<MyWorkSectionId>,
  archiveOpen: boolean,
): boolean {
  return openSections.size > 0 || archiveOpen;
}
