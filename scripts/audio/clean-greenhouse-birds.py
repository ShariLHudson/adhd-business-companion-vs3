"""Estate birds ambience — gentle cleanup + seamless loop seam.

Used for Greenhouse™, Conservatory™, garden-path, and clear-my-mind Layer 1 audio.
Targets: rumble/thumps louder than birdsong, loop clicks, harsh transients.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

import librosa
import noisereduce as nr
import numpy as np
import soundfile as sf
from imageio_ffmpeg import get_ffmpeg_exe
from scipy.signal import butter, filtfilt, iirnotch

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE = ROOT / "public/audio/nils_vega-birds-singing-in-early-summer-359446.mp3"
REFINE_SOURCE = ROOT / "public/audio/greenhouse-birds-ambience.mp3"
OUTPUT_WAV = ROOT / "public/audio/greenhouse-birds-ambience-clean.wav"
OUTPUT_MP3 = ROOT / "public/audio/greenhouse-birds-ambience.mp3"

TARGET_SR = 44_100
CLIP_SECONDS = 56.0
LOOP_CROSSFADE_SECONDS = 1.75


def highpass(y: np.ndarray, sr: int, cutoff_hz: float = 90.0) -> np.ndarray:
    nyq = sr * 0.5
    b, a = butter(2, cutoff_hz / nyq, btype="high")
    return filtfilt(b, a, y)


def lowpass(y: np.ndarray, sr: int, cutoff_hz: float = 13_500.0) -> np.ndarray:
    nyq = sr * 0.5
    if cutoff_hz >= nyq:
        return y
    b, a = butter(2, cutoff_hz / nyq, btype="low")
    return filtfilt(b, a, y)


def notch(y: np.ndarray, sr: int, freq_hz: float, q: float = 28.0) -> np.ndarray:
    w0 = freq_hz / (sr * 0.5)
    if w0 >= 1.0:
        return y
    b, a = iirnotch(w0, q)
    return filtfilt(b, a, y)


def trim_to_clip(y: np.ndarray, sr: int, *, refine: bool) -> np.ndarray:
    """Skip noisy head/tail — keep a steady middle birdsong section."""
    clip_samples = int(CLIP_SECONDS * sr)
    if len(y) <= clip_samples:
        return y
    head_skip = 1.2 * sr if refine else 3.5 * sr
    start = int(head_skip)
    end = start + clip_samples
    if end > len(y):
        start = max(0, len(y) - clip_samples)
        end = len(y)
    return y[start:end]


def soften_loud_transients(y: np.ndarray, threshold_db: float = -20.0) -> np.ndarray:
    """Duck sharp bangs/clicks that sit above the birdsong bed."""
    rms = float(np.sqrt(np.mean(y**2))) or 1e-9
    threshold = rms * (10 ** (threshold_db / 20))
    out = y.copy()
    mask = np.abs(out) > threshold
    if not np.any(mask):
        return out
    excess = np.abs(out[mask]) - threshold
    out[mask] = np.sign(out[mask]) * (threshold + excess * 0.28)
    return out


def soften_loop_seam(y: np.ndarray, sr: int) -> np.ndarray:
    """Blend loop boundary so HTMLAudioElement loop does not click."""
    fade_samples = int(LOOP_CROSSFADE_SECONDS * sr)
    if len(y) <= fade_samples * 3:
        return y

    fade_in = np.linspace(0.0, 1.0, fade_samples)
    fade_out = fade_in[::-1]
    head = y[:fade_samples]
    tail = y[-fade_samples:]
    seam = head * fade_out + tail * fade_in
    out = y.copy()
    out[:fade_samples] = seam
    out[-fade_samples:] = seam
    return out


def process(y: np.ndarray, sr: int, *, refine: bool) -> np.ndarray:
    y = trim_to_clip(y, sr, refine=refine)
    y = highpass(y, sr, 115.0 if refine else 95.0)
    for freq in (60.0, 120.0, 180.0):
        y = notch(y, sr, freq, q=22.0)

    noise_clip = y[: int(min(3.0 * sr, len(y) * 0.1))]
    y = nr.reduce_noise(
        y=y,
        y_noise=noise_clip,
        sr=sr,
        stationary=True,
        prop_decrease=0.52 if refine else 0.45,
        n_fft=2048,
        hop_length=512,
    )
    y = soften_loud_transients(y, threshold_db=-22.0 if refine else -20.0)
    y = lowpass(y, sr, 12_800.0 if refine else 13_200.0)
    y = soften_loop_seam(y, sr)

    peak = np.max(np.abs(y)) or 1.0
    y = y / peak * (0.68 if refine else 0.74)
    return y


def resolve_input(path: Path | None, refine: bool) -> Path:
    if path and path.exists():
        return path
    if refine and REFINE_SOURCE.exists():
        return REFINE_SOURCE
    if DEFAULT_SOURCE.exists():
        return DEFAULT_SOURCE
    if REFINE_SOURCE.exists():
        return REFINE_SOURCE
    raise FileNotFoundError(
        f"No birds source found. Expected {DEFAULT_SOURCE} or {REFINE_SOURCE}",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Clean estate birds ambience loop")
    parser.add_argument(
        "--input",
        type=Path,
        default=None,
        help="Source audio (defaults to nils_vega or existing greenhouse loop)",
    )
    parser.add_argument(
        "--refine",
        action="store_true",
        help="Second-pass on existing greenhouse-birds-ambience.mp3",
    )
    args = parser.parse_args()

    try:
        input_path = resolve_input(args.input, args.refine)
    except FileNotFoundError as exc:
        print(exc, file=sys.stderr)
        return 1

    y, _ = librosa.load(input_path, sr=TARGET_SR, mono=True)
    print(
        f"loaded {input_path.name}: {len(y) / TARGET_SR:.1f}s @ {TARGET_SR}Hz"
        f"{' (refine)' if args.refine else ''}",
    )

    y = process(y, TARGET_SR, refine=args.refine)

    OUTPUT_WAV.parent.mkdir(parents=True, exist_ok=True)
    sf.write(OUTPUT_WAV, y, TARGET_SR, subtype="PCM_16")
    print(f"wrote {OUTPUT_WAV}")

    ffmpeg = get_ffmpeg_exe()
    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(OUTPUT_WAV),
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "192k",
            str(OUTPUT_MP3),
        ],
        check=True,
        capture_output=True,
    )
    print(f"wrote {OUTPUT_MP3}")

    OUTPUT_WAV.unlink(missing_ok=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
