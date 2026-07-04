/**
 * Procedural gazebo atmosphere when MP3 plates are absent.
 * Water · breeze · distant birds · soft piano — calm, never arcade.
 */

type AmbienceStop = () => void;

let activeStop: AmbienceStop | null = null;

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch += 1) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.96 + white * 0.12;
      data[i] = last;
    }
  }
  return buffer;
}

export function startJournalGazeboSyntheticAmbience(): AmbienceStop | null {
  if (typeof window === "undefined") return null;
  if (activeStop) return activeStop;

  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;

  let ctx: AudioContext;
  try {
    ctx = new Ctx();
  } catch {
    return null;
  }

  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);

  const fadeIn = () => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.exponentialRampToValueAtTime(1, now + 3.2);
  };

  // Waterfall — filtered noise loop
  const waterNoise = ctx.createBufferSource();
  waterNoise.buffer = createNoiseBuffer(ctx, 4);
  waterNoise.loop = true;
  const waterFilter = ctx.createBiquadFilter();
  waterFilter.type = "lowpass";
  waterFilter.frequency.value = 420;
  const waterGain = ctx.createGain();
  waterGain.gain.value = 0.11;
  waterNoise.connect(waterFilter);
  waterFilter.connect(waterGain);
  waterGain.connect(master);

  // Breeze — airy high band
  const breezeNoise = ctx.createBufferSource();
  breezeNoise.buffer = createNoiseBuffer(ctx, 6);
  breezeNoise.loop = true;
  const breezeFilter = ctx.createBiquadFilter();
  breezeFilter.type = "highpass";
  breezeFilter.frequency.value = 1800;
  const breezeGain = ctx.createGain();
  breezeGain.gain.value = 0.028;
  breezeNoise.connect(breezeFilter);
  breezeFilter.connect(breezeGain);
  breezeGain.connect(master);

  // Soft piano — sparse pentatonic tones
  const pianoGain = ctx.createGain();
  pianoGain.gain.value = 0.07;
  pianoGain.connect(master);
  const pianoNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
  let pianoTimer: number | null = null;

  const playPianoNote = () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value =
      pianoNotes[Math.floor(Math.random() * pianoNotes.length)] ?? 329.63;
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.35, now + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
    osc.connect(noteGain);
    noteGain.connect(pianoGain);
    osc.start(now);
    osc.stop(now + 3);
  };

  const schedulePiano = () => {
    playPianoNote();
    pianoTimer = window.setTimeout(
      schedulePiano,
      4200 + Math.random() * 5200,
    );
  };

  // Distant birds — brief chirps
  let birdTimer: number | null = null;
  const playBird = () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800 + Math.random() * 600, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.06);
    const birdGain = ctx.createGain();
    birdGain.gain.setValueAtTime(0.0001, now);
    birdGain.gain.exponentialRampToValueAtTime(0.045, now + 0.02);
    birdGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(birdGain);
    birdGain.connect(master);
    osc.start(now);
    osc.stop(now + 0.16);
  };

  const scheduleBird = () => {
    if (Math.random() > 0.35) playBird();
    birdTimer = window.setTimeout(scheduleBird, 2800 + Math.random() * 4000);
  };

  const start = () => {
    void ctx.resume().then(() => {
      waterNoise.start();
      breezeNoise.start();
      fadeIn();
      schedulePiano();
      scheduleBird();
    });
  };

  start();
  window.addEventListener("pointerdown", start, { once: true });

  const stop: AmbienceStop = () => {
    window.removeEventListener("pointerdown", start);
    if (pianoTimer) window.clearTimeout(pianoTimer);
    if (birdTimer) window.clearTimeout(birdTimer);
    try {
      waterNoise.stop();
      breezeNoise.stop();
      void ctx.close();
    } catch {
      /* already stopped */
    }
    if (activeStop === stop) activeStop = null;
  };

  activeStop = stop;
  return stop;
}

export function stopJournalGazeboSyntheticAmbience(): void {
  activeStop?.();
}
