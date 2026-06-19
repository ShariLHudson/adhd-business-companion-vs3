"use client";

import { useRef, useState } from "react";
import { logMomentum } from "@/lib/companionStore";
import { recommendMomentumGame } from "@/lib/momentumGameRecommend";
import {
  gamesForNeed,
  getMomentumNeedCategory,
  MOMENTUM_NEED_CATEGORIES,
  playableMomentumGames,
  type MomentumGameDef,
  type MomentumNeedId,
} from "@/lib/momentumGames";
import { MomentumGameRunner } from "./games/MomentumGameRunner";
import { rand } from "./games/gameUtils";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";

type Phase = "menu" | "category" | "play" | "done";

function GameMeta({ game }: { game: MomentumGameDef }) {
  return (
    <p className="mt-1.5 text-xs leading-snug text-[#6b635a]">
      🎯 Helps with: {game.helpsWith} · ⏱ {game.time} · 😊 Energy:{" "}
      {game.energy}
    </p>
  );
}

function CategoryCard({
  emoji,
  title,
  tagline,
  onClick,
}: {
  emoji: string;
  title: string;
  tagline: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl border border-[#d4cdc3] bg-white/85 px-3.5 py-3.5 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/35 hover:bg-white"
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f1ea] text-xl"
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-[#1f1c19]">
          {title}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-[#6b635a]">
          {tagline}
        </span>
      </span>
    </button>
  );
}

export function GamesPanel({
  onOpenSpinWheel,
}: {
  onOpenSpinWheel?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [activeNeed, setActiveNeed] = useState<MomentumNeedId | null>(null);
  const [current, setCurrent] = useState<MomentumGameDef | null>(null);
  const recentRef = useRef<string[]>([]);
  const lastNeedRef = useRef<MomentumNeedId | null>(null);

  const recommendation = recommendMomentumGame();

  function pickSurprise(): MomentumGameDef {
    const recent = recentRef.current;
    const lastNeed = lastNeedRef.current;
    let pool = playableMomentumGames().filter(
      (g) => !recent.includes(g.id) && g.need !== lastNeed,
    );
    if (pool.length === 0) {
      pool = playableMomentumGames().filter(
        (g) => g.id !== recent[recent.length - 1],
      );
    }
    if (pool.length === 0) pool = playableMomentumGames();
    const pick = pool[rand(pool.length)]!;
    recentRef.current = [...recent, pick.id].slice(-4);
    lastNeedRef.current = pick.need;
    return pick;
  }

  function startGame(game: MomentumGameDef) {
    if (game.externalTool === "spin-wheel") {
      onOpenSpinWheel?.();
      return;
    }
    setCurrent(game);
    setPhase("play");
  }

  function finishGame() {
    logMomentum("reset", `Momentum game: ${current?.label ?? "game"}`);
    setPhase("done");
  }

  function openCategory(need: MomentumNeedId) {
    setActiveNeed(need);
    setPhase("category");
  }

  if (phase === "play" && current) {
    const cat = getMomentumNeedCategory(current.need);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-md flex-col px-6 py-8">
        <div className="flex w-full items-center justify-between">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
          >
            {cat.title}
          </span>
          <button
            type="button"
            onClick={() => setPhase("done")}
            className="text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
          >
            Skip
          </button>
        </div>
        <div className="mt-8 w-full">
          <MomentumGameRunner
            key={current.id + Date.now()}
            gameId={current.id}
            onDone={finishGame}
          />
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-md flex-col items-center px-6 py-16 text-center">
        <p className="text-3xl">🎉</p>
        <p className="mt-3 text-xl font-bold text-[#1f1c19]">Nice reset!</p>
        <p className="mt-1 text-base text-[#6b635a]">
          Playful break complete — ready when you are.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => startGame(pickSurprise())}
            className="rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-base font-bold text-[#1e4f4f]"
          >
            Surprise me
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

  if (phase === "category" && activeNeed) {
    const cat = getMomentumNeedCategory(activeNeed);
    const games = gamesForNeed(activeNeed);
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <WorkspaceGuide section="focus" />
        <button
          type="button"
          onClick={() => setPhase("menu")}
          className="mb-3 self-start text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
        >
          ← Back
        </button>
        <p className="text-2xl font-semibold text-[#1f1c19]">
          {cat.emoji} {cat.title}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">{cat.tagline}</p>
        <ul className="mt-5 flex flex-col gap-2">
          {games.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => startGame(g)}
                className="flex w-full items-start gap-3 rounded-2xl border border-[#d4cdc3] bg-white/85 px-3.5 py-3 text-left shadow-sm transition-colors hover:border-[#1e4f4f]/35 hover:bg-white"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f1ea] text-lg"
                >
                  {g.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-[#1f1c19]">
                    {g.label}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-[#6b635a]">
                    {g.description}
                  </span>
                  <GameMeta game={g} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <WorkspaceGuide section="focus" />
      <p className="text-2xl font-semibold text-[#1f1c19]">Momentum Games</p>
      <p className="mt-1 text-base text-[#6b635a]">
        Choose what your brain needs right now.
      </p>

      {recommendation && (
        <div className="mt-5 rounded-2xl border border-[#1e4f4f]/25 bg-[#f0f5f5] px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            Shari Recommends
          </p>
          <p className="mt-2 text-base font-semibold text-[#1f1c19]">
            {recommendation.game.emoji} {recommendation.game.label}
          </p>
          <p className="mt-1 text-sm leading-snug text-[#6b635a]">
            {recommendation.reason}
          </p>
          <button
            type="button"
            onClick={() => startGame(recommendation.game)}
            className="mt-3 rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-bold text-white"
          >
            Play Now
          </button>
        </div>
      )}

      <ul className="mt-5 flex flex-col gap-2">
        {MOMENTUM_NEED_CATEGORIES.map((cat) => (
          <li key={cat.id}>
            <CategoryCard
              emoji={cat.emoji}
              title={cat.title}
              tagline={cat.tagline}
              onClick={() => openCategory(cat.id)}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => startGame(pickSurprise())}
        className="mt-6 rounded-2xl border-2 border-[#1e4f4f]/30 bg-white px-6 py-3 text-base font-bold text-[#1e4f4f]"
      >
        Surprise me 🎲
      </button>
    </div>
  );
}
