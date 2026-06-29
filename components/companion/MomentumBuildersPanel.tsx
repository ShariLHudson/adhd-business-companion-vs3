"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppBackButton } from "@/components/companion/AppBackButton";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import { MomentumGameRunner } from "@/components/companion/games/MomentumGameRunner";
import { rand } from "@/components/companion/games/gameUtils";
import { logMomentum } from "@/lib/companionStore";
import {
  getMomentumGameDef,
  MOMENTUM_BUILDER_CATEGORIES,
  momentumBuildersForCategory,
  recommendMomentumBuilders,
  surpriseEligibleGameIds,
  areMomentumRecommendationsHidden,
  hideMomentumRecommendations,
  showMomentumRecommendations,
  type MomentumBuilderItem,
  type MomentumBuilderLaunch,
} from "@/lib/momentumBuilders";
import { recordMomentumGamesVisit } from "@/lib/momentumGames/momentumGamesUsage";

type Phase = "menu" | "play" | "done";

type Props = {
  onLaunchExternal: (launch: Exclude<MomentumBuilderLaunch, { kind: "game" }>) => void;
  onReturnHome?: () => void;
};

export function MomentumBuildersPanel({ onLaunchExternal, onReturnHome }: Props) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [recsHidden, setRecsHidden] = useState(() => areMomentumRecommendationsHidden());
  const recentRef = useRef<string[]>([]);

  const recommendations = useMemo(() => recommendMomentumBuilders(3), []);
  const currentGame = currentGameId ? getMomentumGameDef(currentGameId) : null;

  useEffect(() => {
    recordMomentumGamesVisit();
  }, []);

  function toggleCategory(id: string) {
    setExpandedCategory((current) => (current === id ? null : id));
  }

  function hideRecommendations() {
    setRecsHidden(true);
    setExpandedCategory(null);
    hideMomentumRecommendations();
  }

  function restoreRecommendations() {
    setRecsHidden(false);
    showMomentumRecommendations();
  }

  function pickSurpriseGameId(): string {
    const recent = recentRef.current;
    let pool = surpriseEligibleGameIds().filter((id) => !recent.includes(id));
    if (pool.length === 0) {
      pool = surpriseEligibleGameIds().filter((id) => id !== recent.at(-1));
    }
    if (pool.length === 0) pool = surpriseEligibleGameIds();
    const pick = pool[rand(pool.length)]!;
    recentRef.current = [...recent, pick].slice(-4);
    return pick;
  }

  function startGame(gameId: string) {
    const game = getMomentumGameDef(gameId);
    if (!game) return;
    if (game.externalTool === "spin-wheel") {
      onLaunchExternal({ kind: "section", section: "spin-wheel" });
      return;
    }
    setCurrentGameId(gameId);
    setPhase("play");
  }

  function launchItem(item: MomentumBuilderItem) {
    switch (item.launch.kind) {
      case "game":
        startGame(item.launch.gameId);
        break;
      case "surprise-pick":
        startGame(pickSurpriseGameId());
        break;
      default:
        onLaunchExternal(item.launch);
        break;
    }
  }

  function finishGame() {
    logMomentum("reset", `Momentum builder: ${currentGame?.label ?? "game"}`);
    setPhase("done");
  }

  if (phase === "play" && currentGame) {
    return (
      <div className="momentum-builders-panel companion-fade-in flex h-full flex-col px-1 py-2 sm:px-2">
        <div className="flex w-full items-center justify-between">
          <AppBackButton
            destination="Momentum Builders"
            onBack={() => {
              setPhase("menu");
              setCurrentGameId(null);
            }}
            size="compact"
          />
        </div>
        <h2 className="mt-2 text-lg font-semibold text-[#2a2820]">
          {currentGame.label}
        </h2>
        <p className="mt-1 text-sm text-[#6b635a]">{currentGame.description}</p>
        <div className="mt-4 min-h-0 flex-1">
          <MomentumGameRunner gameId={currentGame.id} onDone={finishGame} />
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="momentum-builders-panel companion-fade-in flex h-full flex-col items-center px-2 py-10 text-center">
        <CompanionObjectVisual
          objectId="celebration-reset"
          size="lg"
          variant="mini-scene"
          animate
        />
        <p className="mt-3 text-xl font-semibold text-[#1f1c19]">Nice reset</p>
        <p className="mt-1 text-base text-[#6b635a]">
          However small — you showed up for yourself.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => startGame(pickSurpriseGameId())}
            className="momentum-builders-panel__surprise-btn"
          >
            Surprise me again
          </button>
          <button
            type="button"
            onClick={() => setPhase("menu")}
            className="rounded-xl bg-[#1e4f4f] px-6 py-2.5 text-sm font-semibold text-white"
          >
            Back to the menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="momentum-builders-panel companion-fade-in flex h-full flex-col gap-4">
      {onReturnHome ? (
        <AppBackButton
          destination="the Living Room"
          onBack={onReturnHome}
          size="compact"
          className="momentum-builders-panel__home-back"
        />
      ) : null}

      <header className="momentum-builders-panel__header">
        <h1 className="momentum-builders-panel__title">Momentum Builders</h1>
        <p className="momentum-builders-panel__intro">
          Short resets for energy, focus, and calm — browse what you need right now.
        </p>
      </header>

      {recommendations.length > 0 && !recsHidden ? (
        <section className="momentum-builders-panel__recommendations" aria-label="Today's recommendations">
          <div className="momentum-builders-panel__section-head">
            <h2 className="momentum-builders-panel__section-title">
              Today&apos;s recommendations
            </h2>
            <button
              type="button"
              className="momentum-builders-panel__section-hide"
              onClick={hideRecommendations}
              aria-label="Hide today's recommendations"
            >
              Hide for now
            </button>
          </div>
          <ul className="momentum-builders-panel__list">
            {recommendations.map(({ item, reason }) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="momentum-builders-panel__card"
                  onClick={() => launchItem(item)}
                >
                  <CompanionObjectVisual
                    objectId={item.objectId}
                    size="sm"
                    variant="icon"
                    className="shrink-0"
                  />
                  <span className="min-w-0 flex-1 text-left">
                    <span className="momentum-builders-panel__card-title">
                      {item.title}
                    </span>
                    <span className="momentum-builders-panel__card-meta">
                      {item.timeLabel}
                    </span>
                    <span className="momentum-builders-panel__card-desc">
                      {reason}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recommendations.length > 0 && recsHidden ? (
        <button
          type="button"
          className="momentum-builders-panel__recs-restore"
          onClick={restoreRecommendations}
        >
          Show today&apos;s recommendations
        </button>
      ) : null}

      <section className="momentum-builders-panel__categories" aria-label="Builder categories">
        {MOMENTUM_BUILDER_CATEGORIES.map((category) => {
          const items = momentumBuildersForCategory(category.id);
          const open = expandedCategory === category.id;
          return (
            <div
              key={category.id}
              className={[
                "momentum-builders-panel__category",
                open ? "momentum-builders-panel__category--open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className="momentum-builders-panel__category-toggle"
                aria-expanded={open}
                onClick={() => toggleCategory(category.id)}
              >
                <span className="min-w-0 flex-1 text-left">
                  <span className="momentum-builders-panel__category-title">
                    {category.title}
                  </span>
                  <span className="momentum-builders-panel__category-tagline">
                    {category.tagline}
                  </span>
                </span>
                <span className="momentum-builders-panel__chevron" aria-hidden>
                  {open ? "▾" : "▸"}
                </span>
              </button>
              {open ? (
                <ul className="momentum-builders-panel__list momentum-builders-panel__list--nested">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="momentum-builders-panel__card momentum-builders-panel__card--compact"
                        onClick={() => launchItem(item)}
                      >
                        <CompanionObjectVisual
                          objectId={item.objectId}
                          size="sm"
                          variant="icon"
                          className="shrink-0"
                        />
                        <span className="min-w-0 flex-1 text-left">
                          <span className="momentum-builders-panel__card-title">
                            {item.title}
                          </span>
                          <span className="momentum-builders-panel__card-meta">
                            {item.timeLabel}
                          </span>
                          <span className="momentum-builders-panel__card-desc">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}
