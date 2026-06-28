const MAX_MY_PLACE_AUDIO_BYTES = 8 * 1024 * 1024;

export function isMyPlaceAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  return /\.(mp3|wav|ogg|m4a|aac|flac|webm)(\?|$)/i.test(file.name);
}

/** Persist a user-selected audio file as a data URL for My Places playback. */
export function readMyPlaceAudioFile(file: File): Promise<string> {
  if (!isMyPlaceAudioFile(file)) {
    return Promise.reject(new Error("Please choose an audio file."));
  }
  if (file.size > MAX_MY_PLACE_AUDIO_BYTES) {
    return Promise.reject(
      new Error("That file is a bit large. Try a shorter clip or paste a link instead."),
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.startsWith("data:audio/")) {
        reject(new Error("Could not read that audio file."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Could not read that audio file."));
    };
    reader.readAsDataURL(file);
  });
}
