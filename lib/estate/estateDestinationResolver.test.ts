import { describe, expect, it, beforeEach } from "vitest";
import {
  clearPendingNavigationChoices,
  formatEstateDestinationChoiceMenu,
  loadPendingNavigationChoices,
  resolveEstateDestination,
  resolvePendingNavigationChoice,
  savePendingNavigationChoices,
  shouldClearPendingNavigationChoices,
} from "./estateDestinationResolver";
import { evaluateEstatePlaceTurn } from "./estatePlaceNavigation";

describe("resolveEstateDestination", () => {
  it('"garden" returns multiple garden options', () => {
    const result = resolveEstateDestination({ userText: "garden" });
    expect(result.kind).toBe("ambiguous_match");
    if (result.kind !== "ambiguous_match") return;

    const ids = result.choices.map((choice) => choice.destinationId);
    expect(ids).toContain("estate-gardens");
    expect(ids).toContain("gardens");
    expect(ids).toContain("conservatory");
    expect(result.choices.length).toBeGreaterThanOrEqual(2);
    expect(result.choices.length).toBeLessThanOrEqual(4);
  });

  it('"library" returns Estate Library + Personal Library', () => {
    const result = resolveEstateDestination({ userText: "library" });
    expect(result.kind).toBe("ambiguous_match");
    if (result.kind !== "ambiguous_match") return;

    const names = result.choices.map((choice) => choice.displayName);
    expect(names).toContain("Estate Library");
    expect(names).toContain("Personal Library");
  });

  it('"reading nook" returns both reading nooks', () => {
    const result = resolveEstateDestination({ userText: "reading nook" });
    expect(result.kind).toBe("ambiguous_match");
    if (result.kind !== "ambiguous_match") return;

    const ids = result.choices.map((choice) => choice.destinationId);
    expect(ids).toContain("reading-nook");
    expect(ids).toContain("stairway-reading-nook");
  });

  it('"take me to music room" exact routes immediately', () => {
    const result = resolveEstateDestination({
      userText: "take me to music room",
    });
    expect(result.kind).toBe("exact_match");
    if (result.kind !== "exact_match") return;
    expect(result.destinationId).toBe("music-room");
    expect(result.confidence).toBe("high");
  });

  it('"celebration garden" is an exact match', () => {
    const result = resolveEstateDestination({
      userText: "celebration garden",
    });
    expect(result.kind).toBe("exact_match");
    if (result.kind !== "exact_match") return;
    expect(result.destinationId).toBe("gardens");
  });
});

describe("pending navigation choices", () => {
  beforeEach(() => {
    clearPendingNavigationChoices();
  });

  it('"1" after options routes to first choice', () => {
    const resolution = resolveEstateDestination({ userText: "garden" });
    expect(resolution.kind).toBe("ambiguous_match");
    if (resolution.kind !== "ambiguous_match") return;

    const pending = {
      queryPhrase: "garden",
      choices: resolution.choices,
    };
    savePendingNavigationChoices(pending);

    const selected = resolvePendingNavigationChoice("1", pending);
    expect(selected?.destinationId).toBe(resolution.choices[0]!.destinationId);

    const turn = evaluateEstatePlaceTurn({
      userText: "1",
      lastAssistantText: formatEstateDestinationChoiceMenu(resolution),
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe(
        resolution.choices[0]!.destinationId,
      );
    }
  });

  it('"the peaceful one" after garden options routes to Estate Garden', () => {
    const resolution = resolveEstateDestination({ userText: "garden" });
    expect(resolution.kind).toBe("ambiguous_match");
    if (resolution.kind !== "ambiguous_match") return;

    const pending = {
      queryPhrase: "garden",
      choices: resolution.choices,
    };

    const selected = resolvePendingNavigationChoice("the peaceful one", pending);
    expect(selected?.displayName).toBe("Estate Garden");
    expect(selected?.destinationId).toBe("estate-gardens");
  });

  it('"Estate Garden" after garden options routes directly', () => {
    const resolution = resolveEstateDestination({ userText: "garden" });
    expect(resolution.kind).toBe("ambiguous_match");
    if (resolution.kind !== "ambiguous_match") return;

    const pending = {
      queryPhrase: "garden",
      choices: resolution.choices,
    };

    const selected = resolvePendingNavigationChoice("Estate Garden", pending);
    expect(selected?.destinationId).toBe("estate-gardens");
  });

  it('"the personal one" after library options routes to Personal Library', () => {
    const resolution = resolveEstateDestination({ userText: "library" });
    expect(resolution.kind).toBe("ambiguous_match");
    if (resolution.kind !== "ambiguous_match") return;

    const pending = {
      queryPhrase: "library",
      choices: resolution.choices,
    };

    const selected = resolvePendingNavigationChoice("the personal one", pending);
    expect(selected?.displayName).toBe("Personal Library");
    expect(selected?.destinationId).toBe("personal-library");
  });

  it('"nevermind" clears pending choices', () => {
    const resolution = resolveEstateDestination({ userText: "garden" });
    expect(resolution.kind).toBe("ambiguous_match");
    if (resolution.kind !== "ambiguous_match") return;

    savePendingNavigationChoices({
      queryPhrase: "garden",
      choices: resolution.choices,
    });
    expect(loadPendingNavigationChoices()?.choices.length).toBeGreaterThan(0);

    expect(
      shouldClearPendingNavigationChoices("nevermind", true),
    ).toBe(true);

    const turn = evaluateEstatePlaceTurn({
      userText: "nevermind",
      lastAssistantText: formatEstateDestinationChoiceMenu(resolution),
    });
    expect(turn.type).toBe("none");
    expect(loadPendingNavigationChoices()).toBeNull();
  });
});

describe("evaluateEstatePlaceTurn integration", () => {
  beforeEach(() => {
    clearPendingNavigationChoices();
  });

  it('offers choices for bare "garden" instead of blind routing', () => {
    const turn = evaluateEstatePlaceTurn({ userText: "garden" });
    expect(turn.type).toBe("offer");
    if (turn.type !== "offer") return;
    expect(turn.placeIds.length).toBeGreaterThanOrEqual(2);
    expect(turn.line).toMatch(/garden spaces/i);
    expect(turn.line).not.toMatch(/Something got tangled/i);
  });

  it('navigates immediately for "take me to the music room"', () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "take me to the music room",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type !== "navigate") return;
    expect(turn.command.roomId ?? turn.command.entryId).toBe("music-room");
  });
});
