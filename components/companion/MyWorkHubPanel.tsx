"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import {
  buildMyWorkHub,
  searchMyWorkHub,
  type MyWorkHubItem,
  type MyWorkHubOpenTarget,
} from "@/lib/myWorkHub";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import {
  EcosystemCloseAllButton,
  EcosystemCollapsibleSection,
} from "@/components/companion/EcosystemCollapsibleSection";
import { SavedBrowsePanel } from "@/components/companion/SavedBrowsePanel";
import { SAVED_WORK_UPDATED_EVENT } from "@/lib/savedWorkStore";
import { VISUAL_FOCUS_UPDATED } from "@/lib/visualFocus";
import { getProjects, getSnippets, getTemplates } from "@/lib/companionStore";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

type MyWorkHubPanelProps = {
  onOpenSection: (section: AppSection, nav?: SidebarNavId) => void;
  onOpenProject: (projectId: string) => void;
  onOpenSavedWork: (savedWorkId: string) => void;
  onOpenVisualFocusMap?: (mapId: string) => void;
  onBack?: () => void;
  backLabel?: string | null;
  registerBack?: (fn: (() => boolean) | null) => void;
  refreshKey?: string | number;
};

type HubSectionId = "create" | "retrieve";

type CreateDestination = {
  id: string;
  title: string;
  description: string;
  count: number;
  onOpen: () => void;
};

function HubListItem({
  item,
  onOpen,
}: {
  item: MyWorkHubItem;
  onOpen: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-800/70">
          {item.typeLabel}
        </p>
        <p className="mt-0.5 truncate font-semibold text-stone-900">{item.title}</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
      >
        Open
      </button>
    </li>
  );
}

function BrowseRow({
  title,
  count,
  description,
  onOpen,
}: {
  title: string;
  count: number;
  description: string;
  onOpen: () => void;
}) {
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
  onOpenProject,
  onOpenSavedWork,
  onOpenVisualFocusMap,
  refreshKey = 0,
  onBack,
  backLabel,
  registerBack,
}: MyWorkHubPanelProps) {
  const [query, setQuery] = useState("");
  const [savedWorkTick, setSavedWorkTick] = useState(0);
  const [openSections, setOpenSections] = useState<Set<HubSectionId>>(new Set());
  const [savedBrowseOpen, setSavedBrowseOpen] = useState(false);

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
    const templates = getTemplates().filter((t) => t.status !== "archived");

    return {
      projects: activeProjects.length,
      strategies: hub.strategies.length,
      templates: templates.length,
      snippets: getSnippets().length,
      documents: hub.savedWork.length,
      sops: hub.savedWork.filter((w) =>
        w.typeLabel.toLowerCase().includes("sop"),
      ).length,
    };
  }, [hub]);

  const createDestinations: CreateDestination[] = useMemo(
    () => [
      {
        id: "projects",
        title: "Projects",
        description: "Larger work with multiple steps.",
        count: counts.projects,
        onOpen: () => onOpenSection("projects", "other"),
      },
      {
        id: "templates",
        title: "Templates",
        description: "Reusable frameworks and starting points.",
        count: counts.templates,
        onOpen: () => onOpenSection("templates-library", "other"),
      },
      {
        id: "strategies",
        title: "Strategies",
        description: "Saved ADHD and business strategies.",
        count: counts.strategies,
        onOpen: () => onOpenSection("playbook", "other"),
      },
      {
        id: "snippets",
        title: "Snippets",
        description: "Reusable phrases, hooks, CTAs, and content blocks.",
        count: counts.snippets,
        onOpen: () => onOpenSection("snippets", "other"),
      },
      {
        id: "sops",
        title: "SOPs",
        description: "Standard operating procedures and repeatable workflows.",
        count: counts.sops,
        onOpen: () => onOpenSection("saved-work", "other"),
      },
      {
        id: "documents",
        title: "Documents",
        description: "Workshops, plans, emails, and created content.",
        count: counts.documents,
        onOpen: () => onOpenSection("content-generator", "other"),
      },
    ],
    [counts, onOpenSection],
  );

  useEffect(() => {
    const onUpdate = () => setSavedWorkTick((t) => t + 1);
    window.addEventListener(SAVED_WORK_UPDATED_EVENT, onUpdate);
    window.addEventListener(VISUAL_FOCUS_UPDATED, onUpdate);
    return () => {
      window.removeEventListener(SAVED_WORK_UPDATED_EVENT, onUpdate);
      window.removeEventListener(VISUAL_FOCUS_UPDATED, onUpdate);
    };
  }, []);

  useEffect(() => {
    registerBack?.(() => {
      if (savedBrowseOpen) {
        setSavedBrowseOpen(false);
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [registerBack, savedBrowseOpen]);

  function toggleSection(id: HubSectionId) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function closeAll() {
    setOpenSections(new Set());
    setSavedBrowseOpen(false);
  }

  function handleOpen(target: MyWorkHubOpenTarget) {
    switch (target.kind) {
      case "section":
        onOpenSection(target.section, "other");
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
      case "visual-focus":
        onOpenVisualFocusMap?.(target.mapId);
        break;
      case "visual-thinking-browse":
        onOpenSection("visual-focus", "visual-thinking");
        break;
      default:
        break;
    }
  }

  const hasExpanded = openSections.size > 0 || savedBrowseOpen;

  if (savedBrowseOpen) {
    return (
      <section
        className={workspacePanelShellClass({
          width: "standard",
          extra: "bg-[#FBF6EE]",
        })}
        data-testid="other-hub-saved"
      >
        <SavedBrowsePanel
          onBack={() => setSavedBrowseOpen(false)}
          onOpenSection={(section) => onOpenSection(section, "other")}
          onOpenVisualFocusMap={(mapId) => onOpenVisualFocusMap?.(mapId)}
        />
      </section>
    );
  }

  return (
    <section
      className={workspacePanelShellClass({
        width: "standard",
        extra: "bg-[#FBF6EE]",
      })}
      data-testid="other-hub"
    >
      <header className="space-y-4">
        {onBack ? (
          <GrowthPanelBackButton onBack={onBack} label={backLabel ?? "Chat"} />
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Other</h1>
            <p className="mt-1 text-stone-600">
              Create, build, manage, and retrieve — when you need more than chat.
            </p>
          </div>
          <EcosystemCloseAllButton onClick={closeAll} disabled={!hasExpanded} />
        </div>

        <div>
          <label htmlFor="other-search" className="sr-only">
            Search
          </label>
          <input
            id="other-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Search"
            aria-label="Search"
            data-testid="other-search"
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
                      />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <EcosystemCollapsibleSection
              title="Create & Build"
              description="Projects, templates, strategies, snippets, SOPs, and documents."
              objectId="other-tools"
              open={openSections.has("create")}
              onToggle={() => toggleSection("create")}
              testId="other-create-build"
            >
              <div className="flex flex-col gap-2">
                {createDestinations.map((dest) => (
                  <BrowseRow
                    key={dest.id}
                    title={dest.title}
                    count={dest.count}
                    description={dest.description}
                    onOpen={dest.onOpen}
                  />
                ))}
              </div>
            </EcosystemCollapsibleSection>

            <EcosystemCollapsibleSection
              title="Retrieve"
              description="Saved work — browse by category when you need it later."
              objectId="toolbelt-saved-work"
              open={openSections.has("retrieve")}
              onToggle={() => toggleSection("retrieve")}
              testId="other-retrieve"
            >
              <BrowseRow
                title="Saved"
                count={counts.documents + counts.projects + counts.templates}
                description="ADHD-friendly file explorer for everything you kept."
                onOpen={() => setSavedBrowseOpen(true)}
              />
            </EcosystemCollapsibleSection>
          </div>
        )}
      </div>
    </section>
  );
}
