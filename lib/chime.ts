// A short, gentle two-note chime via the Web Audio API — no audio asset
// needed. Browsers require a user gesture before audio can play, so call
// unlockChime() once on first interaction, then playChime() any time.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function unlockChime() {
  ensureCtx();
}

// Spinning-wheel audio: decelerating ticks that build tension, then a result
// "ding". Returns the approximate duration (ms) so the UI can sync its reveal.
export function playSpin(): number {
  const ctx = ensureCtx();
  if (!ctx) return 2600;
  try {
    const start = ctx.currentTime + 0.02; // tiny lead-in so nothing is clipped
    // Immediate "launch" — a quick rising whoosh the instant the wheel starts,
    // so the audio is unmistakably tied to the spin action (not just the end).
    {
      const sweep = ctx.createOscillator();
      const sg = ctx.createGain();
      sweep.type = "sawtooth";
      sweep.frequency.setValueAtTime(200, start);
      sweep.frequency.exponentialRampToValueAtTime(900, start + 0.18);
      sweep.connect(sg);
      sg.connect(ctx.destination);
      sg.gain.setValueAtTime(0.0001, start);
      sg.gain.exponentialRampToValueAtTime(0.16, start + 0.03);
      sg.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      sweep.start(start);
      sweep.stop(start + 0.25);
    }
    let t = start;
    let gap = 0.045;
    while (t < start + 2.4) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 1200;
      osc.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.11, t + 0.002); // louder so the start is clearly heard
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      osc.start(t);
      osc.stop(t + 0.05);
      t += gap;
      gap *= 1.07; // slow down for tension
    }
    const dingT = start + 2.55;
    [880, 1320].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(g);
      g.connect(ctx.destination);
      const tt = dingT + i * 0.09;
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(0.2, tt + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.4);
      osc.start(tt);
      osc.stop(tt + 0.45);
    });
  } catch {
    /* audio unavailable */
  }
  return 2600;
}

// Focus-session complete — a warm rising major arpeggio (C-E-G-C) that resolves
// upward. Deliberately DISTINCT from the time-block wind chime and the spin
// ticks, so each sound teaches the user what just happened.
export function playFocusComplete() {
  const c = ensureCtx();
  if (!c) return;
  try {
    const master = c.createGain();
    master.gain.value = 0.32;
    master.connect(c.destination);
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 · E5 · G5 · C6
    const start = c.currentTime;
    notes.forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      osc.connect(g);
      g.connect(master);
      const t = start + i * 0.13;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      osc.start(t);
      osc.stop(t + 0.75);
    });
  } catch {
    /* audio unavailable */
  }
}

/**
 * Short polished result bell when the Decision Wheel stops.
 * Distinct from playSpin's tick bed and playChime's wind shimmer.
 */
export function playDecisionResultChime() {
  const c = ensureCtx();
  if (!c) return;
  try {
    const start = c.currentTime + 0.01;
    const master = c.createGain();
    master.gain.value = 0.28;
    master.connect(c.destination);
    // Soft estate bell: G5 → D6
    const notes = [
      { f: 783.99, t: 0, peak: 0.32, decay: 0.9 },
      { f: 1174.66, t: 0.12, peak: 0.26, decay: 1.1 },
    ];
    for (const note of notes) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.value = note.f;
      osc.connect(g);
      g.connect(master);
      const t = start + note.t;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(note.peak, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + note.decay);
      osc.start(t);
      osc.stop(t + note.decay + 0.05);
    }
  } catch {
    /* audio unavailable */
  }
}

export function playChime() {
  const audio = ensureCtx();
  if (!audio) return;
  try {
    const c = audio;
    const master = c.createGain();
    master.gain.value = 0.4;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 6500;
    master.connect(lp);
    lp.connect(c.destination);

    // C major pentatonic across two octaves — any order sounds harmonious,
    // like a real wind chime.
    const NOTES = [
      523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98,
    ];

    // Slightly inharmonic metallic partials; the highs shimmer then fade fast.
    const PARTIALS: { ratio: number; gain: number; decay: number }[] = [
      { ratio: 1, gain: 0.5, decay: 2.8 },
      { ratio: 2.76, gain: 0.18, decay: 1.2 },
      { ratio: 5.2, gain: 0.08, decay: 0.5 },
    ];

    function strike(freq: number, t: number, vel: number) {
      for (const p of PARTIALS) {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "sine";
        osc.frequency.value = freq * p.ratio;
        osc.connect(g);
        g.connect(master);
        const peak = Math.max(0.0005, p.gain * vel);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.005); // ping attack
        g.gain.exponentialRampToValueAtTime(0.0001, t + p.decay); // long shimmer
        osc.start(t);
        osc.stop(t + p.decay + 0.05);
      }
    }

    // Several overlapping notes struck in a random order with random timing
    // and loudness — that randomness is what makes it feel like wind.
    const start = c.currentTime;
    const strikes = 7;
    for (let i = 0; i < strikes; i++) {
      const freq = NOTES[Math.floor(Math.random() * NOTES.length)] ?? 783.99;
      const t = start + Math.random() * 1.4;
      const vel = 0.5 + Math.random() * 0.5;
      strike(freq, t, vel);
    }
  } catch {
    /* audio unavailable */
  }
}
