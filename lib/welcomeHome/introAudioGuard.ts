/** Blocks chat TTS / assistant playback during first-visit welcome intro. */

const CHAT_TTS_SELECTOR = "audio[data-spark-chat-tts]";
const INTRO_BLOCK_CHANGE_EVENT = "spark:welcome-home:intro-audio-block-change";

let welcomeHomeIntroAudioBlocked = false;

export function isWelcomeHomeIntroAudioBlocked(): boolean {
  return welcomeHomeIntroAudioBlocked;
}

export function setWelcomeHomeIntroAudioBlocked(blocked: boolean): void {
  if (welcomeHomeIntroAudioBlocked === blocked) return;
  welcomeHomeIntroAudioBlocked = blocked;
  if (blocked) {
    pauseChatAssistantAudio();
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(INTRO_BLOCK_CHANGE_EVENT));
  }
}

/** Re-apply Welcome Home Layer 1 ambience when intro chrome ends. */
export function subscribeWelcomeHomeIntroAudioBlocked(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const onChange = () => listener();
  window.addEventListener(INTRO_BLOCK_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(INTRO_BLOCK_CHANGE_EVENT, onChange);
}

export function pauseChatAssistantAudio(): void {
  if (typeof document === "undefined") return;
  document.querySelectorAll(CHAT_TTS_SELECTOR).forEach((node) => {
    if (node instanceof HTMLAudioElement) {
      node.pause();
      node.currentTime = 0;
    }
  });
}

export function markChatAssistantAudioElement(audio: HTMLAudioElement): void {
  audio.dataset.sparkChatTts = "true";
}
