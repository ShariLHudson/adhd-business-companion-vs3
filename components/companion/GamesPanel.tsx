"use client";

import { useRef, useState } from "react";
import { logMomentum } from "@/lib/companionStore";
import {
  MOMENTUM_GAME_CATEGORIES,
  MOMENTUM_GAMES,
  type MomentumGameDef,
} from "@/lib/momentumGames";
import { MomentumGameRunner } from "./games/MomentumGameRunner";
import { rand } from "./games/gameUtils";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";

type Phase = "menu" | "pick" | "play" | "done";

export function GamesPanel() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [current, setCurrent] = useState<MomentumGameDef | null>(null);
  const recentRef = useRef<string[]>([]);
  const lastCatRef = useRef<string | null>(null);

  function pickSurprise(): MomentumGameDef {
    const recent = recentRef.current;
    const lastCat = lastCatRef.current;
    let pool = MOMENTUM_GAMES.filter(
      (g) => !recent.includes(g.id) && g.category !== lastCat,
    );
    if (pool.length === 0) {
      pool = MOMENTUM_GAMES.filter((g) => g.id !== recent[recent.length - 1]);
    }
    if (pool.length === 0) pool = MOMENTUM_GAMES;
    const pick = pool[rand(pool.length)]!;
    recentRef.current = [...recent, pick.id].slice(-4);
    lastCatRef.current = pick.category;
    return pick;
  }

  function startGame(game: MomentumGameDef) {
    setCurrent(game);
    setPhase("play");
  }

  function finishGame() {
    logMomentum("reset", `Momentum game: ${current?.label ?? "game"}`);
    setPhase("done");
  }

  if (phase === "play" && current) {
    const cat = MOMENTUM_GAME_CATEGORIES[current.category];
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-md flex-col px-6 py-8">
        <div className="flex w-full items-center justify-between">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
          >
            {cat.label}
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
          <MomentumGameRunner key={current.id + Date.now()} gameId={current.id} onDone={finishGame} />
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
            onClick={() => setPhase("pick")}
            className="rounded-xl border-2 border-[#d4cdc3] bg-white px-5 py-2.5 text-base font-bold text-[#1f1c19]"
          >
            Pick a game
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

  if (phase === "pick") {
    return (
      <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
        <WorkspaceGuide section="focus" />
        <p className="text-2xl font-semibold text-[#1f1c19]">Momentum Games</p>
        <p className="mt-1 text-base text-[#6b635a]">Pick one — each game works differently.</p>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MOMENTUM_GAMES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => startGame(g)}
              className="rounded-2xl border border-[#d4cdc3] bg-white/80 p-3 text-left hover:border-[#1e4f4f]/40"
            >
              <span className="text-2xl">{g.emoji}</span>
              <span className="mt-1 block text-sm font-semibold text-[#1f1c19]">{g.label}</span>
              <span className="mt-0.5 block text-xs text-[#6b635a]">{g.blurb}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPhase("menu")}
          className="mt-4 text-sm font-semibold text-[#6b635a]"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <WorkspaceGuide section="focus" />
      <p className="text-2xl font-semibold text-[#1f1c19]">Momentum Games</p>
      <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
        Playful, light resets when your brain needs a different kind of break — not another
        list, not another brain dump. Fifteen different games, each with its own feel.
      </p>
      <button
        type="button"
        onClick={() => startGame(pickSurprise())}
        className="mt-8 rounded-2xl bg-[#1e4f4f] px-10 py-4 text-xl font-bold text-white shadow-md hover:bg-[#163a3a]"
      >
        Surprise me 🎲
      </button>
      <button
        type="button"
        onClick={() => setPhase("pick")}
        className="mt-3 rounded-2xl border-2 border-[#1e4f4f]/30 bg-white px-10 py-3 text-base font-bold text-[#1e4f4f]"
      >
        Browse all games
      </button>
      <p className="mt-4 text-center text-sm text-[#9a8f82]">
        Pattern · Memory · Speed · Words · and more
      </p>
    </div>
  );
}
