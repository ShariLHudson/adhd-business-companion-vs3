import type { WelcomeRoomSectionId } from "./types";

export const WELCOME_ROOM_INVITATION = {
  headline: "Before we get started…",
  body: "I'd love to welcome you into my sunroom for a few minutes — just to say hello and share why I built this Companion. No rush.",
  visitLabel: "Come in for a minute",
  skipLabel: "Skip for now",
} as const;

export const WELCOME_ROOM_LOGIN_OFFER = {
  message:
    "Whenever you'd like, my Welcome Room is a quiet place to meet me — like coffee in the sunroom.",
  buttonLabel: "Visit the Welcome Room",
  dismissLabel: "Not now",
} as const;

export const WELCOME_ROOM_LEAVE_INVITATION = {
  buttonLabel: "Continue Into the ADHD Business Ecosystem™",
} as const;

/** Exit immersive welcome while audio may still be playing. */
export const WELCOME_ROOM_COMPANION_EXIT = {
  buttonLabel: "← Go to Chat",
} as const;

/** Halfway through the walk — visitor always chooses. Nothing autoplays. */
export const WELCOME_ROOM_PERSONAL_INVITE = {
  lines: [
    "Welcome.",
    "I'm really glad you're here.",
    "Would you like me to personally welcome you?",
  ],
  listenLabel: "▶ Listen",
  readLabel: "📖 Read",
} as const;

/** Opening line after a breath of silence — personal, not narrated. */
export const WELCOME_ROOM_GREETING_SPEECH =
  "Hi... I'm really glad you're here. Come on in." as const;

export const WELCOME_ROOM_VOICE_CONTROLS = {
  play: "Play",
  pause: "Pause",
  stop: "Stop",
  restart: "Restart",
  readWelcome: "Read welcome",
  listenInstead: "Listen instead",
  goToChat: "← Go to Chat",
  stepInside: "Step inside",
  stepInsideHint:
    "When you're ready — come sit with me in the sunroom",
  musicMissing: "Room music file not found — add welcome-room-ambience.mp3",
  muteVoice: "🔇 Mute Shari",
  unmuteVoice: "🔊 Shari On",
  muteMusic: "🔇 Mute Music",
  unmuteMusic: "🔊 Room Ambience On",
  readInstead: "📖 Read instead",
  closeRead: "✕ Close",
  resume: "▶ Resume",
  loading: "Preparing your welcome…",
  playing: "Shari is welcoming you…",
  partialVoice:
    "Only the greeting is cached — run generate-welcome-voice-cache.mjs for the full letter",
  paused: "Paused",
  ended: "Welcome complete",
} as const;

/**
 * One letter — no sections, FAQs, or feature lists.
 * Reads beginning to end like a note left on the table.
 */
export const WELCOME_ROOM_LETTER = {
  paragraphs: [
    "Welcome.",
    "I'm really glad you're here.",
    "Before we jump into anything, I just wanted to take a couple of minutes to welcome you personally.",
    "If you're anything like me, life can feel noisy sometimes. There are ideas pulling at you, unfinished projects, things you meant to do yesterday, and that feeling that your brain is trying to keep track of everything all at once.",
    "I know that feeling because I've lived it.",
    "For a long time, I thought I just needed to try harder, get more organized, or become more disciplined. It wasn't until later in life that I discovered ADHD had been quietly shaping so much of my experience.",
    "That changed everything.",
    "Not because it solved my problems overnight, but because it finally helped me understand why my brain worked the way it did.",
    "As I looked for tools to help, I found plenty of apps that could manage tasks, make lists, or answer questions.",
    "But I couldn't find anything that felt like someone was walking beside me.",
    "I wanted something that understood that some days you need a strategy, some days you need encouragement, and some days you simply need someone to help you untangle everything that's spinning around in your head.",
    "So I decided to build the Companion I wished I'd had.",
    "That's what this place is.",
    "It isn't here to judge you.",
    "It isn't here to tell you you're behind.",
    "It isn't here to remind you of everything you haven't finished.",
    "It's here to help you work with your brain instead of constantly feeling like you're working against it.",
    "As you explore, you'll discover different rooms throughout the Companion. Each one has a purpose. Some help you clear your mind. Others help you focus, plan your day, make decisions, or move your business forward.",
    "You don't have to learn everything today.",
    "There isn't a right place to begin.",
    "We'll simply start with whatever feels most helpful to you right now.",
    "I also want you to know something that's important to me.",
    "This Companion isn't designed to replace human connection.",
    "It's designed to provide a steady, supportive place you can return to whenever you need a little clarity, encouragement, or direction.",
    "Whether you're having an amazing day or one where everything feels upside down, you're welcome here.",
    "Thank you for giving me the opportunity to be part of your journey.",
    "I truly hope this becomes a place that feels familiar, comforting, and genuinely helpful every time you visit.",
    "Whenever you're ready, we'll take the next step together.",
    "I'll meet you in the Companion.",
  ],
} as const;

/** Full letter as one warm conversational narration for ElevenLabs / cache generation. */
export function welcomeRoomLetterSpeechText(): string {
  return WELCOME_ROOM_LETTER.paragraphs.join("\n\n");
}

/** Paragraphs spoken after the greeting clip (skips "Welcome." + glad-you're-here — already in greeting). */
export function welcomeRoomWelcomeBodyParagraphs(): readonly string[] {
  return WELCOME_ROOM_LETTER.paragraphs.slice(2);
}

/** Body after the personal greeting — used for cached/TTS parts. */
export function welcomeRoomWelcomeBodySpeechText(): string {
  return welcomeRoomWelcomeBodyParagraphs().join("\n\n");
}

/** @deprecated Single letter — use WELCOME_ROOM_LETTER */
export const WELCOME_ROOM_GREETING = {
  lines: [
    "Welcome.",
    "I'm really glad you're here.",
    "Before we jump into anything, I just wanted to take a couple of minutes to welcome you personally.",
  ],
} as const;

export type WelcomeRoomFaqItem = {
  question: string;
  answer: string;
};

export type WelcomeRoomContentSection = {
  id: WelcomeRoomSectionId;
  title: string;
  optional?: boolean;
  paragraphs: string[];
  faq?: WelcomeRoomFaqItem[];
};

/** @deprecated Letter is WELCOME_ROOM_LETTER — sections retained for deep-link ids only */
export const WELCOME_ROOM_SECTIONS: readonly WelcomeRoomContentSection[] = [];

export const WELCOME_ROOM_FUTURE_MODULES: readonly import("./types").WelcomeRoomFutureModule[] =
  [
    { id: "bookshelf", label: "Bookshelf stories", implemented: false },
    { id: "photographs", label: "Family photographs", implemented: false },
    { id: "craft-basket", label: "Craft basket", implemented: false },
    { id: "journal", label: "Interactive journal", implemented: false },
    { id: "voice-welcome", label: "Voice welcome", implemented: false },
    { id: "community-wall", label: "Community wall", implemented: false },
    { id: "founder-timeline", label: "Founder's timeline", implemented: false },
    { id: "coffee-with-shari", label: "Coffee with Shari", implemented: false },
  ];
