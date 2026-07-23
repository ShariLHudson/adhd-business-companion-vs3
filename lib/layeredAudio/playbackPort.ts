/**
 * Playback port — engine never stores HTMLAudioElement in React state.
 * Browser uses real Audio; tests inject a mock port.
 */

export type PlaybackHandle = {
  id: string;
  play: () => Promise<void>;
  pause: () => void;
  stopAndRelease: () => void;
  setVolume: (volume: number) => void;
  setLoop: (loop: boolean) => void;
  getCurrentTime: () => number;
  isPaused: () => boolean;
};

export type PlaybackPort = {
  create: (id: string, source: string, loop: boolean) => PlaybackHandle;
};

function createBrowserHandle(
  id: string,
  source: string,
  loop: boolean,
): PlaybackHandle {
  const audio = new Audio();
  audio.preload = "auto";
  audio.loop = loop;
  audio.src = source;
  try {
    audio.load();
  } catch {
    /* ignore */
  }

  return {
    id,
    async play() {
      await audio.play();
    },
    pause() {
      audio.pause();
    },
    stopAndRelease() {
      try {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      } catch {
        /* ignore */
      }
    },
    setVolume(volume: number) {
      audio.volume = Math.max(0, Math.min(1, volume));
    },
    setLoop(next: boolean) {
      audio.loop = next;
    },
    getCurrentTime() {
      return Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    },
    isPaused() {
      return audio.paused;
    },
  };
}

export const browserPlaybackPort: PlaybackPort = {
  create: createBrowserHandle,
};

/** In-memory mock for unit tests — no DOM Audio required. */
export function createMockPlaybackPort(): PlaybackPort & {
  releasedIds: string[];
  volumes: Map<string, number>;
  playing: Set<string>;
} {
  const releasedIds: string[] = [];
  const volumes = new Map<string, number>();
  const playing = new Set<string>();

  return {
    releasedIds,
    volumes,
    playing,
    create(id: string, _source: string, _loop: boolean) {
      volumes.set(id, 0);
      return {
        id,
        async play() {
          playing.add(id);
        },
        pause() {
          playing.delete(id);
        },
        stopAndRelease() {
          playing.delete(id);
          volumes.delete(id);
          releasedIds.push(id);
        },
        setVolume(volume: number) {
          volumes.set(id, volume);
        },
        setLoop() {},
        getCurrentTime() {
          return 0;
        },
        isPaused() {
          return !playing.has(id);
        },
      };
    },
  };
}
