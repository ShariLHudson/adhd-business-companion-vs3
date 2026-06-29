/**
 * Smooth volume fades for welcome ambience and voice ducking.
 */

function clampVolume(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export type FadeHandle = {
  cancel: () => void;
};

export function fadeAudioVolume(
  audio: HTMLAudioElement,
  target: number,
  durationMs: number,
): FadeHandle {
  const start = audio.volume;
  const startTime = performance.now();
  let frame = 0;
  let cancelled = false;

  const step = (now: number) => {
    if (cancelled) return;
    const t = durationMs <= 0 ? 1 : Math.min(1, (now - startTime) / durationMs);
    audio.volume = clampVolume(start + (target - start) * t);
    if (t < 1) {
      frame = requestAnimationFrame(step);
    }
  };

  frame = requestAnimationFrame(step);

  return {
    cancel: () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    },
  };
}

export function fadeAudioVolumeAsync(
  audio: HTMLAudioElement,
  target: number,
  durationMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    const start = audio.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = durationMs <= 0 ? 1 : Math.min(1, (now - startTime) / durationMs);
      audio.volume = clampVolume(start + (target - start) * t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(step);
  });
}
