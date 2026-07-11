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
  buttonLabel: "Continue Into the ADHD Business Ecosystem",
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
  stopRoom: "Stop audio & motion",
  restart: "Restart",
  readWelcome: "Read welcome",
  listenInstead: "Resume listening",
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
  letterRailHint: "Follow along while I read to you",
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
export type WelcomeRoomLetterParagraph = {
  text: string;
  emphasis?: boolean;
};

export const WELCOME_ROOM_LETTER = {
  paragraphs: [
    { text: "Welcome." },
    { text: "I'm really glad you're here.", emphasis: true },
    {
      text: "Before we do anything else, I want to personally welcome you into your Ecosystem.",
    },
    {
      text: "Take a look around for a moment. This sunroom is one of my favorite places because it reminds me to slow down, breathe, and simply enjoy where I am. I hope it becomes a place that feels familiar and comforting to you, too.",
    },
    { text: "If you're anything like me, life can get noisy." },
    { text: "There are probably ideas bouncing around in your head..." },
    { text: "Things you want to remember..." },
    { text: "Projects you haven't finished..." },
    { text: "And probably a few things you've been meaning to do for weeks." },
    {
      text: "Sometimes it can feel like your brain never really gets a chance to rest.",
    },
    { text: "I understand that feeling because I've lived it." },
    {
      text: "I was diagnosed with ADHD when I was 72 years old. Looking back, so many things suddenly made sense. I realized I wasn't lazy, broken, or lacking motivation.",
    },
    {
      text: "My brain simply worked differently, and no one had ever handed me the instruction manual.",
    },
    {
      text: "As I searched for help, I found plenty of apps that could make lists, organize tasks, or answer questions. They were useful, but something was missing.",
    },
    { text: "None of them felt like a trusted companion." },
    {
      text: "I wanted something that could help me think through challenges, encourage me on difficult days, celebrate progress, and gently guide me back whenever I got distracted—without ever making me feel guilty for being human.",
    },
    {
      text: "So I decided to build the Ecosystem I wish I'd had many years ago.",
    },
    { text: "That's what this place is." },
    {
      text: "You'll notice there are different rooms throughout the Ecosystem. Each one has its own purpose. Some are designed to help you clear your mind. Others help you plan your day, stay focused, make decisions, learn something new, create, or move your business forward.",
    },
    { text: "You don't need to learn everything today." },
    { text: "You don't have to use every room." },
    { text: "Simply use whatever helps you most in the moment." },
    {
      text: "One thing that's very important to me is that this Ecosystem never makes you feel behind.",
    },
    { text: "Life happens." },
    { text: "Energy changes." },
    { text: "Motivation comes and goes." },
    {
      text: "Some days you'll accomplish amazing things, and other days just showing up is enough.",
    },
    { text: "Both kinds of days are welcome here." },
    {
      text: "You'll also discover places that don't ask anything of you at all. Peaceful places where you can simply sit, listen to the rain, watch butterflies drift through a conservatory, relax by a crackling fire, or enjoy a quiet moment before jumping back into your day.",
    },
    {
      text: "Because sometimes the most important thing we can do isn't accomplish more...",
    },
    { text: "It's simply take a moment to breathe." },
    { text: "My hope is that this becomes more than an app." },
    {
      text: "I hope it becomes a place you genuinely enjoy visiting—a place where you feel understood, encouraged, and supported.",
    },
    {
      text: "A place that helps you move forward one small step at a time.",
    },
    { text: "So, take your time." },
    { text: "There's no rush." },
    {
      text: "Whenever you're ready, we'll take the next step together.",
    },
    {
      text: "And thank you for giving me the opportunity to be part of your journey.",
    },
    { text: "I'll see you again soon." },
  ] satisfies readonly WelcomeRoomLetterParagraph[],
} as const;

export function welcomeRoomLetterParagraphText(
  paragraph: WelcomeRoomLetterParagraph,
): string {
  return paragraph.text;
}

/** Full letter as one warm conversational narration for ElevenLabs / cache generation. */
export function welcomeRoomLetterSpeechText(): string {
  return WELCOME_ROOM_LETTER.paragraphs
    .map(welcomeRoomLetterParagraphText)
    .join("\n\n");
}

/** Paragraphs spoken after the greeting clip (skips Welcome + glad-you're-here). */
export function welcomeRoomWelcomeBodyParagraphs(): readonly string[] {
  return WELCOME_ROOM_LETTER.paragraphs
    .slice(2)
    .map(welcomeRoomLetterParagraphText);
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
    "Before we do anything else, I want to personally welcome you into your Ecosystem.",
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
