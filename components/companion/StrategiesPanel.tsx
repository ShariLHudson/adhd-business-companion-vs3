"use client";

import { useEffect, useState } from "react";
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
  getUserStrategies,
  saveUserStrategy,
  suggestCategory,
  userStrategiesFor,
  type UserStrategy,
} from "@/lib/userStrategies";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";
import { StrategyUseNow } from "@/components/companion/StrategyUseNow";
import { getPrefs, saveProject } from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";

type View =
  | { v: "home" }
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

// Apply Mode — turns a strategy into a guided, step-by-step coaching prompt so
// Shari walks the user through THEIR situation instead of repeating the lesson.
function applyPrompt(s: Strategy): string {
  const questions =
    s.coach && s.coach.length
      ? s.coach
      : s.steps.map((step) => `Help me with this part: ${step}`);
  return [
    `I want to actually apply the "${s.title}" strategy to my real situation right now — please coach me through it, don't just explain it again.`,
    `Ask me these one at a time, waiting for my answer before moving to the next. Keep each question short and warm:`,
    questions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
    `After the last one, give me a short encouraging close and offer to start a Focus Session or Time Block. Begin now with just the first question — nothing else.`,
  ].join("\n\n");
}

// Category → Strategy → Action. ADHD-friendly: never more than 3 meaningful
// choices on screen. Categories are navigation; strategies are action-first.
export function StrategiesPanel({
  onOpen,
  onAsk,
  registerBack,
}: {
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [view, setView] = useState<View>({ v: "home" });
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newProblem, setNewProblem] = useState("");
  const [newSteps, setNewSteps] = useState("");
  const [openSubcat, setOpenSubcat] = useState<string | null>(null);
  const visualMode = getPrefs().visualMode;
  const colorOn = visualMode !== "off";
  const decorative = visualMode === "decorative";

  // Global Back steps inward-first: detail → group → home → exit.
  useEffect(() => {
    registerBack?.(() => {
      if (view.v === "strategy") {
        const s = getStrategy(view.stratId);
        setView(s ? { v: "group", group: groupForStrategy(s) } : { v: "home" });
        return true;
      }
      if (view.v === "userStrategy") {
        const u = getUserStrategies().find((x) => x.id === view.id);
        setView(u ? { v: "group", group: u.type } : { v: "saved" });
        return true;
      }
      if (view.v === "group" || view.v === "recommended" || view.v === "saved" || view.v === "new") {
        setView({ v: "home" });
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [view, registerBack]);

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

  // ---- Home: Recommended / Personal / Business / Saved -------------------
  if (view.v === "home") {
    const savedCount = getUserStrategies().length;
    const rows: { emoji: string; label: string; blurb: string; go: () => void }[] = [
      {
        emoji: "➕",
        label: "New strategy",
        blurb: "Create your own — something that works for you.",
        go: () => setView({ v: "new" }),
      },
      {
        emoji: "✨",
        label: "Recommended for you",
        blurb: "Solid starting points — more personal over time.",
        go: () => setView({ v: "recommended" }),
      },
      {
        emoji: "🌱",
        label: "Personal & ADHD",
        blurb: "How you work with your own brain.",
        go: () => {
          setOpenSubcat(null);
          setView({ v: "group", group: "personal" });
        },
      },
      {
        emoji: "💼",
        label: "Business",
        blurb: "Growing and running the work.",
        go: () => {
          setOpenSubcat(null);
          setView({ v: "group", group: "business" });
        },
      },
      {
        emoji: "📌",
        label: "My saved strategies",
        blurb: savedCount ? `${savedCount} saved` : "Strategies you save live here.",
        go: () => setView({ v: "saved" }),
      },
    ];
    const q = search.trim().toLowerCase();
    const filtered = q
      ? rows.filter(
          (r) =>
            r.label.toLowerCase().includes(q) ||
            r.blurb.toLowerCase().includes(q),
        )
      : rows;
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
        <WorkspaceGuide section="playbook" />
        <p className="text-2xl font-semibold text-[#1f1c19]">Strategies</p>
        <p className="mt-1 text-base text-[#6b635a]">
          Short playbooks for your brain and business. Search, then pick one.
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search strategies…"
          className="mt-4 w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base outline-none focus:border-[#1e4f4f]"
        />
        <div className="mt-6 flex flex-col gap-3">
          {filtered.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={r.go}
              className="flex items-start gap-3 rounded-2xl border border-[#1e4f4f]/20 bg-white/85 p-4 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/45 hover:bg-white"
            >
              <span aria-hidden="true" className="text-2xl">
                {r.emoji}
              </span>
              <span>
                <span className="block text-base font-semibold text-[#1f1c19]">
                  {r.label}
                </span>
                <span className="mt-0.5 block text-sm text-[#6b635a]">
                  {r.blurb}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Group: expandable accordion of subcategories ----------------------
  if (view.v === "group") {
    const group = STRATEGY_GROUPS.find((g) => g.id === view.group)!;
    const subcats = categoriesForGroup(view.group);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
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
          {[...subcats]
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((cat) => (
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
          const builtins = strategiesFor(cat.id);
          const mine = userStrategiesFor(cat.id);
          if (builtins.length + mine.length === 0) {
            return (
              <p className="mt-6 text-base text-[#9a8f82]">
                More strategies coming to {cat.label} soon.
              </p>
            );
          }
          return (
            <ul className="mt-5 flex flex-col gap-3">
              {builtins.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setView({ v: "strategy", stratId: s.id })}
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
                    onClick={() => setView({ v: "userStrategy", id: u.id })}
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
              setView({ v: "strategy", stratId: e.target.value });
          }}
          className="mt-5 w-full max-w-sm rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        >
          <option value="">Select a strategy…</option>
          {[...recs]
            .sort((a, b) => a.title.localeCompare(b.title))
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
          📌 My saved strategies
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
                    onClick={() => setView({ v: "userStrategy", id: u.id })}
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
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Strategy name"
          className="mt-4 w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
        />
        <textarea
          value={newProblem}
          onChange={(e) => setNewProblem(e.target.value)}
          placeholder="What problem does this help with?"
          className="mt-2 min-h-[80px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
        />
        <textarea
          value={newSteps}
          onChange={(e) => setNewSteps(e.target.value)}
          placeholder="Steps (one per line)"
          className="mt-2 min-h-[100px] w-full rounded-lg border border-[#c9bfb0] px-3 py-2.5 text-base"
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
          onClick={() => setView({ v: "group", group: u.type })}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ {ucat?.label ?? "Back"}
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
    setView({ v: "home" });
    return null;
  }
  const cat = getCategory(resolveSubcat(s));
  const subcat = resolveSubcat(s);
  const accentColor = accent(cat?.color ?? "#1e4f4f");

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <button
        type="button"
        onClick={() => setView({ v: "group", group: groupForStrategy(s) })}
        className="self-start text-sm font-semibold text-[#1e4f4f]"
      >
        ‹ {cat?.label ?? "Back"}
      </button>

      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{s.title}</p>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#6b635a]">
        <span>⏱ About {timeForStrategy(s)} minutes</span>
      </div>

      {warmthFor(subcat) && (
        <p className="mt-3 text-base italic text-[#1e4f4f]">{warmthFor(subcat)}</p>
      )}

      <LessonHeading color={accentColor}>What is it?</LessonHeading>
      <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">
        {s.whyWorks.split("\n")[0]}
      </p>
      <ol className="mt-3 flex flex-col gap-2">
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

      <LessonHeading color={accentColor}>Why it helps</LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {s.whyBrain}
      </p>
      <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {s.whyWorks}
      </p>

      <LessonHeading color={accentColor}>When to use it</LessonHeading>
      <p className="mt-1.5 text-base leading-relaxed text-[#2d2926]">{s.whenToUse}</p>
      <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-[#6b635a]">
        {s.example}
      </p>

      <StrategyUseNow
        key={s.id}
        strategyTitle={s.title}
        strategyId={s.id}
        categoryId={subcat}
        onOpen={onOpen}
        onAsk={onAsk}
      />

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
            });
            setView({ v: "saved" });
          }}
          className="text-[#1e4f4f] underline decoration-[#1e4f4f]/30 underline-offset-2"
        >
          Save as my strategy
        </button>
        {onAsk ? (
          <button
            type="button"
            onClick={() => onAsk(applyPrompt(s))}
            className="text-[#1e4f4f] underline decoration-[#1e4f4f]/30 underline-offset-2"
          >
            Coach me through this with Shari
          </button>
        ) : null}
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
        One strategy used today is worth more than ten remembered tomorrow.
      </p>
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
