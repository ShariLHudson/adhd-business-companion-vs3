"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  initialCollapsedSectionMap,
  toggleSectionInMap,
} from "@/lib/expandableUi";
import {
  STRATEGIES,
  STRATEGY_GROUPS,
  categoriesForGroup,
  getCategory,
  getStrategy,
  groupForStrategy,
  resolveSubcat,
  strategiesFor,
  timeForStrategy,
  warmthFor,
  type Strategy,
  type StrategyGroupId,
} from "@/lib/strategySystem";
import {
  ADHD_STRATEGY_HUB,
  BUSINESS_STRATEGY_TEMPLATES,
  STRATEGIES_HUB,
  adhdStrategyDropdownGroups,
  businessBuiltinStrategyCount,
  type AdhdStrategyHubEntry,
} from "@/lib/strategyCatalog";
import { BusinessStrategyDock } from "@/components/companion/BusinessStrategyDock";
import type { BusinessStrategySession } from "@/lib/businessStrategyBuilder";
import { compareDropdownLabels } from "@/lib/dropdownSort";
import {
  getUserStrategies,
  saveUserStrategy,
  suggestCategory,
  userStrategiesFor,
  type UserStrategy,
} from "@/lib/userStrategies";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import { StrategyApplyPanel } from "@/components/companion/StrategyApplyPanel";
import type { StrategyApplySession } from "@/lib/strategyApplyCoach";
import { useVisualMode } from "@/lib/useVisualMode";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import { StrategyUseNow } from "@/components/companion/StrategyUseNow";
import { CoachingLibraryPicker } from "@/components/companion/CoachingLibraryPicker";
import { saveProject } from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";
import { appReferences } from "@/lib/appReferences";
import {
  CATEGORY_COMPANION_TOOLS,
  pickStrategyReflection,
} from "@/lib/strategyReflections";

type View =
  | { v: "home" }
  | { v: "adhd" }
  | { v: "business" }
  | { v: "group"; group: StrategyGroupId }
  | { v: "recommended" }
  | { v: "saved" }
  | { v: "strategy"; stratId: string }
  | { v: "userStrategy"; id: string }
  | { v: "new" };

// Meaning hue → brighter decorative counterpart (matches the rest of the app).
const DECOR: Record<string, string> = {
  "#1e4f4f": "#0d9488",
  "#9a6fb0": "#a855f7",
  "#4a6fa5": "#3b82f6",
  "#2f4f7a": "#6366f1",
  "#c08a3e": "#f59e0b",
  "#a85c4a": "#ef4444",
  "#6b8e23": "#22c55e",
};

// Category → Strategy → Action. ADHD-friendly: never more than 3 meaningful
// choices on screen. Categories are navigation; strategies are action-first.
export function StrategiesPanel({
  onOpen,
  onAsk,
  onContextChange,
  onStartBusinessStrategy,
  onStartStrategyApply,
  onOpenActivity,
  registerBack,
  openCommand,
  strategyApplySession,
  onDismissStrategyApply,
  businessStrategySession,
  businessStrategyDraft,
  onDismissBusinessBuild,
  onTalkBusinessWithShari,
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  onContextChange?: (detail: import("@/lib/workspaceAwareness").WorkspacePanelDetail) => void;
  /** Start business strategy builder beside chat (Create flow). */
  onStartBusinessStrategy?: (typeLabel: string) => void;
  /** Start ADHD strategy apply coach beside chat. */
  onStartStrategyApply?: (strategyId: string) => void;
  onOpenActivity?: (activityId: string) => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** Parent-driven open (e.g. from chat: "open Start Ugly"). */
  openCommand?: {
    key: number;
    strategyId?: string;
    hubEntryId?: string;
    openView?: "home" | "adhd" | "business" | "saved" | "recommended";
  } | null;
  /** Active ADHD apply coach — shown on the matching strategy, not over the whole hub. */
  strategyApplySession?: StrategyApplySession | null;
  onDismissStrategyApply?: () => void;
  businessStrategySession?: BusinessStrategySession | null;
  businessStrategyDraft?: { typeLabel: string; draft: string } | null;
  onDismissBusinessBuild?: () => void;
  onTalkBusinessWithShari?: () => void;
}) {
  const [view, setView] = useState<View>({ v: "home" });
  const [search, setSearch] = useState("");
  const [hubOpen, setHubOpen] = useState<Record<string, boolean>>(() =>
    initialCollapsedSectionMap("adhd", "business", "recommended", "saved"),
  );
  const [adhdPick, setAdhdPick] = useState("");
  const [businessPick, setBusinessPick] = useState("");
  const [recPick, setRecPick] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newProblem, setNewProblem] = useState("");
  const [newSteps, setNewSteps] = useState("");
  const [openSubcat, setOpenSubcat] = useState<string | null>(null);
  const strategyReturnRef = useRef<View>({ v: "home" });
  const visualMode = useVisualMode();
  const colorOn = visualMode !== "off";
  const decorative = visualMode === "decorative";

  // Global Back steps inward-first: detail → parent list → home → exit.
  useEffect(() => {
    registerBack?.(() => {
      if (view.v === "strategy" || view.v === "userStrategy") {
        setView(strategyReturnRef.current);
        return true;
      }
      if (view.v === "group" || view.v === "recommended" || view.v === "saved" || view.v === "new" || view.v === "adhd" || view.v === "business") {
        setView({ v: "home" });
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [view, registerBack]);

  useEffect(() => {
    if (!onContextChange) return;
    if (view.v === "strategy") {
      const s = getStrategy(view.stratId);
      onContextChange({
        view: "strategy",
        stage: "detail",
        selectedItemId: view.stratId,
        selectedItemName: s?.title ?? null,
      });
      return;
    }
    if (view.v === "userStrategy") {
      const u = getUserStrategies().find((x) => x.id === view.id);
      onContextChange({
        view: "userStrategy",
        stage: "detail",
        selectedItemId: view.id,
        selectedItemName: u?.title ?? null,
      });
      return;
    }
    onContextChange({ view: view.v, stage: view.v });
  }, [view, onContextChange]);

  function accent(color: string) {
    return decorative ? (DECOR[color] ?? color) : color;
  }
  function tint(color: string) {
    const c = accent(color);
    return colorOn
      ? {
          borderLeftWidth: 5,
          borderLeftColor: c,
          ...(decorative ? { backgroundColor: `${c}14` } : {}),
        }
      : undefined;
  }

  function toggleHub(id: string) {
    setHubOpen((prev) => toggleSectionInMap(prev, id));
  }

  function openAdhdEntry(entry: AdhdStrategyHubEntry) {
    const route = entry.route;
    if (route.kind === "builtin") {
      goToView({ v: "strategy", stratId: route.strategyId });
      return;
    }
    if (route.kind === "activity") {
      onOpenActivity?.(route.activityId);
      return;
    }
    onOpen?.(route.section);
  }

  function goToView(next: View) {
    if (
      strategyApplySession &&
      (next.v !== "strategy" || next.stratId !== strategyApplySession.strategyId)
    ) {
      onDismissStrategyApply?.();
    }
    if (next.v === "strategy" || next.v === "userStrategy") {
      strategyReturnRef.current = view;
    }
    setView(next);
  }

  function returnFromStrategyDetail() {
    goToView(strategyReturnRef.current);
  }

  function strategyDetailBackLabel(from: View): string {
    switch (from.v) {
      case "home":
        return "Strategies";
      case "adhd":
        return STRATEGIES_HUB.adhd.title;
      case "business":
        return STRATEGIES_HUB.business.title;
      case "group": {
        const group = STRATEGY_GROUPS.find((g) => g.id === from.group);
        return group?.label ?? "Strategies";
      }
      case "recommended":
        return STRATEGIES_HUB.recommended.title;
      case "saved":
        return STRATEGIES_HUB.saved.title;
      default:
        return "Strategies";
    }
  }

  function openBusinessLibrary(subcatId?: string) {
    setOpenSubcat(subcatId ?? null);
    goToView({ v: "group", group: "business" });
  }

  const dockedPlan = (
    <BusinessStrategyDock
      session={businessStrategySession}
      draft={businessStrategyDraft}
      onTalkWithShari={onTalkBusinessWithShari}
      onDismiss={onDismissBusinessBuild}
    />
  );

  function startBusiness(typeLabel: string) {
    onStartBusinessStrategy?.(typeLabel);
    setBusinessPick("");
  }

  useEffect(() => {
    if (!openCommand?.key) return;
    if (openCommand.openView) {
      setView({ v: openCommand.openView });
      return;
    }
    if (openCommand.strategyId) {
      setAdhdPick(openCommand.strategyId);
      goToView({ v: "strategy", stratId: openCommand.strategyId });
      return;
    }
    if (openCommand.hubEntryId) {
      const entry = ADHD_STRATEGY_HUB.find((e) => e.id === openCommand.hubEntryId);
      if (entry) {
        setAdhdPick(entry.id);
        openAdhdEntry(entry);
      }
    }
  }, [openCommand?.key]);

  // ---- Home: ADHD / Business / Recommended / Saved -----------------------
  if (view.v === "home") {
    const q = search.trim();
    const adhdGroups = adhdStrategyDropdownGroups(q);
    const businessOptions = [...BUSINESS_STRATEGY_TEMPLATES].sort((a, b) =>
      compareDropdownLabels(a, b),
    );
    const recs = STRATEGIES.filter((s) => s.recommended)
      .slice(0, 8)
      .sort((a, b) => compareDropdownLabels(a.title, b.title));
    const saved = getUserStrategies();
    const savedCount = saved.length;

    return (
      <div className={workspacePanelShellClass({ width: "standard", inSplit: true })}>
        <WorkspaceAreaWorksGuide areaId="playbook" />
        {dockedPlan}
        <p className="text-2xl font-semibold text-[#1f1c19]">Strategies</p>
        <p className="mt-1 text-base text-[#6b635a]">
          Apply an ADHD technique now, or create a business strategy with Shari.
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search strategies…"
          className="mt-4 w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base outline-none focus:border-[#1e4f4f]"
        />

        <div className="mt-6 flex flex-col gap-3">
          <HubSection
            title={STRATEGIES_HUB.adhd.title}
            description={STRATEGIES_HUB.adhd.description}
            open={hubOpen.adhd}
            onToggle={() => toggleHub("adhd")}
          >
            <select
              value={adhdPick}
              onChange={(e) => {
                const id = e.target.value;
                setAdhdPick(id);
                const entry = ADHD_STRATEGY_HUB.find((x) => x.id === id);
                if (entry) openAdhdEntry(entry);
              }}
              className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              <option value="">Select an ADHD strategy…</option>
              {adhdGroups.map((group) => (
                <optgroup key={group.category} label={group.category}>
                  {group.options.map((opt) => (
                    <option key={opt.hubId} value={opt.hubId}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setOpenSubcat(null);
                goToView({ v: "group", group: "personal" });
              }}
              className="mt-3 text-sm font-semibold text-[#1e4f4f]"
            >
              Browse all ADHD strategies by topic →
            </button>
          </HubSection>

          <HubSection
            title={STRATEGIES_HUB.business.title}
            description={STRATEGIES_HUB.business.description}
            open={hubOpen.business}
            onToggle={() => toggleHub("business")}
          >
            <p className="text-sm font-semibold text-[#1f1c19]">
              Coaching library ({businessBuiltinStrategyCount()} strategies)
            </p>
            <p className="mt-0.5 text-sm text-[#6b635a]">
              Proven moves for marketing, sales, content, pricing, and more —
              pick a category, then a strategy.
            </p>
            <div className="mt-3">
              <CoachingLibraryPicker
                variant="hub"
                onOpenStrategy={(id) => goToView({ v: "strategy", stratId: id })}
                onApplyWithShari={(id) => onStartStrategyApply?.(id)}
              />
            </div>
            <button
              type="button"
              onClick={() => openBusinessLibrary()}
              className="mt-3 text-sm font-semibold text-[#1e4f4f]"
            >
              Browse all business strategies by topic →
            </button>

            <p className="mt-5 text-sm font-semibold text-[#1f1c19]">
              Build a custom plan with Shari
            </p>
            <p className="mt-0.5 text-sm text-[#6b635a]">
              For a full marketing plan, 8-week roadmap, etc. — chat builds it
              while you keep the library here.
            </p>
            <select
              value={businessPick}
              onChange={(e) => {
                const v = e.target.value;
                setBusinessPick(v);
                if (v) startBusiness(v);
              }}
              className="mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              <option value="">Select a plan type to build…</option>
              {businessOptions.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => startBusiness("Other Strategy")}
              className="mt-3 w-full rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
            >
              Create New Strategy
            </button>
          </HubSection>

          <HubSection
            title={STRATEGIES_HUB.recommended.title}
            description={STRATEGIES_HUB.recommended.description}
            open={hubOpen.recommended}
            onToggle={() => toggleHub("recommended")}
          >
            <select
              value={recPick}
              onChange={(e) => {
                const id = e.target.value;
                setRecPick(id);
                if (id) goToView({ v: "strategy", stratId: id });
              }}
              className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            >
              <option value="">Select a recommendation…</option>
              {recs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </HubSection>

          <HubSection
            title={STRATEGIES_HUB.saved.title}
            description={STRATEGIES_HUB.saved.description}
            open={hubOpen.saved}
            onToggle={() => toggleHub("saved")}
          >
            {savedCount === 0 ? (
              <p className="text-sm text-[#6b635a]">
                Nothing saved yet — create a business strategy or save one you build.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {[...saved]
                  .sort((a, b) => compareDropdownLabels(a.title, b.title))
                  .slice(0, 6)
                  .map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => goToView({ v: "userStrategy", id: u.id })}
                        className="w-full rounded-xl border border-[#d4cdc3] bg-white/90 px-3 py-2.5 text-left text-sm font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40"
                      >
                        {u.title}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
            {savedCount > 0 ? (
              <button
                type="button"
                onClick={() => setView({ v: "saved" })}
                className="mt-2 text-sm font-semibold text-[#1e4f4f]"
              >
                View all saved ({savedCount}) →
              </button>
            ) : null}
          </HubSection>
        </div>
      </div>
    );
  }

  // ---- ADHD browse (full library) ----------------------------------------
  if (view.v === "adhd") {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
          {STRATEGIES_HUB.adhd.title}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          {STRATEGIES_HUB.adhd.description}
        </p>
        <select
          value={adhdPick}
          onChange={(e) => {
            const id = e.target.value;
            setAdhdPick(id);
            const entry = ADHD_STRATEGY_HUB.find((x) => x.id === id);
            if (entry) openAdhdEntry(entry);
          }}
          className="mt-4 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium outline-none focus:border-[#1e4f4f]"
        >
          <option value="">Select…</option>
          {ADHD_STRATEGY_HUB.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setOpenSubcat(null);
            setView({ v: "group", group: "personal" });
          }}
          className="mt-4 text-sm font-semibold text-[#1e4f4f]"
        >
          Browse coaching library by topic →
        </button>
      </div>
    );
  }

  // ---- Business browse ---------------------------------------------------
  if (view.v === "business") {
    const templates = [...BUSINESS_STRATEGY_TEMPLATES].sort((a, b) =>
      compareDropdownLabels(a, b),
    );
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
          {STRATEGIES_HUB.business.title}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          {STRATEGIES_HUB.business.description}
        </p>

        <p className="mt-5 text-sm font-semibold text-[#1f1c19]">
          Coaching strategies
        </p>
        <div className="mt-2">
          <CoachingLibraryPicker
            variant="page"
            onOpenStrategy={(id) => goToView({ v: "strategy", stratId: id })}
            onApplyWithShari={(id) => onStartStrategyApply?.(id)}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setOpenSubcat(null);
            goToView({ v: "group", group: "business" });
          }}
          className="mt-3 text-sm font-semibold text-[#1e4f4f]"
        >
          Browse all business strategies by topic →
        </button>

        <p className="mt-6 text-sm font-semibold text-[#1f1c19]">
          Build a custom plan with Shari
        </p>
        <select
          value={businessPick}
          onChange={(e) => {
            const v = e.target.value;
            setBusinessPick(v);
            if (v) startBusiness(v);
          }}
          className="mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium outline-none focus:border-[#1e4f4f]"
        >
          <option value="">Select a plan type…</option>
          {templates.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => startBusiness("Other Strategy")}
          className="mt-4 w-full rounded-xl bg-[#1e4f4f] px-5 py-3 text-sm font-semibold text-white"
        >
          Create New Strategy
        </button>
      </div>
    );
  }

  // ---- Group: expandable accordion of subcategories ----------------------
  if (view.v === "group") {
    const group = STRATEGY_GROUPS.find((g) => g.id === view.group)!;
    const subcats = categoriesForGroup(view.group);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        {dockedPlan}
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#1f1c19]">
          <span aria-hidden="true">{group.emoji}</span>
          {group.label}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          {view.group === "personal"
            ? "What feels most true right now?"
            : "What part of the business needs attention?"}
        </p>

        {/* Select an area — calmer than a wall of cards */}
        <select
          value={openSubcat ?? ""}
          onChange={(e) => setOpenSubcat(e.target.value || null)}
          className="mt-3 w-full max-w-sm rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          <option value="">Select an area…</option>
          {subcats.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label}
              </option>
            ))}
        </select>

        {/* Strategies for the chosen area */}
        {(() => {
          const cat = openSubcat ? getCategory(openSubcat) : null;
          if (!cat) {
            return (
              <p className="mt-6 text-base text-[#9a8f82]">
                Choose an area above to see the strategies inside.
              </p>
            );
          }
          const builtins = strategiesFor(cat.id).sort((a, b) =>
            compareDropdownLabels(a.title, b.title),
          );
          const mine = userStrategiesFor(cat.id).sort((a, b) =>
            compareDropdownLabels(a.title, b.title),
          );
          if (builtins.length + mine.length === 0) {
            return (
              <p className="mt-6 text-base text-[#9a8f82]">
                No strategies are listed here yet — check another area or save your
                own from New strategy.
              </p>
            );
          }
          return (
            <ul className="mt-5 flex flex-col gap-3">
              {builtins.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goToView({ v: "strategy", stratId: s.id })}
                    style={tint(cat.color)}
                    className="w-full rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
                  >
                    <span className="block text-base font-semibold text-[#1f1c19]">
                      {s.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {s.whenToUse}
                    </span>
                  </button>
                </li>
              ))}
              {mine.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => goToView({ v: "userStrategy", id: u.id })}
                    style={tint(cat.color)}
                    className="w-full rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
                  >
                    <span className="block text-base font-semibold text-[#1f1c19]">
                      {u.title}
                      <span className="ml-1 rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e4f4f]">
                        Yours
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {u.whenToUse}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>
    );
  }

  // ---- Recommended for you (curated now; personalized later) -------------
  if (view.v === "recommended") {
    const recs = STRATEGIES.filter((s) => s.recommended).slice(0, 8);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
          ✨ Recommended for you
        </p>
        <p className="mt-1 text-base text-[#6b635a]">
          Solid places to start. As I learn what works for you, this will get
          more personal.
        </p>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value)
              goToView({ v: "strategy", stratId: e.target.value });
          }}
          className="mt-5 w-full max-w-sm rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          <option value="">Select a strategy…</option>
          {[...recs]
            .sort((a, b) => compareDropdownLabels(a.title, b.title))
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
        </select>
      </div>
    );
  }

  // ---- My saved strategies ------------------------------------------------
  if (view.v === "saved") {
    const mine = getUserStrategies();
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">
          📌 Saved Strategies
        </p>
        {mine.length === 0 ? (
          <p className="mt-4 text-base text-[#6b635a]">
            Nothing saved yet. When a routine keeps working for you, you&apos;ll
            be able to save it here as your own — and I&apos;ll file it in the
            right place automatically.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {mine.map((u) => {
              const cat = getCategory(u.category);
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => goToView({ v: "userStrategy", id: u.id })}
                    style={tint(cat?.color ?? "#1e4f4f")}
                    className="w-full rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 text-left transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
                  >
                    <span className="block text-base font-semibold text-[#1f1c19]">
                      {u.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#6b635a]">
                      {cat ? cat.label : u.category}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // ---- New user strategy --------------------------------------------------
  if (view.v === "new") {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => setView({ v: "home" })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Strategies
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">New strategy</p>
        <p className="mt-1 text-sm text-[#6b635a]">
          Something you&apos;ve noticed helps — save it for next time.
        </p>
        <VoiceAnswerField
          value={newTitle}
          onChange={setNewTitle}
          multiline={false}
          placeholder="Strategy name"
          className="mt-4"
        />
        <VoiceAnswerField
          value={newProblem}
          onChange={setNewProblem}
          placeholder="What problem does this help with?"
          className="mt-2"
          inputClassName="min-h-[80px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
        />
        <VoiceAnswerField
          value={newSteps}
          onChange={setNewSteps}
          placeholder="Steps (one per line)"
          className="mt-2"
          inputClassName="min-h-[100px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
        />
        <button
          type="button"
          disabled={!newTitle.trim()}
          onClick={() => {
            const steps = newSteps
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            const { type, category } = suggestCategory(
              newTitle,
              newProblem,
            );
            saveUserStrategy({
              title: newTitle.trim(),
              type,
              category,
              source: "user_generated",
              description: newProblem.trim() || newTitle.trim(),
              whenToUse: "When this pattern shows up for you.",
              steps: steps.length ? steps : ["Try it once and notice what helps."],
              whyItWorks: "You built this from what actually works for you.",
            });
            setNewTitle("");
            setNewProblem("");
            setNewSteps("");
            setView({ v: "saved" });
          }}
          className="mt-4 rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Save strategy
        </button>
      </div>
    );
  }

  // ---- User strategy detail (saved / companion-suggested) ----------------
  if (view.v === "userStrategy") {
    const u: UserStrategy | undefined = getUserStrategies().find(
      (x) => x.id === view.id,
    );
    if (!u) {
      setView({ v: "saved" });
      return null;
    }
    const ucat = getCategory(u.category);
    const ucolor = accent(ucat?.color ?? "#1e4f4f");
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <button
          type="button"
          onClick={returnFromStrategyDetail}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Back to {strategyDetailBackLabel(strategyReturnRef.current)}
        </button>
        <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{u.title}</p>
        <p className="mt-1 text-sm italic text-[#9a8f82]">{u.whenToUse}</p>

        <LessonHeading color={ucolor}>What is it?</LessonHeading>
        <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">
          {u.description || u.steps[0]}
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {u.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: ucolor }}
              >
                {i + 1}
              </span>
              <span className="text-base leading-relaxed text-[#1f1c19]">{step}</span>
            </li>
          ))}
        </ol>

        <LessonHeading color={ucolor}>Why it helps</LessonHeading>
        <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
          {u.whyItWorks}
        </p>

        <LessonHeading color={ucolor}>When to use it</LessonHeading>
        <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">{u.whenToUse}</p>
        {u.example ? (
          <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-[#6b635a]">
            {u.example}
          </p>
        ) : null}

        <StrategyUseNow
          key={u.id}
          strategyTitle={u.title}
          categoryId={u.category}
          onOpen={onOpen}
          onAsk={onAsk}
        />
      </div>
    );
  }

  // ---- Strategy detail ----------------------------------------------------
  const s: Strategy | undefined = getStrategy(view.stratId);
  if (!s) {
    goToView({ v: "home" });
    return null;
  }
  if (
    strategyApplySession &&
    strategyApplySession.strategyId === s.id
  ) {
    return (
      <StrategyApplyPanel
        session={strategyApplySession}
        onBack={onDismissStrategyApply}
      />
    );
  }
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="px-6 pt-6">{dockedPlan}</div>
      <StrategyBuiltinDetail
        s={s}
        accent={accent}
        onOpen={onOpen}
        onAsk={onAsk}
        onStartStrategyApply={onStartStrategyApply}
        onBack={returnFromStrategyDetail}
        backLabel={strategyDetailBackLabel(strategyReturnRef.current)}
        onSaved={() => setView({ v: "saved" })}
      />
    </div>
  );
}

function StrategyBuiltinDetail({
  s,
  accent,
  onOpen,
  onAsk,
  onStartStrategyApply,
  onBack,
  backLabel,
  onSaved,
}: {
  s: Strategy;
  accent: (color: string) => string;
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  onStartStrategyApply?: (strategyId: string) => void;
  onBack: () => void;
  backLabel: string;
  onSaved: () => void;
}) {
  const cat = getCategory(resolveSubcat(s));
  const subcat = resolveSubcat(s);
  const accentColor = accent(cat?.color ?? "#1e4f4f");
  const closingReflection = useMemo(
    () => pickStrategyReflection(subcat, s),
    [subcat, s],
  );
  const relatedTools = useMemo(
    () => relatedCompanionTools(s, subcat),
    [s, subcat],
  );

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-semibold text-[#1e4f4f]"
      >
        ‹ Back to {backLabel}
      </button>

      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{s.title}</p>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#6b635a]">
        <span>⏱ About {timeForStrategy(s)} minutes</span>
      </div>

      {warmthFor(subcat) ? (
        <p className="mt-3 text-base italic text-[#1e4f4f]">{warmthFor(subcat)}</p>
      ) : null}

      <LessonHeading color={accentColor}>What problem it solves</LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {s.problem}
      </p>

      <LessonHeading color={accentColor}>Why it works</LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {s.whyWorks}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#6b635a]">
        {s.whyBrain}
      </p>

      <LessonHeading color={accentColor}>When to use it</LessonHeading>
      <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">{s.whenToUse}</p>

      <LessonHeading color={accentColor}>How to use it</LessonHeading>
      <ol className="mt-2 flex flex-col gap-2">
        {s.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: accentColor }}
            >
              {i + 1}
            </span>
            <span className="text-base leading-relaxed text-[#1f1c19]">{step}</span>
          </li>
        ))}
      </ol>

      <LessonHeading color={accentColor}>Real-life example</LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#6b635a]">
        {s.example}
      </p>

      <LessonHeading color={accentColor}>Try it right now</LessonHeading>
      <div
        className="mt-2 rounded-xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.04] p-4"
        style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
      >
        <p className="text-sm font-medium text-[#1f1c19]">
          Start with step 1: {s.steps[0]}
        </p>
      </div>

      <StrategyUseNow
        key={s.id}
        strategyTitle={s.title}
        strategyId={s.id}
        categoryId={subcat}
        onOpen={onOpen}
        onAsk={onAsk}
        onStartStrategyApply={onStartStrategyApply}
      />

      {relatedTools.length > 0 ? (
        <>
          <LessonHeading color={accentColor}>Related Companion tools</LessonHeading>
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedTools.map((tool) => (
              <button
                key={tool.section}
                type="button"
                onClick={() => onOpen?.(tool.section)}
                disabled={!onOpen}
                className="rounded-full border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06] disabled:opacity-40"
              >
                {tool.emoji} {tool.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        <button
          type="button"
          onClick={() => {
            saveUserStrategy({
              title: s.title,
              type: groupForStrategy(s),
              category: subcat,
              source: "user_generated",
              description: s.problem,
              whenToUse: s.whenToUse,
              steps: s.steps,
              whyItWorks: s.whyWorks,
              example: s.example,
              reflections: s.reflections,
            });
            onSaved();
          }}
          className="text-[#1e4f4f] underline decoration-[#1e4f4f]/30 underline-offset-2"
        >
          Save as my strategy
        </button>
        <button
          type="button"
          onClick={() => {
            saveProject({
              name: s.title,
              goal: s.problem,
              nextAction: s.steps[0] ?? "",
              horizon: "now",
              status: "in-progress",
            });
            onOpen?.("projects");
          }}
          className="text-[#6b635a] underline decoration-[#9a8f82]/40 underline-offset-2"
        >
          Attach to a project
        </button>
      </div>

      {s.deeper ? (
        <details className="mt-6 rounded-2xl border border-[#1e4f4f]/15 bg-white/60 px-4 py-3">
          <summary className="cursor-pointer text-base font-semibold text-[#1e4f4f]">
            Want to understand this deeper?
          </summary>
          <p className="mt-2 whitespace-pre-line pb-2 text-base leading-relaxed text-[#2d2926]">
            {s.deeper}
          </p>
        </details>
      ) : null}

      <p className="mt-8 text-center text-sm italic text-[#9a8f82]">
        {closingReflection}
      </p>
    </div>
  );
}

function HubSection({
  title,
  description,
  open,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/85 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-base font-semibold text-[#1f1c19]">
            {open ? "▼" : "▶"} {title}
          </span>
          <span className="mt-0.5 block text-sm text-[#6b635a]">{description}</span>
        </span>
      </button>
      {open ? <div className="border-t border-[#e7dfd4] px-4 pb-4 pt-3">{children}</div> : null}
    </div>
  );
}

function LessonHeading({
  color,
  children,
}: {
  color: string;
  children: string;
}) {
  return (
    <h3
      className="mt-6 text-base font-semibold"
      style={{ color }}
    >
      {children}
    </h3>
  );
}

const TOOL_LABELS: Partial<Record<AppSection, { label: string; emoji: string }>> = {
  "brain-dump": { label: "Clear My Mind", emoji: "🧠" },
  "focus-timer": { label: "Focus Session", emoji: "🎯" },
  breathe: { label: "Breathe & Reset", emoji: "🌿" },
  energy: { label: "How Are You Feeling Today?", emoji: "💬" },
  projects: { label: "Projects", emoji: "📁" },
  "spin-wheel": { label: "Spin the Wheel", emoji: "🎡" },
  "time-block": { label: "Time Block", emoji: "📅" },
  "content-generator": { label: "Create", emoji: "✨" },
  "email-generator": { label: "Email Generator", emoji: "✉️" },
  snippets: { label: "Snippets", emoji: "📋" },
  "templates-library": { label: "Templates", emoji: "📄" },
  home: { label: "Chat with Shari", emoji: "💬" },
};

function relatedCompanionTools(s: Strategy, subcatId: string) {
  const fromText = appReferences(
    s.problem,
    s.whyWorks,
    s.whyBrain,
    s.example,
    s.deeper,
    s.steps.join("\n"),
  );
  const seen = new Set(fromText.map((r) => r.section));
  const merged = [...fromText];
  for (const section of CATEGORY_COMPANION_TOOLS[subcatId] ?? []) {
    if (seen.has(section)) continue;
    const meta = TOOL_LABELS[section];
    if (meta) {
      merged.push({ section, label: meta.label, emoji: meta.emoji });
      seen.add(section);
    }
  }
  return merged.sort((a, b) => compareDropdownLabels(a.label, b.label));
}
