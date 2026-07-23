import type {
  ContinueJourneyOption,
  ContinueYourJourneyModel,
  StrategyWorkItem,
} from "./types";
import { recommendStrategicHandoff } from "./intelligence";

const MAX_SECONDARY = 2;

/**
 * One recommended next step + up to two secondary options.
 * Never dumps every destination.
 */
export function buildContinueYourJourney(
  item: StrategyWorkItem,
  options?: { maxSecondary?: number },
): ContinueYourJourneyModel {
  const maxSecondary = Math.max(
    0,
    Math.min(2, options?.maxSecondary ?? MAX_SECONDARY),
  );
  const hasDirection = Boolean(item.chosenDirection?.trim());
  const emotional =
    item.entryReason === "rethink_current_direction" ||
    item.entryReason === "unsure";
  const evaluating =
    item.currentStage === "evaluate_decision" ||
    item.status === "evaluating";

  let recommended: ContinueJourneyOption | null = null;
  const pool: ContinueJourneyOption[] = [];
  const intel = recommendStrategicHandoff(item);

  if (intel) {
    recommended = {
      destinationId: intel.destinationId,
      title: intel.title,
      benefit: intel.benefit,
      actionLabel: intel.actionLabel,
    };
  }

  if (!recommended && !hasDirection && emotional) {
    recommended = {
      destinationId: "talk_it_out",
      title: "Talk it through first",
      benefit:
        "When the choice feels tangled, a calmer conversation can reveal what you actually want before you lock a direction.",
      actionLabel: "Open Talk It Out",
    };
    pool.push(
      boardOption(),
      chamberOption(),
      projectOption(),
    );
  } else if (!recommended && !hasDirection && evaluating) {
    recommended = boardOption();
    pool.push(chamberOption(), talkOption(), createOption());
  } else if (hasDirection) {
    if (!recommended) recommended = projectOption();
    pool.push(
      boardOption(),
      {
        destinationId: "calendar",
        title: "Schedule a strategy check-in",
        benefit:
          "A review date keeps the decision alive without turning it into daily pressure.",
        actionLabel: "Choose a review date",
      },
      {
        destinationId: "plan_my_day",
        title: "Put one next action on today",
        benefit:
          "Only the next useful step — not the whole plan — so the day stays doable.",
        actionLabel: "Add to Plan My Day",
      },
      createOption(),
      chamberOption(),
      projectOption(),
    );
  } else if (!recommended) {
    recommended = chamberOption();
    pool.push(talkOption(), boardOption(), createOption());
  } else {
    pool.push(boardOption(), chamberOption(), projectOption(), talkOption());
  }

  const secondary = pool
    .filter((o) => o.destinationId !== recommended?.destinationId)
    .slice(0, maxSecondary);

  return {
    recommended,
    secondary,
    showSeeMore: pool.length > maxSecondary + (recommended ? 1 : 0),
  };
}

function projectOption(): ContinueJourneyOption {
  return {
    destinationId: "project",
    title: "Turn this direction into a project",
    benefit:
      "You have chosen what to pursue. A project can organize the work without changing the strategy you created here.",
    actionLabel: "Start the Project",
  };
}

function boardOption(): ContinueJourneyOption {
  return {
    destinationId: "board",
    title: "Ask the Board to review it",
    benefit:
      "Multiple perspectives can surface blind spots and trade-offs before you commit.",
    actionLabel: "Brief the Board",
  };
}

function chamberOption(): ContinueJourneyOption {
  return {
    destinationId: "chamber_member",
    title: "Consult a Chamber member",
    benefit:
      "A specialist lens can sharpen one part of the question without taking over your decision.",
    actionLabel: "Open the Chamber",
  };
}

function talkOption(): ContinueJourneyOption {
  return {
    destinationId: "talk_it_out",
    title: "Talk it through",
    benefit:
      "Useful when you need reflection more than a structured plan right now.",
    actionLabel: "Open Talk It Out",
  };
}

function createOption(): ContinueJourneyOption {
  return {
    destinationId: "create",
    title: "Create a written brief or summary",
    benefit:
      "Create stays the home for finished assets. Strategy keeps the decision and reasoning.",
    actionLabel: "Open Create",
  };
}
