"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  composeMomentumGamesWelcome,
  recordMomentumGamesCategory,
  recordMomentumGamesVisit,
} from "@/lib/momentumGames/momentumGamesUsage";
import { MomentumGameRunner } from "./games/MomentumGameRunner";
import { rand } from "./games/gameUtils";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import { MomentumGamesCategoryCard } from "@/components/companion/MomentumGamesCategoryCard";
import { AppBackButton } from "@/components/companion/AppBackButton";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";

type Phase = "menu" | "category" | "play" | "done";

function GameMeta({ game }: { game: MomentumGameDef }) {
  return (
    <p className="mt-1.5 text-xs leading-snug text-[#6b635a]">
      Helps with: {game.helpsWith} · Time: {game.time} · Energy: {game.energy}
    </p>
  );
}

export function GamesPanel({
  onOpenSpinWheel,
  onReturnHome,
}: {
  onOpenSpinWheel?: () => void;
  onReturnHome?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [activeNeed, setActiveNeed] = useState<MomentumNeedId | null>(null);
  const [current, setCurrent] = useState<MomentumGameDef | null>(null);
  const [personalWelcome, setPersonalWelcome] = useState<string | null>(null);
  const recentRef = useRef<string[]>([]);
  const lastNeedRef = useRef<MomentumNeedId | null>(null);

  const recommendation = recommendMomentumGame();

  useEffect(() => {
    recordMomentumGamesVisit();
    setPersonalWelcome(composeMomentumGamesWelcome());
  }, []);

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
    recordMomentumGamesCategory(game.need);
    setCurrent(game);
    setPhase("play");
  }

  function finishGame() {
    logMomentum("reset", `Momentum game: ${current?.label ?? "game"}`);
    setPhase("done");
  }

  function openCategory(need: MomentumNeedId) {
    recordMomentumGamesCategory(need);
    setActiveNeed(need);
    setPhase("category");
  }

  if (phase === "play" && current) {
    const cat = getMomentumNeedCategory(current.need);
    return (
      <div className="momentum-games-panel companion-fade-in mx-auto flex h-full max-w-md flex-col px-2 py-4 sm:px-4">
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
      <div className="momentum-games-panel companion-fade-in mx-auto flex h-full max-w-md flex-col items-center px-2 py-12 text-center sm:px-4">
        <CompanionObjectVisual
          objectId="celebration-reset"
          size="lg"
          variant="mini-scene"
          animate
        />
        <p className="mt-3 text-xl font-bold text-[#1f1c19]">Nice reset!</p>
        <p className="mt-1 text-base text-[#6b635a]">
          Playful break complete — ready when you are.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => startGame(pickSurprise())}
            className="momentum-games-surprise momentum-games-surprise--compact"
          >
            <span className="momentum-games-surprise__sparkle" aria-hidden>
              ✦
            </span>
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
      <div className="momentum-games-panel companion-fade-in mx-auto flex h-full max-w-xl flex-col px-2 py-4 sm:px-4">
        <WorkspaceGuide section="focus" />
        <AppBackButton
          destination="Momentum Games"
          onBack={() => setPhase("menu")}
          size="compact"
          className="momentum-games-back"
        />
        <p className="momentum-games-category-heading flex items-center gap-2">
          <CompanionObjectVisual objectId={cat.objectId} size="md" variant="mini-scene" />
          {cat.title}
        </p>
        <p className="mt-1 text-base text-[#6b635a]">{cat.tagline}</p>
        <ul className="mt-5 flex flex-col gap-2">
          {games.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => startGame(g)}
                className="momentum-games-game-row"
              >
                <CompanionObjectVisual
                  objectId={g.objectId}
                  size="sm"
                  variant="icon"
                  className="shrink-0"
                />
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
    <div className="momentum-games-panel companion-fade-in mx-auto flex h-full max-w-xl flex-col px-2 py-4 sm:px-4">
      {onReturnHome ? (
        <AppBackButton
          destination="the Living Room"
          onBack={onReturnHome}
          size="compact"
          className="momentum-games-home-back"
        />
      ) : null}

      <header className="momentum-games-header">
        <h1 className="momentum-games-header__title">Momentum Games</h1>
        <p className="momentum-games-header__intro">
          Let&apos;s give your brain something fun to do.
        </p>
        <p className="momentum-games-header__sub">
          Sometimes momentum starts with play.
        </p>
        {personalWelcome ? (
          <p className="momentum-games-header__personal">{personalWelcome}</p>
        ) : null}
      </header>

      {recommendation && (
        <div className="momentum-games-recommendation">
          <p className="momentum-games-recommendation__label">Shari suggests</p>
          <p className="mt-2 text-base font-semibold text-[#1f1c19]">
            <CompanionObjectVisual
              objectId={recommendation.game.objectId}
              size="sm"
              variant="icon"
              className="mr-2 align-middle"
            />
            {recommendation.game.label}
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

      <ul className="momentum-games-categories">
        {MOMENTUM_NEED_CATEGORIES.map((cat) => (
          <li key={cat.id}>
            <MomentumGamesCategoryCard
              needId={cat.id}
              title={cat.title}
              tagline={cat.tagline}
              onClick={() => openCategory(cat.id)}
            />
          </li>
        ))}
      </ul>

      <div className="momentum-games-surprise-wrap">
        <p className="momentum-games-surprise__helper">
          Not sure what you need today?
        </p>
        <button
          type="button"
          onClick={() => startGame(pickSurprise())}
          className="momentum-games-surprise"
        >
          <span className="momentum-games-surprise__sparkle" aria-hidden>
            ✦
          </span>
          <span className="momentum-games-surprise__label">Surprise me</span>
          <span className="momentum-games-surprise__hint">
            Let me choose for you.
          </span>
          <span className="momentum-games-surprise__particles" aria-hidden />
        </button>
      </div>
    </div>
  );
}
