"use client";

import { useEffect, useState } from "react";
import {
  STRATEGIES,
  STRATEGY_GROUPS,
  categoriesForGroup,
  getCategory,
  getStrategy,
  groupForStrategy,
  recommendedActionFor,
  resolveSubcat,
  strategiesFor,
  timeForStrategy,
  warmthFor,
  type Strategy,
  type StrategyActionId,
  type StrategyGroupId,
} from "@/lib/strategySystem";
import {
  getUserStrategies,
  userStrategiesFor,
  type UserStrategy,
} from "@/lib/userStrategies";
import { appReferences } from "@/lib/appReferences";
import { getPrefs, saveProject } from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";

type View =
  | { v: "home" }
  | { v: "group"; group: StrategyGroupId }
  | { v: "recommended" }
  | { v: "saved" }
  | { v: "strategy"; stratId: string }
  | { v: "userStrategy"; id: string };

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
  const [openSubcat, setOpenSubcat] = useState<string | null>(null);
  const [deepOpen, setDeepOpen] = useState(false);
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
      if (view.v === "group" || view.v === "recommended" || view.v === "saved") {
        setView({ v: "home" });
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [view, registerBack]);

  // Collapse the "deeper" section whenever we land on a new strategy.
  const stratId = view.v === "strategy" ? view.stratId : null;
  useEffect(() => {
    setDeepOpen(false);
  }, [stratId]);

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
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
        <p className="text-2xl font-semibold text-[#1f1c19]">Strategies</p>
        <p className="mt-1 text-base text-[#6b635a]">
          Coaching for your brain and your business. Pick a place to start.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {rows.map((r) => (
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

        <LessonHeading color={ucolor}>What this helps with</LessonHeading>
        <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
          {u.description}
        </p>

        <LessonHeading color={ucolor}>Why it works</LessonHeading>
        <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
          {u.whyItWorks}
        </p>

        {u.example && (
          <>
            <LessonHeading color={ucolor}>For example</LessonHeading>
            <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
              {u.example}
            </p>
          </>
        )}

        <LessonHeading color={ucolor}>Try it right now</LessonHeading>
        <ol className="mt-2 flex flex-col gap-2">
          {u.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: ucolor }}
              >
                {i + 1}
              </span>
              <span className="text-base leading-relaxed text-[#1f1c19]">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpen?.("focus-timer")}
            className="rounded-xl bg-[#1e4f4f] px-6 py-3 text-base font-semibold text-white hover:bg-[#163a3a]"
          >
            ▶ Start now
          </button>
          <button
            type="button"
            onClick={() => onOpen?.("time-block")}
            className="rounded-xl border border-[#1e4f4f]/40 bg-white px-5 py-3 text-base font-semibold text-[#1e4f4f]"
          >
            ⏱ Time block
          </button>
        </div>
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
  // Highlight the action that best matches this strategy (Talk needs onAsk).
  const recAction: StrategyActionId = (() => {
    const r = recommendedActionFor(s);
    return r === "talk" && !onAsk ? "start" : r;
  })();
  // In-app features this strategy's content refers to → offer a door to each.
  const refs = appReferences(
    s.problem,
    s.whyBrain,
    s.whyWorks,
    s.example,
    s.deeper,
    s.steps.join(" "),
  );

  // Action menu — one recommended action up top, the rest tucked in a dropdown.
  const actions: { id: StrategyActionId; label: string; help: string; run: () => void }[] = [
    {
      id: "start",
      label: "▶ Start now",
      help: "Apply this strategy immediately.",
      run: () => onOpen?.("focus-timer"),
    },
    {
      id: "timeblock",
      label: "⏱ Time block",
      help: "Schedule time to try this later.",
      run: () => onOpen?.("time-block"),
    },
    ...(onAsk
      ? [
          {
            id: "talk" as StrategyActionId,
            label: "💬 Talk it through",
            help: "Have Shari help you apply it to your situation.",
            run: () => onAsk(applyPrompt(s)),
          },
        ]
      : []),
    {
      id: "save",
      label: "📁 Save to project",
      help: "Keep this strategy with a project for future reference.",
      run: () => {
        saveProject({
          name: s.title,
          goal: s.problem,
          nextAction: s.steps[0] ?? "",
          horizon: "now",
          status: "in-progress",
        });
        onOpen?.("projects");
      },
    },
  ];
  const recItem = actions.find((a) => a.id === recAction) ?? actions[0]!;
  const otherItems = actions.filter((a) => a.id !== recItem.id);

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

      {/* Instant context chips — time + best-for, before any reading */}
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#6b635a]">
        <span>⏱ Takes about {timeForStrategy(s)} minutes</span>
        <span>
          🎯 Best{" "}
          {/^when\b/i.test(s.whenToUse)
            ? s.whenToUse.charAt(0).toLowerCase() + s.whenToUse.slice(1)
            : `for ${s.whenToUse}`}
        </span>
      </div>

      {/* Companion warmth — one human line before the lesson */}
      {warmthFor(resolveSubcat(s)) && (
        <p className="mt-3 text-base italic text-[#1e4f4f]">
          {warmthFor(resolveSubcat(s))}
        </p>
      )}

      {/* 2. The problem */}
      <LessonHeading color={accent(cat?.color ?? "#1e4f4f")}>
        The problem
      </LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {s.problem}
      </p>

      {/* 3. Why ADHD brains do this */}
      <LessonHeading color={accent(cat?.color ?? "#1e4f4f")}>
        Why ADHD brains do this
      </LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {s.whyBrain}
      </p>

      {/* 4. Why this works */}
      <LessonHeading color={accent(cat?.color ?? "#1e4f4f")}>
        Why this works
      </LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {s.whyWorks}
      </p>

      {/* 5. Example */}
      <LessonHeading color={accent(cat?.color ?? "#1e4f4f")}>
        For example
      </LessonHeading>
      <p className="mt-1.5 whitespace-pre-line text-base leading-relaxed text-[#2d2926]">
        {s.example}
      </p>

      {/* 6. Try it right now */}
      <LessonHeading color={accent(cat?.color ?? "#1e4f4f")}>
        Try it right now
      </LessonHeading>
      <ol className="mt-2 flex flex-col gap-2">
        {s.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: accent(cat?.color ?? "#1e4f4f") }}
            >
              {i + 1}
            </span>
            <span className="text-base leading-relaxed text-[#1f1c19]">
              {step}
            </span>
          </li>
        ))}
      </ol>

      {/* Execution layer — ACTION comes before extra theory. Softer divider +
          extra breathing room so it doesn't read like one dense document. */}
      <div className="mt-9 border-t border-[#1e4f4f]/10 pt-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          Put this strategy into action
        </p>
        <p className="mt-1 text-sm text-[#6b635a]">
          You don&apos;t need to remember this strategy. Choose one way to use it.
        </p>
        {/* One recommended action up top; everything else in a clean dropdown. */}
        <div className="mt-3 flex flex-col gap-2">
          <ActionRow
            recommended
            label={recItem.label}
            help={recItem.help}
            onClick={recItem.run}
          />
          <select
            value=""
            onChange={(e) => {
              const a = actions.find((x) => x.id === e.target.value);
              if (a) a.run();
            }}
            className="w-full rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-3 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          >
            <option value="">Another way to use this…</option>
            {otherItems.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} — {a.help}
              </option>
            ))}
            <option value="" disabled>
              🧠 Save as my strategy — coming soon
            </option>
          </select>
        </div>
      </div>

      {/* Optional deeper learning — now BELOW the action area. Most people want
          to act or leave, not read another paragraph first. */}
      {s.deeper && (
        <div className="mt-6 rounded-2xl border border-[#1e4f4f]/15 bg-white/60">
          <button
            type="button"
            onClick={() => setDeepOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-base font-semibold text-[#1e4f4f]">
              Want to understand this deeper?
            </span>
            <span className="text-[#9a8f82]">{deepOpen ? "▲" : "▼"}</span>
          </button>
          {deepOpen && (
            <p className="whitespace-pre-line px-4 pb-4 text-base leading-relaxed text-[#2d2926]">
              {s.deeper}
            </p>
          )}
        </div>
      )}

      {/* If the strategy mentions a feature we already have, offer the door. */}
      {refs.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[#1e4f4f]/15 bg-[#1e4f4f]/[0.04] p-4">
          <p className="text-sm font-semibold text-[#2d2926]">
            💡 You can do this right here in the app:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {refs.map((r) => (
              <button
                key={r.section}
                type="button"
                onClick={() => onOpen?.(r.section)}
                className="rounded-full border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-medium text-[#4b463f] transition-colors hover:border-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
              >
                {r.emoji} Open {r.label} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gentle companion-style closing — so the page doesn't just stop. */}
      <p className="mt-8 text-center text-sm italic text-[#9a8f82]">
        One strategy used today is worth more than ten remembered tomorrow.
      </p>
    </div>
  );
}

function ActionRow({
  label,
  help,
  onClick,
  recommended,
  disabled,
}: {
  label: string;
  help: string;
  onClick?: () => void;
  recommended?: boolean;
  disabled?: boolean;
}) {
  const filled = recommended && !disabled;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
        disabled
          ? "cursor-default border-dashed border-[#d4cdc3] bg-white/50 opacity-70"
          : filled
            ? "border-[#1e4f4f] bg-[#1e4f4f] hover:bg-[#163a3a]"
            : "border-[#1e4f4f]/30 bg-white hover:border-[#1e4f4f]/60"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`text-base font-semibold ${
            filled ? "text-white" : "text-[#1f1c19]"
          }`}
        >
          {label}
        </span>
        {filled && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
            Recommended
          </span>
        )}
      </span>
      <span
        className={`mt-0.5 block text-sm ${filled ? "text-white/85" : "text-[#6b635a]"}`}
      >
        {help}
      </span>
    </button>
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
