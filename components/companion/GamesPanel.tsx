"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { logMomentum } from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";

// Reset Tools — a rotation ENGINE, not a game list. The system picks a quick
// cognitive interrupt for you, never repeating the same game or category twice
// in a row, with a cooldown window so resets always feel new.

type Category = "attention" | "memory" | "pattern" | "speed" | "filter";

type Tool = {
  id: string;
  label: string;
  category: Category;
  emoji: string;
};

const TOOLS: Tool[] = [
  { id: "attention-tiles", label: "Attention Shift", category: "attention", emoji: "🧩" },
  { id: "memory-tap", label: "Working Memory", category: "memory", emoji: "🧠" },
  { id: "sequence-repair", label: "Sequence Repair", category: "pattern", emoji: "🔢" },
  { id: "rapid-select", label: "Rapid Select", category: "speed", emoji: "⚡" },
  { id: "distraction-filter", label: "Distraction Filter", category: "filter", emoji: "🎯" },
];

const CAT_COLOR: Record<Category, string> = {
  attention: "#3b82f6",
  memory: "#a855f7",
  pattern: "#22c55e",
  speed: "#f59e0b",
  filter: "#ef4444",
};
const CAT_LABEL: Record<Category, string> = {
  attention: "Attention Reset",
  memory: "Memory Reset",
  pattern: "Pattern Reset",
  speed: "Speed Reset",
  filter: "Filter Reset",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
const rand = (n: number) => Math.floor(Math.random() * n);

// ---- Individual reset games ------------------------------------------------

// Attention Shift — tap the tile that's a different shade. Grid size varies.
function AttentionTiles({ onDone }: { onDone: () => void }) {
  const N = useMemo(() => (Math.random() < 0.5 ? 3 : 4), []);
  const [round, setRound] = useState(0);
  const [odd, setOdd] = useState(() => rand(N * N));
  const ROUNDS = 3;
  return (
    <Frame title="Attention Shift" hint={`Tap the tile that's a different shade. (${round + 1}/${ROUNDS})`}>
      <div
        className="mt-6 grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${N}, minmax(0,1fr))` }}
      >
        {Array.from({ length: N * N }, (_, i) => i).map((i) => (
          <button
            key={i}
            type="button"
            aria-label="tile"
            onClick={() => {
              if (i !== odd) return;
              if (round + 1 >= ROUNDS) onDone();
              else {
                setRound(round + 1);
                setOdd(rand(N * N));
              }
            }}
            className="aspect-square rounded-2xl transition-transform active:scale-95"
            style={{ background: i === odd ? "#1e4f4f" : "#3a7a7a", width: N === 3 ? 72 : 56 }}
          />
        ))}
      </div>
    </Frame>
  );
}

// Working Memory — watch a short sequence light up, then tap it back in order.
function MemoryTap({ onDone }: { onDone: () => void }) {
  const COUNT = 4;
  const [seq] = useState(() => Array.from({ length: 3 }, () => rand(COUNT)));
  const [watching, setWatching] = useState(true);
  const [lit, setLit] = useState<number | null>(null);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    if (!watching) return;
    let i = 0;
    setLit(seq[0]!);
    const id = window.setInterval(() => {
      i++;
      if (i >= seq.length) {
        window.clearInterval(id);
        setLit(null);
        window.setTimeout(() => setWatching(false), 350);
      } else {
        setLit(null);
        window.setTimeout(() => setLit(seq[i]!), 120);
      }
    }, 750);
    return () => window.clearInterval(id);
  }, [watching, seq]);

  function tap(n: number) {
    if (watching) return;
    if (n === seq[pos]) {
      if (pos + 1 >= seq.length) onDone();
      else setPos(pos + 1);
    } else {
      setPos(0);
      setWatching(true);
    }
  }

  return (
    <Frame
      title="Working Memory"
      hint={watching ? "Watch the order…" : `Tap it back in order. (${pos}/${seq.length})`}
    >
      <div className="mt-6 grid grid-cols-2 gap-3">
        {Array.from({ length: COUNT }, (_, i) => i).map((i) => (
          <button
            key={i}
            type="button"
            aria-label="memory tile"
            onClick={() => tap(i)}
            className="h-24 w-24 rounded-2xl transition-colors"
            style={{ background: lit === i ? "#1e4f4f" : "#9ec3c3" }}
          />
        ))}
      </div>
    </Frame>
  );
}

// Sequence Repair — one number is missing from a pattern; pick the right one.
function SequenceRepair({ onDone }: { onDone: () => void }) {
  const puzzle = useMemo(() => {
    const start = rand(5) + 1;
    const step = rand(4) + 2;
    const arr = Array.from({ length: 5 }, (_, i) => start + i * step);
    const idx = 1 + rand(3);
    const answer = arr[idx]!;
    const options = shuffle([answer, answer + step, Math.max(0, answer - step)]);
    return { arr, idx, answer, options };
  }, []);
  const [wrong, setWrong] = useState<number | null>(null);

  return (
    <Frame title="Sequence Repair" hint="Which number is missing?">
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {puzzle.arr.map((n, i) => (
          <span
            key={i}
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${
              i === puzzle.idx
                ? "border-2 border-dashed border-[#1e4f4f] text-[#1e4f4f]"
                : "bg-white text-[#1f1c19]"
            }`}
          >
            {i === puzzle.idx ? "?" : n}
          </span>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {puzzle.options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => (o === puzzle.answer ? onDone() : setWrong(o))}
            className={`h-14 w-16 rounded-xl text-xl font-bold transition-colors ${
              wrong === o
                ? "bg-[#a85c4a]/20 text-[#a85c4a]"
                : "bg-white text-[#1f1c19] hover:bg-[#f0f5f5]"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </Frame>
  );
}

// Rapid Select — tap the swatch that matches the target, fast, several rounds.
const SWATCHES = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];
function RapidSelect({ onDone }: { onDone: () => void }) {
  const ROUNDS = 5;
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => rand(SWATCHES.length));
  const options = useMemo(() => {
    const others = shuffle(SWATCHES.map((_, i) => i).filter((i) => i !== target)).slice(0, 3);
    return shuffle([target, ...others]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, round]);

  return (
    <Frame title="Rapid Select" hint={`Tap the match — quickly! (${round + 1}/${ROUNDS})`}>
      <div className="mt-6 flex flex-col items-center">
        <span className="text-sm font-semibold text-[#6b635a]">Target</span>
        <span
          className="mt-1 h-14 w-14 rounded-full border-4 border-white shadow"
          style={{ background: SWATCHES[target] }}
        />
        <div className="mt-6 flex gap-3">
          {options.map((i, k) => (
            <button
              key={k}
              type="button"
              aria-label="swatch"
              onClick={() => {
                if (i !== target) return;
                if (round + 1 >= ROUNDS) onDone();
                else {
                  setRound(round + 1);
                  setTarget(rand(SWATCHES.length));
                }
              }}
              className="h-16 w-16 rounded-2xl transition-transform active:scale-95"
              style={{ background: SWATCHES[i] }}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}

// Distraction Filter — tap ONLY the target color, ignore the rest.
function DistractionFilter({ onDone }: { onDone: () => void }) {
  const setup = useMemo(() => {
    const palette = shuffle(SWATCHES).slice(0, 3);
    const tiles = Array.from({ length: 9 }, () => palette[rand(3)]!);
    // ensure the target appears at least twice
    let target = palette[0]!;
    for (const c of palette) {
      if (tiles.filter((t) => t === c).length >= 2) {
        target = c;
        break;
      }
    }
    if (tiles.filter((t) => t === target).length < 2) {
      tiles[0] = target;
      tiles[1] = target;
    }
    return { tiles, target, total: tiles.filter((t) => t === target).length };
  }, []);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [miss, setMiss] = useState(false);

  function tap(i: number) {
    if (setup.tiles[i] !== setup.target) {
      setMiss(true);
      window.setTimeout(() => setMiss(false), 250);
      return;
    }
    const next = new Set(tapped);
    next.add(i);
    setTapped(next);
    if (next.size >= setup.total) onDone();
  }

  return (
    <Frame
      title="Distraction Filter"
      hint="Tap only the matching color — ignore the rest."
    >
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-[#6b635a]">Target</span>
        <span
          className="h-6 w-6 rounded-full border-2 border-white shadow"
          style={{ background: setup.target }}
        />
      </div>
      <div
        className={`mt-4 grid grid-cols-3 gap-2.5 rounded-2xl p-2 transition-colors ${
          miss ? "bg-[#a85c4a]/15" : ""
        }`}
      >
        {setup.tiles.map((c, i) => (
          <button
            key={i}
            type="button"
            aria-label="tile"
            onClick={() => tap(i)}
            className="h-20 w-20 rounded-2xl transition-transform active:scale-95"
            style={{ background: c, opacity: tapped.has(i) ? 0.25 : 1 }}
          />
        ))}
      </div>
    </Frame>
  );
}

// Shared layout for a running game.
function Frame({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xl font-bold text-[#1f1c19]">{title}</p>
      <p className="mt-1 text-base text-[#6b635a]">{hint}</p>
      {children}
    </div>
  );
}

// ---- The rotation engine ---------------------------------------------------

export function GamesPanel(_: { onOpen?: (s: AppSection) => void }) {
  const [phase, setPhase] = useState<"menu" | "play" | "done">("menu");
  const [current, setCurrent] = useState<Tool | null>(null);
  const recentRef = useRef<string[]>([]); // last up to 3 game ids (cooldown)
  const lastCatRef = useRef<Category | null>(null);

  function pickNext(): Tool {
    const recent = recentRef.current;
    const lastCat = lastCatRef.current;
    let pool = TOOLS.filter(
      (t) => !recent.includes(t.id) && t.category !== lastCat,
    );
    if (pool.length === 0)
      pool = TOOLS.filter((t) => t.id !== recent[recent.length - 1]);
    if (pool.length === 0) pool = TOOLS;
    const pick = pool[rand(pool.length)]!;
    recentRef.current = [...recent, pick.id].slice(-3);
    lastCatRef.current = pick.category;
    return pick;
  }

  function startNext() {
    setCurrent(pickNext());
    setPhase("play");
  }

  // Running game — keyed so each pick remounts fresh.
  if (phase === "play" && current) {
    const onDone = () => {
      logMomentum("reset", "Reset tool used");
      setPhase("done");
    };
    const game = (() => {
      switch (current.id) {
        case "attention-tiles":
          return <AttentionTiles key={Math.random()} onDone={onDone} />;
        case "memory-tap":
          return <MemoryTap key={Math.random()} onDone={onDone} />;
        case "sequence-repair":
          return <SequenceRepair key={Math.random()} onDone={onDone} />;
        case "rapid-select":
          return <RapidSelect key={Math.random()} onDone={onDone} />;
        default:
          return <DistractionFilter key={Math.random()} onDone={onDone} />;
      }
    })();
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-md flex-col items-center px-6 py-8">
        <div className="flex w-full items-center justify-between">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{
              backgroundColor: `${CAT_COLOR[current.category]}1a`,
              color: CAT_COLOR[current.category],
            }}
          >
            {CAT_LABEL[current.category]}
          </span>
          <button
            type="button"
            onClick={() => setPhase("done")}
            className="text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
          >
            Skip
          </button>
        </div>
        <div className="mt-8 w-full">{game}</div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-md flex-col items-center px-6 py-16 text-center">
        <p className="text-3xl">🌿</p>
        <p className="mt-3 text-xl font-bold text-[#1f1c19]">Back in the room.</p>
        <p className="mt-1 text-base text-[#6b635a]">
          Quick interrupt done — and the next one will be different.
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={startNext}
            className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-base font-bold text-[#1e4f4f]"
          >
            Another
          </button>
          <button
            type="button"
            onClick={() => setPhase("menu")}
            className="rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-base font-bold text-white"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Menu — the system chooses; the user doesn't pick from a list.
  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col items-center px-6 py-16 text-center">
      <p className="text-2xl font-bold text-[#1f1c19]">Reset Tools</p>
      <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
        Stuck or overwhelmed? A quick cognitive interrupt to shift your state —
        no breathing, no scoring. I&apos;ll pick one for you, and rotate so it
        never feels repetitive.
      </p>
      <button
        type="button"
        onClick={startNext}
        className="mt-8 rounded-2xl bg-[#1e4f4f] px-10 py-4 text-xl font-bold text-white shadow-md hover:bg-[#163a3a]"
      >
        Reset my attention
      </button>
      <p className="mt-3 text-sm text-[#9a8f82]">
        Attention · Memory · Pattern · Speed · Filter
      </p>
    </div>
  );
}
