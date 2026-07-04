/**
 * Estate ritual sounds — Web Audio, no assets required. Fails silent.
 */

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedCtx) return sharedCtx;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  try {
    sharedCtx = new Ctx();
    return sharedCtx;
  } catch {
    return null;
  }
}

function runWhenReady(fn: (ctx: AudioContext, now: number) => void): void {
  const ctx = getContext();
  if (!ctx) return;
  const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
  void resume.then(() => fn(ctx, ctx.currentTime));
}

function noiseBurst(
  ctx: AudioContext,
  now: number,
  opts: {
    duration: number;
    peak: number;
    freq: number;
    q?: number;
    type?: BiquadFilterType;
  },
): void {
  const { duration, peak, freq, q = 0.65, type = "bandpass" } = opts;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    const t = i / bufferSize;
    const env = Math.sin(Math.PI * t) * (1 - t * 0.3);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration);
}

/** Soft paper page turn. */
export function playJournalPageTurnSound(): void {
  runWhenReady((ctx, now) => {
    noiseBurst(ctx, now, { duration: 0.38, peak: 0.14, freq: 820 });
  });
}

/** Paper rustle — envelope flex, letter lift. */
export function playPaperRustleSound(): void {
  runWhenReady((ctx, now) => {
    noiseBurst(ctx, now, { duration: 0.52, peak: 0.1, freq: 640, q: 0.5 });
  });
}

/** Wax seal touched / flap release. */
export function playWaxTouchSound(): void {
  runWhenReady((ctx, now) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.18);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
    noiseBurst(ctx, now + 0.04, { duration: 0.12, peak: 0.05, freq: 420, type: "lowpass" });
  });
}

/** Leather journal creak — cover close / arrive. */
export function playLeatherCreakSound(): void {
  runWhenReady((ctx, now) => {
    noiseBurst(ctx, now, { duration: 0.55, peak: 0.09, freq: 220, q: 1.1, type: "lowpass" });
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.4);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.52);
  });
}

/** Fountain pen on paper — dedication / writing focus. */
export function playPenScratchSound(): void {
  runWhenReady((ctx, now) => {
    noiseBurst(ctx, now, { duration: 0.22, peak: 0.055, freq: 2400, q: 0.8, type: "highpass" });
  });
}

/** Gold title pressing into leather. */
export function playEmbossSound(): void {
  runWhenReady((ctx, now) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
    noiseBurst(ctx, now + 0.08, { duration: 0.18, peak: 0.04, freq: 1800, q: 0.9, type: "highpass" });
  });
}
