import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EVENING_HEARTH_AMBIENCE_MP3,
  GAZEBO_JOURNAL_AMBIENCE_MP3,
  GREENHOUSE_BIRDS_AMBIENCE_MP3,
  COFFEE_HOUSE_AMBIENCE_MP3,
  MUSIC_LOFT_AMBIENCE_MP3,
  OCEAN_CONSERVATORY_AMBIENCE_MP3,
  WELCOME_ROOM_AMBIENCE_MP3,
} from "@/lib/soundscapes/audioAssets";
import {
  ESTATE_AMBIENT_ACCEPTANCE_SEQUENCE,
  GAZEBO_PLACE_ID,
  resolveEstatePlaceAmbientProfile,
} from "./estatePlaceAmbientSound";

describe("estatePlaceAmbientSound", () => {
  it("maps signature places to distinct ambient character", () => {
    const nook = resolveEstatePlaceAmbientProfile("reading-nook");
    const gazebo = resolveEstatePlaceAmbientProfile("gazebo");
    const greenhouse = resolveEstatePlaceAmbientProfile("greenhouse");
    const conservatory = resolveEstatePlaceAmbientProfile("conservatory");
    const butterflyHouse = resolveEstatePlaceAmbientProfile("butterfly-house");

    expect(nook?.src).toBe(EVENING_HEARTH_AMBIENCE_MP3);
    expect(nook?.character).toMatch(/fireplace|page turn/i);
    expect(nook?.layers?.length).toBeGreaterThanOrEqual(2);

    expect(gazebo?.src).toBe(GAZEBO_JOURNAL_AMBIENCE_MP3);
    expect(gazebo?.character).toMatch(/water|gazebo|journal/i);
    expect(gazebo?.layers?.some((l) => l.label.includes("birds"))).toBe(true);

    expect(greenhouse?.src).toBe(GREENHOUSE_BIRDS_AMBIENCE_MP3);
    expect(greenhouse?.character).toMatch(/glasshouse|greenhouse/i);
    expect(greenhouse?.layers?.length).toBeGreaterThanOrEqual(3);

    expect(conservatory).toBeNull();
    expect(butterflyHouse).toBeNull();

    expect(nook?.src).not.toBe(gazebo?.src);
    expect(gazebo?.src).not.toBe(greenhouse?.src);
  });

  it("maps coffee-house and music-room to one canonical src each", () => {
    const coffee = resolveEstatePlaceAmbientProfile("coffee-house");
    const music = resolveEstatePlaceAmbientProfile("music-room");

    expect(coffee?.src).toBe(COFFEE_HOUSE_AMBIENCE_MP3);
    expect(music?.src).toBe(MUSIC_LOFT_AMBIENCE_MP3);
    expect(coffee?.src).not.toBe(music?.src);
  });

  it("maps welcome-home to welcome-room ambience for Room menu Sound on/off", () => {
    const welcome = resolveEstatePlaceAmbientProfile("welcome-home");
    expect(welcome?.src).toBe(WELCOME_ROOM_AMBIENCE_MP3);
    expect(welcome?.character).toMatch(/welcome|hearth|porch/i);
  });

  it("acceptance sequence: Reading Nook → Gazebo → Greenhouse uses three identities", () => {
    const profiles = ESTATE_AMBIENT_ACCEPTANCE_SEQUENCE.map((id) =>
      resolveEstatePlaceAmbientProfile(id),
    );
    expect(profiles).toHaveLength(3);
    expect(profiles.every(Boolean)).toBe(true);

    const srcs = profiles.map((p) => p!.src);
    expect(new Set(srcs).size).toBe(3);
    expect(ESTATE_AMBIENT_ACCEPTANCE_SEQUENCE[1]).toBe(GAZEBO_PLACE_ID);
  });
});

describe("estate ambient transition acceptance", () => {
  const play = vi.fn().mockResolvedValue(undefined);
  const pause = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    play.mockResolvedValue(undefined);

    let now = 0;
    vi.stubGlobal("performance", { now: () => now });
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      now += 700;
      cb(now);
      return 1;
    });

    class MockAudio {
      loop = false;
      preload = "";
      volume = 1;
      currentTime = 0;
      src = "";
      play = play;
      pause = pause;
    }

    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal("window", {
      location: { origin: "http://localhost:3000" },
    });
    vi.stubGlobal("localStorage", {
      getItem: () =>
        JSON.stringify({
          ambienceEnabled: true,
          soundscapeOverlayEnabled: false,
          masterVolume: 0.85,
          silenced: false,
        }),
      setItem: () => {},
    });
  });

  it("crossfades Reading Nook → Gazebo → Greenhouse without overlapping room ids", async () => {
    const { transitionEstatePlaceAmbient, activeEstateAmbienceRoomId } =
      await import("./estateRoomAmbience");

    for (const placeId of ESTATE_AMBIENT_ACCEPTANCE_SEQUENCE) {
      await transitionEstatePlaceAmbient(placeId, { userInitiated: true });
      expect(activeEstateAmbienceRoomId()).toBe(placeId);
      expect(play).toHaveBeenCalled();
    }

    expect(play.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});
