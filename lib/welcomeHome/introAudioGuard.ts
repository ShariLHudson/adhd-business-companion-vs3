/** Blocks chat TTS / assistant playback during first-visit welcome intro. */

const CHAT_TTS_SELECTOR = "audio[data-spark-chat-tts]";

let welcomeHomeIntroAudioBlocked = false;

export function isWelcomeHomeIntroAudioBlocked(): boolean {
  return welcomeHomeIntroAudioBlocked;
}

export function setWelcomeHomeIntroAudioBlocked(blocked: boolean): void {
  welcomeHomeIntroAudioBlocked = blocked;
  if (blocked) {
    pauseChatAssistantAudio();
  }
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
