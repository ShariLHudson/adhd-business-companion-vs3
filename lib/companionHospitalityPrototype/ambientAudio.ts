import type { AmbientAudioId } from "./types";

type AmbientHandle = {
  stop: () => void;
};

function createNoise(ctx: AudioContext, gain: GainNode, color: "pink" | "brown") {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (color === "pink") {
      last = 0.98 * last + 0.02 * white;
      data[i] = last * 3.5;
    } else {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 4;
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gain);
  source.start();
  return source;
}

function scheduleBirdChirp(ctx: AudioContext, master: GainNode) {
  const tick = () => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 1800 + Math.random() * 900;
    g.gain.value = 0;
    osc.connect(g);
    g.connect(master);
    const now = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.012, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.2);
    window.setTimeout(tick, 4000 + Math.random() * 8000);
  };
  const id = window.setTimeout(tick, 1200);
  return () => window.clearTimeout(id);
}

function scheduleChime(ctx: AudioContext, master: GainNode) {
  const tick = () => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 620 + Math.random() * 280;
    g.gain.value = 0;
    osc.connect(g);
    g.connect(master);
    const now = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.01, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    osc.start(now);
    osc.stop(now + 2);
    window.setTimeout(tick, 12000 + Math.random() * 18000);
  };
  const id = window.setTimeout(tick, 3000);
  return () => window.clearTimeout(id);
}

function scheduleThunder(ctx: AudioContext, master: GainNode) {
  const tick = () => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 48;
    g.gain.value = 0;
    osc.connect(g);
    g.connect(master);
    const now = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.02, now + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    osc.start(now);
    osc.stop(now + 1.5);
    window.setTimeout(tick, 28000 + Math.random() * 40000);
  };
  const id = window.setTimeout(tick, 15000);
  return () => window.clearTimeout(id);
}

function scheduleClock(ctx: AudioContext, master: GainNode) {
  const tick = () => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 800;
    g.gain.value = 0;
    osc.connect(g);
    g.connect(master);
    const now = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.004, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.1);
    window.setTimeout(tick, 30000);
  };
  const id = window.setTimeout(tick, 5000);
  return () => window.clearTimeout(id);
}

export function startAmbientHospitalityAudio(
  layers: AmbientAudioId[],
  enabled: boolean,
): AmbientHandle {
  if (!enabled || layers.length === 0 || typeof window === "undefined") {
    return { stop: () => {} };
  }

  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);

  const cleanups: Array<() => void> = [];
  const sources: AudioBufferSourceNode[] = [];

  if (layers.includes("rain")) {
    const g = ctx.createGain();
    g.gain.value = 0.18;
    g.connect(master);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const src = createNoise(ctx, filter, "pink");
    filter.connect(g);
    sources.push(src);
  }

  if (layers.includes("wind") || layers.includes("fireplace")) {
    const g = ctx.createGain();
    g.gain.value = layers.includes("fireplace") ? 0.12 : 0.08;
    g.connect(master);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = layers.includes("fireplace") ? 220 : 400;
    const src = createNoise(ctx, filter, "brown");
    filter.connect(g);
    sources.push(src);
  }

  if (layers.includes("birds")) {
    cleanups.push(scheduleBirdChirp(ctx, master));
  }
  if (layers.includes("wind-chimes")) {
    cleanups.push(scheduleChime(ctx, master));
  }
  if (layers.includes("thunder")) {
    cleanups.push(scheduleThunder(ctx, master));
  }
  if (layers.includes("clock")) {
    cleanups.push(scheduleClock(ctx, master));
  }

  void ctx.resume();

  let stopped = false;

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      cleanups.forEach((fn) => fn());
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* already stopped */
        }
      });
      if (ctx.state !== "closed") {
        void ctx.close();
      }
    },
  };
}
