"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GameFrame,
  SHAPES,
  SWATCHES,
  rand,
  shuffle,
} from "./gameUtils";

type GameProps = { onDone: () => void };

export function PatternMatch({ onDone }: GameProps) {
  const N = useMemo(() => (Math.random() < 0.5 ? 3 : 4), []);
  const [round, setRound] = useState(0);
  const [odd, setOdd] = useState(() => rand(N * N));
  const ROUNDS = 3;
  return (
    <GameFrame title="Pattern Match" hint={`Tap the different shade. (${round + 1}/${ROUNDS})`}>
      <div className="mt-6 grid gap-2.5" style={{ gridTemplateColumns: `repeat(${N}, minmax(0,1fr))` }}>
        {Array.from({ length: N * N }, (_, i) => i).map((i) => (
          <button
            key={i}
            type="button"
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
    </GameFrame>
  );
}

export function SpotDifference({ onDone }: GameProps) {
  const symbols = useMemo(() => {
    const base = shuffle([...SHAPES]).slice(0, 4);
    const intruder = SHAPES.find((s) => !base.includes(s)) ?? "★";
    const tiles = [...base, ...base, intruder];
    return { tiles: shuffle(tiles), intruder };
  }, []);
  return (
    <GameFrame title="Spot The Difference" hint="Tap the symbol that only appears once.">
      <div className="mt-6 grid grid-cols-3 gap-2">
        {symbols.tiles.map((sym, i) => (
          <button
            key={i}
            type="button"
            onClick={() => sym === symbols.intruder && onDone()}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm hover:bg-[#f0f5f5]"
          >
            {sym}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

export function MemoryMatch({ onDone }: GameProps) {
  const pairs = useMemo(() => shuffle([...SHAPES.slice(0, 4), ...SHAPES.slice(0, 4)]), []);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    if (pairs[a] === pairs[b]) {
      const next = new Set(matched);
      next.add(a);
      next.add(b);
      setMatched(next);
      setFlipped([]);
      if (next.size >= pairs.length) onDone();
    } else {
      const t = window.setTimeout(() => setFlipped([]), 600);
      return () => window.clearTimeout(t);
    }
  }, [flipped, matched, onDone, pairs]);

  function tap(i: number) {
    if (matched.has(i) || flipped.includes(i) || flipped.length >= 2) return;
    setFlipped([...flipped, i]);
  }

  return (
    <GameFrame title="Memory Match" hint="Flip two cards — find all pairs.">
      <div className="mt-6 grid grid-cols-4 gap-2">
        {pairs.map((sym, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1e4f4f]/10 text-xl font-bold"
          >
            {flipped.includes(i) || matched.has(i) ? sym : "?"}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

export function SequenceBuilder({ onDone }: GameProps) {
  const seq = useMemo(() => shuffle(SHAPES.slice(0, 4)), []);
  const [pos, setPos] = useState(0);
  return (
    <GameFrame title="Sequence Builder" hint={`Tap in order: ${seq.join(" → ")}`}>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {shuffle([...seq]).map((sym, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (sym !== seq[pos]) {
                setPos(0);
                return;
              }
              if (pos + 1 >= seq.length) onDone();
              else setPos(pos + 1);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl shadow-sm"
          >
            {sym}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-[#6b635a]">{pos}/{seq.length}</p>
    </GameFrame>
  );
}

const SORT_ITEMS = ["📧 Email", "📞 Call", "💡 Idea", "📅 Schedule", "🛒 Buy", "📖 Read"];

export function QuickSort({ onDone }: GameProps) {
  const items = useMemo(() => shuffle(SORT_ITEMS).slice(0, 4), []);
  const [idx, setIdx] = useState(0);
  const [work, setWork] = useState<Record<string, string>>({});
  const buckets = ["Do", "Later", "Drop"];

  function sort(bucket: string) {
    const next = { ...work, [items[idx]!]: bucket };
    setWork(next);
    if (idx + 1 >= items.length) onDone();
    else setIdx(idx + 1);
  }

  return (
    <GameFrame title="Quick Sort" hint={`Sort: ${items[idx]} (${idx + 1}/${items.length})`}>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {buckets.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => sort(b)}
            className="rounded-xl border-2 border-[#1e4f4f]/30 bg-white px-4 py-2 text-sm font-bold text-[#1e4f4f]"
          >
            {b}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

export function FocusSprint({ onDone }: GameProps) {
  const [left, setLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [target] = useState(() => rand(SWATCHES.length));

  useEffect(() => {
    if (left <= 0) {
      if (score >= 5) onDone();
      else {
        setLeft(15);
        setScore(0);
      }
      return;
    }
    const id = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [left, score, onDone]);

  return (
    <GameFrame title="Focus Sprint" hint={`Tap green ${score}/5 — ${left}s`}>
      <div className="mt-6 flex gap-3">
        {SWATCHES.slice(0, 4).map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => i === target && setScore(score + 1)}
            className="h-16 w-16 rounded-2xl"
            style={{ background: c }}
          />
        ))}
      </div>
    </GameFrame>
  );
}

export function TreasureHunt({ onDone }: GameProps) {
  const setup = useMemo(() => {
    const gems = new Set<number>();
    while (gems.size < 3) gems.add(rand(16));
    return gems;
  }, []);
  const [found, setFound] = useState<Set<number>>(new Set());

  function tap(i: number) {
    if (!setup.has(i)) return;
    const next = new Set(found);
    next.add(i);
    setFound(next);
    if (next.size >= 3) onDone();
  }

  return (
    <GameFrame title="Treasure Hunt" hint={`Find 3 gems (${found.size}/3)`}>
      <div className="mt-6 grid grid-cols-4 gap-2">
        {Array.from({ length: 16 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4cdc3]/50 text-lg"
          >
            {found.has(i) ? "💎" : setup.has(i) && found.size >= 2 ? "✨" : "·"}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

export function ReactionTap({ onDone }: GameProps) {
  const ROUNDS = 5;
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => rand(SWATCHES.length));
  const options = useMemo(() => {
    const others = shuffle(SWATCHES.map((_, i) => i).filter((i) => i !== target)).slice(0, 3);
    return shuffle([target, ...others]);
  }, [target, round]);

  return (
    <GameFrame title="Reaction Tap" hint={`Match the target! (${round + 1}/${ROUNDS})`}>
      <span className="mt-4 h-12 w-12 rounded-full" style={{ background: SWATCHES[target] }} />
      <div className="mt-4 flex gap-2">
        {options.map((i, k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              if (i !== target) return;
              if (round + 1 >= ROUNDS) onDone();
              else {
                setRound(round + 1);
                setTarget(rand(SWATCHES.length));
              }
            }}
            className="h-14 w-14 rounded-2xl"
            style={{ background: SWATCHES[i] }}
          />
        ))}
      </div>
    </GameFrame>
  );
}

export function ColorQuest({ onDone }: GameProps) {
  const setup = useMemo(() => {
    const target = SWATCHES[rand(SWATCHES.length)]!;
    const tiles = Array.from({ length: 9 }, () => SWATCHES[rand(SWATCHES.length)]!);
    tiles[rand(9)] = target;
    tiles[(rand(9) + 3) % 9] = target;
    return { tiles, target, need: tiles.filter((t) => t === target).length };
  }, []);
  const [tapped, setTapped] = useState<Set<number>>(new Set());

  function tap(i: number) {
    if (setup.tiles[i] !== setup.target) return;
    const next = new Set(tapped);
    next.add(i);
    setTapped(next);
    if (next.size >= setup.need) onDone();
  }

  return (
    <GameFrame title="Color Quest" hint="Tap only the target color.">
      <span className="mt-2 h-6 w-6 rounded-full" style={{ background: setup.target }} />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {setup.tiles.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            className="h-16 w-16 rounded-2xl"
            style={{ background: c, opacity: tapped.has(i) ? 0.3 : 1 }}
          />
        ))}
      </div>
    </GameFrame>
  );
}

export function NumberHunt({ onDone }: GameProps) {
  const nums = useMemo(() => shuffle(Array.from({ length: 9 }, (_, i) => i + 1)), []);
  const [next, setNext] = useState(1);

  return (
    <GameFrame title="Number Hunt" hint={`Find ${next} next`}>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {nums.map((n, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (n !== next) return;
              if (next >= 9) onDone();
              else setNext(next + 1);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xl font-bold shadow-sm"
          >
            {n}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

const WS_WORDS = ["FOCUS", "CALM", "WIN"];
const WS_GRID = [
  ["F", "O", "C", "U", "S"],
  ["X", "A", "L", "M", "Y"],
  ["Z", "C", "A", "L", "M"],
  ["W", "I", "N", "Q", "P"],
  ["R", "S", "T", "U", "V"],
];

export function WordSearchMini({ onDone }: GameProps) {
  const [found, setFound] = useState<Set<string>>(new Set());

  function foundWord(w: string) {
    const next = new Set(found);
    next.add(w);
    setFound(next);
    if (next.size >= WS_WORDS.length) onDone();
  }

  return (
    <GameFrame title="Word Search Mini" hint={`Find: ${WS_WORDS.join(", ")} (${found.size}/3)`}>
      <div className="mt-4 grid gap-1">
        {WS_GRID.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((ch, ci) => (
              <span key={ci} className="flex h-9 w-9 items-center justify-center rounded bg-white text-sm font-bold">
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {WS_WORDS.map((w) => (
          <button
            key={w}
            type="button"
            disabled={found.has(w)}
            onClick={() => foundWord(w)}
            className="rounded-lg bg-[#1e4f4f]/10 px-3 py-1 text-xs font-bold text-[#1e4f4f] disabled:opacity-40"
          >
            Found {w}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

export function ShapeMatch({ onDone }: GameProps) {
  const [target] = useState(() => SHAPES[rand(SHAPES.length)]!);
  const options = useMemo(() => shuffle([...SHAPES]), []);

  return (
    <GameFrame title="Shape Match" hint="Tap the matching shape.">
      <p className="mt-4 text-4xl">{target}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {options.map((sym, i) => (
          <button
            key={i}
            type="button"
            onClick={() => sym === target && onDone()}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl shadow-sm"
          >
            {sym}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

const BLITZ_CATS = ["Things that are red", "Kitchen items", "Animals", "Things you can hold"];

export function CategoryBlitz({ onDone }: GameProps) {
  const cat = useMemo(() => BLITZ_CATS[rand(BLITZ_CATS.length)]!, []);
  const [left, setLeft] = useState(20);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (left <= 0) {
      if (count >= 3) onDone();
      return;
    }
    const id = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [left, count, onDone]);

  return (
    <GameFrame title="Category Blitz" hint={`Name ${cat} — tap + for each (${count}/3, ${left}s)`}>
      <button
        type="button"
        onClick={() => setCount(count + 1)}
        className="mt-6 rounded-2xl bg-[#1e4f4f] px-8 py-4 text-lg font-bold text-white"
      >
        + Got one!
      </button>
    </GameFrame>
  );
}

const TOT_PAIRS = [
  ["Coffee ☕", "Tea 🍵"],
  ["Morning 🌅", "Night 🌙"],
  ["Music 🎵", "Silence 🤫"],
  ["Walk 🚶", "Stretch 🧘"],
];

export function ThisOrThat({ onDone }: GameProps) {
  const [round, setRound] = useState(0);
  const pair = TOT_PAIRS[round % TOT_PAIRS.length]!;

  return (
    <GameFrame title="This Or That" hint={`Quick pick! (${round + 1}/4)`}>
      <div className="mt-6 flex gap-3">
        {pair.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => (round + 1 >= 4 ? onDone() : setRound(round + 1))}
            className="rounded-2xl border-2 border-[#1e4f4f]/25 bg-white px-4 py-3 text-sm font-semibold"
          >
            {opt}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

export function FindDuplicate({ onDone }: GameProps) {
  const setup = useMemo(() => {
    const dup = SHAPES[rand(SHAPES.length)]!;
    const others = shuffle(SHAPES.filter((s) => s !== dup)).slice(0, 7);
    const tiles = shuffle([dup, dup, ...others]);
    const indices = tiles.map((s, i) => (s === dup ? i : -1)).filter((i) => i >= 0);
    return { tiles, indices };
  }, []);
  const [picked, setPicked] = useState<Set<number>>(new Set());

  function tap(i: number) {
    if (!setup.indices.includes(i)) return;
    const next = new Set(picked);
    next.add(i);
    setPicked(next);
    if (next.size >= 2) onDone();
  }

  return (
    <GameFrame title="Find The Duplicate" hint="Tap the two matching symbols.">
      <div className="mt-6 grid grid-cols-3 gap-2">
        {setup.tiles.map((sym, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl shadow-sm"
            style={{ opacity: picked.has(i) ? 0.4 : 1 }}
          >
            {sym}
          </button>
        ))}
      </div>
    </GameFrame>
  );
}

export function MomentumGameRunner({ gameId, onDone }: { gameId: string; onDone: () => void }) {
  switch (gameId) {
    case "pattern-match":
      return <PatternMatch onDone={onDone} />;
    case "spot-difference":
      return <SpotDifference onDone={onDone} />;
    case "memory-match":
      return <MemoryMatch onDone={onDone} />;
    case "sequence-builder":
      return <SequenceBuilder onDone={onDone} />;
    case "quick-sort":
      return <QuickSort onDone={onDone} />;
    case "focus-sprint":
      return <FocusSprint onDone={onDone} />;
    case "treasure-hunt":
      return <TreasureHunt onDone={onDone} />;
    case "reaction-tap":
      return <ReactionTap onDone={onDone} />;
    case "color-quest":
      return <ColorQuest onDone={onDone} />;
    case "number-hunt":
      return <NumberHunt onDone={onDone} />;
    case "word-search-mini":
      return <WordSearchMini onDone={onDone} />;
    case "shape-match":
      return <ShapeMatch onDone={onDone} />;
    case "category-blitz":
      return <CategoryBlitz onDone={onDone} />;
    case "this-or-that":
      return <ThisOrThat onDone={onDone} />;
    case "find-duplicate":
      return <FindDuplicate onDone={onDone} />;
    default:
      return <PatternMatch onDone={onDone} />;
  }
}
