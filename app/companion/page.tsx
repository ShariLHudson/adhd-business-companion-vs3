"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppSidebar } from "@/components/companion/AppSidebar";
import { AdjustMyDayPanel } from "@/components/companion/AdjustMyDayPanel";
import { BrainDumpPanel } from "@/components/companion/BrainDumpPanel";
import { BreathePanel } from "@/components/companion/BreathePanel";
import { StrategiesPanel } from "@/components/companion/StrategiesPanel";
import { ChatInputBar } from "@/components/companion/ChatInputBar";
import { CompanionBackground } from "@/components/companion/CompanionBackground";
import { FocusActiveBar } from "@/components/companion/FocusActiveBar";
import { FocusAreaPanel } from "@/components/companion/FocusAreaPanel";
import { GamesPanel } from "@/components/companion/GamesPanel";
import { SpinWheelPanel } from "@/components/companion/SpinWheelPanel";
import { FocusAudioPanel } from "@/components/companion/FocusAudioPanel";
import { FocusTimerPanel } from "@/components/companion/FocusTimerPanel";
import { IdentityBar } from "@/components/companion/IdentityBar";
import { ProfilePanel } from "@/components/companion/ProfilePanel";
import { ModalSheet } from "@/components/companion/ModalSheet";
import { EmailGeneratorPanel } from "@/components/companion/EmailGeneratorPanel";
import { SnippetsLibrary } from "@/components/companion/SnippetsLibrary";
import { ProgressPanel } from "@/components/companion/ProgressPanel";
import { BusinessProfilePanel } from "@/components/companion/BusinessProfilePanel";
import { IdealClientBuilder } from "@/components/companion/IdealClientBuilder";
import { OnboardingFlow } from "@/components/companion/OnboardingFlow";
import { ContentTypesPanel } from "@/components/companion/ContentTypesPanel";
import {
  ContentGeneratorPanel,
  type GenSeed,
} from "@/components/companion/ContentGeneratorPanel";
import { ProjectsPanel } from "@/components/companion/ProjectsPanel";
import { SettingsPanel } from "@/components/companion/SettingsPanel";
import { TemplatesLibrary } from "@/components/companion/TemplatesLibrary";
import { TimeBlockPanel } from "@/components/companion/TimeBlockPanel";
import { TimeBlockTrigger } from "@/components/companion/TimeBlockTrigger";
import { TopBar } from "@/components/companion/TopBar";
import { SimpleChat } from "@/components/companion/SimpleChat";
import {
  detectEmotionalState,
  EMOTION_LABELS,
  type EmotionalState,
} from "@/lib/companionEmotions";
import {
  EMOTION_SHELL_CLASS,
  getStateHint,
} from "@/lib/companionStateHint";
import { usePomodoroTimer } from "@/lib/usePomodoroTimer";
import {
  MODE_FEEDBACK,
  SECTION_NAV,
  type AppSection,
  type SidebarNavId,
  type SidebarToolId,
} from "@/lib/companionUi";
import { type CoachingMode } from "@/lib/companionPrompt";
import {
  blockDateTime,
  clearConversation,
  createTemplate,
  dayStateSummary,
  getDayState,
  getPrefs,
  getTimeBlocks,
  loadConversation,
  saveConversation,
  setBlockStatus,
  snoozeBlock,
  todayStr,
  logMomentum,
  businessContextSummary,
  getVoiceStatus,
  addVoiceSeconds,
  type TimeBlock,
} from "@/lib/companionStore";
import { playChime, unlockChime } from "@/lib/chime";
import { type ScenePage } from "@/lib/companionBackgrounds";
import "./companion.css";

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { isFinal: boolean; 0: { transcript: string } };
  };
};

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

function presenceDelay() {
  return new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 400),
  );
}

function toApiMessages(messages: Message[]): Message[] {
  return messages.filter((m) => m.role === "user" || m.role === "assistant");
}

function energyOpeningLine(block: TimeBlock): string {
  if (block.energy === "low") {
    return `It's time for "${block.title}". This might feel heavy right now — want to start with 2 minutes of easing in?`;
  }
  if (block.energy === "high") {
    return `It's time for "${block.title}". Perfect timing — want to jump straight in?`;
  }
  return `It's time for "${block.title}". Want to take the first small step together?`;
}

function formatAssistantParagraphs(content: string): string[] {
  return content
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Choose which organic scene family fits what the person is talking about.
// The actual image within a family is then chosen by time of day.
function sceneForContext(
  emotion: EmotionalState,
  section: AppSection,
): ScenePage {
  // Tool sections have a natural scene regardless of mood.
  if (
    section === "focus-timer" ||
    section === "focus-audio" ||
    section === "breathe"
  ) {
    return "focus";
  }
  if (section === "playbook" || section === "projects") {
    return "business";
  }
  // Otherwise follow the emotional topic.
  switch (emotion) {
    case "emotional":
    case "overwhelmed":
      return "recovery";
    case "focused":
      return "focus";
    case "building":
      return "business";
    case "stuck":
      return "recovery";
    default:
      return "today";
  }
}

export default function CompanionPage() {
  const [activeSection, setActiveSection] = useState<AppSection>("home");
  const [activeNav, setActiveNav] = useState<SidebarNavId>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  // True once we've restored any saved conversation from localStorage.
  // Gates the autosave effect so we never overwrite a saved chat with [].
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [coachingMode, setCoachingMode] = useState<CoachingMode>("today");
  const [emotion, setEmotion] = useState<EmotionalState>("unclear");
  const [photoError, setPhotoError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  // Category to pre-select when Focus Audio opens.
  const [focusAudioCategory, setFocusAudioCategory] = useState<string | null>(
    null,
  );
  // A time block whose start time has arrived (shows the trigger popup).
  const [triggeredBlock, setTriggeredBlock] = useState<TimeBlock | null>(null);
  // A time block starting in ~15 minutes (shows a gentle heads-up toast).
  const [warning, setWarning] = useState<TimeBlock | null>(null);
  const warnedRef = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseInputRef = useRef("");
  const voiceUsedRef = useRef(false);
  const pomodoroTimer = usePomodoroTimer();

  const isIdle = !messages.some((m) => m.role === "user");

  const liveEmotion = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const signal = input.trim() || lastUser?.content || "";
    return detectEmotionalState(signal);
  }, [input, messages]);

  const displayEmotion = isIdle ? liveEmotion : emotion;
  const stateHint = getStateHint(displayEmotion);
  const shellClass = EMOTION_SHELL_CLASS[displayEmotion];

  // Organic background. The engine layers in time of day; here we pick the
  // scene family + seed per context:
  //  • Chat/home — locked to the conversation (its first message) so the
  //    backdrop stays put throughout and never shifts while the person types.
  //  • Brain dump — follows what they're writing.
  //  • Tool screens — their own calm scene.
  const firstUserMessage = messages.find((m) => m.role === "user")?.content;
  let scenePage: ScenePage;
  let sceneSeed: string;
  if (activeSection === "brain-dump") {
    // Calm and fixed — the backdrop should never shift while they type.
    scenePage = "recovery";
    sceneSeed = "brain-dump";
  } else if (activeSection === "home") {
    const convoEmotion = firstUserMessage
      ? detectEmotionalState(firstUserMessage)
      : "unclear";
    scenePage = sceneForContext(convoEmotion, "home");
    sceneSeed = firstUserMessage ?? "home";
  } else {
    scenePage = sceneForContext(displayEmotion, activeSection);
    sceneSeed = activeSection;
  }

  useEffect(() => {
    if (activeSection === "home") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, activeSection]);

  // Restore a saved conversation on first load (crash / reload insurance).
  useEffect(() => {
    const saved = loadConversation();
    if (saved && saved.length > 0) {
      setMessages(saved);
    }
    setHydrated(true);
  }, []);

  // Local-first autosave: persist the conversation whenever it changes, but
  // only after hydration so we don't clobber a saved chat with the empty
  // initial state.
  useEffect(() => {
    if (!hydrated) return;
    saveConversation(messages);
  }, [messages, hydrated]);

  // Universal back navigation — remembers the section you came from so every
  // screen has a way out (falls back to the chat/home dashboard).
  const sectionHistoryRef = useRef<AppSection[]>([]);
  const prevSectionRef = useRef<AppSection>(activeSection);
  const goingBackRef = useRef(false);

  useEffect(() => {
    if (prevSectionRef.current === activeSection) return;
    if (goingBackRef.current) {
      goingBackRef.current = false;
    } else {
      sectionHistoryRef.current.push(prevSectionRef.current);
    }
    prevSectionRef.current = activeSection;
  }, [activeSection]);

  // Settings / Profile open as modal sheets on top of the app (not pages).
  const [overlay, setOverlay] = useState<null | "settings" | "profile">(null);

  // Voice output — Shari speaks her replies (ElevenLabs).
  const [voiceOutput, setVoiceOutput] = useState(false);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (!getPrefs().onboarded) setShowOnboarding(true);
  }, []);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  async function playTTS(text: string) {
    // Voice is metered per plan. Out of minutes → don't spend the API call.
    const vs = getVoiceStatus();
    if (!vs.hasVoice || vs.leftMin <= 0) {
      setVoiceOutput(false);
      setVoiceBlocked(true);
      return;
    }
    try {
      ttsAudioRef.current?.pause();
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.onended = () => {
        addVoiceSeconds(audio.duration || 0);
        URL.revokeObjectURL(url);
      };
      void audio.play();
    } catch {
      /* voice optional */
    }
  }

  // The content generator opens prefilled from a template or a content type.
  const [genSeed, setGenSeed] = useState<GenSeed>(null);
  function openGenerator(seed: GenSeed) {
    setGenSeed(seed);
    setActiveSection("content-generator");
  }

  // A panel can register an in-screen back handler (e.g. close an open detail).
  // If it handles the press (returns true), we don't leave the section yet.
  const backInterceptorRef = useRef<(() => boolean) | null>(null);
  const registerBack = useCallback((fn: (() => boolean) | null) => {
    backInterceptorRef.current = fn;
  }, []);

  function goBack() {
    if (backInterceptorRef.current?.()) return;
    const prev = sectionHistoryRef.current.pop() ?? "home";
    goingBackRef.current = true;
    if (prev === "home") setActiveNav("chat");
    setActiveSection(prev);
  }

  // Unlock the chime on first interaction (browsers block audio otherwise).
  useEffect(() => {
    const unlock = () => unlockChime();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  // Zero-friction capture: on the chat screen, typing any character focuses the
  // input so the thought flows straight in — unless you're in a field/modal.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (activeSection !== "home" || triggeredBlock) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el?.isContentEditable
      ) {
        return;
      }
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSection, triggeredBlock]);

  // Time-block alerts: while the app is open, check each ~30s for (a) a block
  // starting in ~15 minutes (gentle heads-up) and (b) a block whose start time
  // has arrived (the trigger popup). Both chime + post a written notification.
  useEffect(() => {
    function notify(title: string, body: string) {
      if (
        getPrefs().desktopNotifications &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(title, { body });
        } catch {
          /* notifications unavailable */
        }
      }
    }

    function check() {
      if (!getPrefs().timeBlockAlerts) return;
      const now = Date.now();
      const blocks = getTimeBlocks();

      // 15-minute heads-up.
      for (const b of blocks) {
        if (b.status !== "pending" || warnedRef.current.has(b.id)) continue;
        if (!b.date) continue; // unscheduled blocks never trigger
        const start = blockDateTime(b).getTime();
        const lead = start - 15 * 60 * 1000;
        if (now >= lead && now < start) {
          warnedRef.current.add(b.id);
          setWarning(b);
          playChime();
          notify(`Starting soon: ${b.title}`, "Begins in about 15 minutes.");
        }
      }

      // At-start trigger.
      if (!triggeredBlock) {
        const due = blocks.find(
          (b) =>
            b.status === "pending" &&
            b.date &&
            blockDateTime(b).getTime() <= now,
        );
        if (due) {
          setBlockStatus(due.id, "triggered");
          setTriggeredBlock(due);
          setWarning((w) => (w?.id === due.id ? null : w));
          playChime();
          notify(`Time to start: ${due.title}`, `You planned ${due.durationMin} min`);
        }
      }
    }

    check();
    const id = window.setInterval(check, 30000);
    return () => window.clearInterval(id);
  }, [triggeredBlock]);

  useEffect(() => {
    const win = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognition =
      win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const prefix = baseInputRef.current;
      const separator = prefix && !prefix.endsWith(" ") ? " " : "";
      voiceUsedRef.current = true;
      setInput(prefix + separator + transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      return;
    }
    baseInputRef.current = input;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      recognition.stop();
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    voiceUsedRef.current = false;
  }

  function appendSystemMessage(content: string) {
    setMessages((prev) => [...prev, { role: "system", content }]);
  }

  function resetChat() {
    recognitionRef.current?.stop();
    setIsListening(false);
    clearConversation();
    setMessages([]);
    setInput("");
    setError(null);
    setEmotion("unclear");
    voiceUsedRef.current = false;
    setIsLoading(false);
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("today");
  }

  function handleNavSelect(nav: SidebarNavId, mode?: CoachingMode) {
    setActiveNav(nav);
    // Create always opens the blank "What are you making?" funnel.
    if (nav === "create") setGenSeed(null);
    // Each door opens its area; only "chat" returns to the conversation (home).
    const section = SECTION_NAV[nav] ?? "home";
    if (mode) {
      setCoachingMode(mode);
      if (section === "home") appendSystemMessage(MODE_FEEDBACK[mode]);
    }
    setActiveSection(section);
    if (section === "home") inputRef.current?.focus();
  }

  function handleToolSelect(tool: SidebarToolId) {
    switch (tool) {
      case "brain-dump":
        setActiveSection("brain-dump");
        break;
      case "focus-timer":
        setActiveSection("focus-timer");
        break;
      case "breathe":
        setActiveSection("breathe");
        break;
      case "focus-audio":
        setFocusAudioCategory(null);
        setActiveSection("focus-audio");
        break;
      case "time-block":
        setActiveSection("time-block");
        break;
      case "games":
        setActiveSection("games");
        break;
      case "spin-wheel":
        setActiveSection("spin-wheel");
        break;
      case "reset-day":
        resetChat();
        appendSystemMessage("Fresh start — I'm here with you.");
        break;
      case "voice":
        toggleVoiceMode();
        setActiveSection("home");
        inputRef.current?.focus();
        break;
    }
  }

  function handleSaveTemplate(content: string) {
    const firstLine = content.split("\n").find((l) => l.trim()) ?? "";
    const title = firstLine.replace(/[*#>-]/g, "").trim().slice(0, 60);
    createTemplate({
      title: title || "Saved from chat",
      body: content,
      status: "draft",
    });
  }

  function handleNewDayChat() {
    resetChat();
    // A daily reset thread — fresh, but warm (light memory is kept in storage).
    setMessages([
      {
        role: "assistant",
        content: "New day — fresh start. What feels most important right now?",
      },
    ]);
  }

  function testAlert() {
    unlockChime();
    const demo: TimeBlock = {
      id: "test-alert",
      title: "Test block",
      date: todayStr(),
      startTime: "00:00",
      durationMin: 25,
      energy: "medium",
      status: "triggered",
      createdAt: new Date().toISOString(),
    };
    setTriggeredBlock(demo);
    playChime();
  }

  function startBlock(block: TimeBlock) {
    setTriggeredBlock(null);
    logMomentum("start", `Started: ${block.title}`);
    // Timer enabled → launch the linked Focus Session timer at the block's
    // duration (capped at 8h).
    if (block.timerEnabled) {
      setBlockStatus(block.id, "triggered");
      pomodoroTimer.startWith(Math.min(block.durationMin, 480));
      setActiveSection("focus-timer");
      return;
    }
    // Otherwise a gentle, energy-adapted hand-off into chat.
    setBlockStatus(block.id, "completed");
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("focus");
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: energyOpeningLine(block) },
    ]);
  }

  function blockNotReady(block: TimeBlock) {
    snoozeBlock(block.id, 15);
    setTriggeredBlock(null);
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("today");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "That's okay — no pressure at all. Let's take a breath together. What's the smallest possible first step, even just opening the file?",
      },
    ]);
  }

  function handlePlaybookAsk(prompt: string) {
    setActiveSection("home");
    setActiveNav("chat");
    setCoachingMode("playbook");
    // Start a fresh conversation — not a continuation of the old one.
    void handleSend(prompt, true);
  }

  function handleFocusSession(minutes: number) {
    logMomentum("start", "Focus session started");
    setActiveSection("home");
    setActiveNav("focus");
    setCoachingMode("focus");
    appendSystemMessage(`Focus session — ${minutes} minutes.`);
  }

  async function handleSend(overrideText?: string, fresh = false) {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || isLoading) return;

    setActiveSection("home");
    setActiveNav("chat");

    const detected = detectEmotionalState(trimmed);
    setEmotion(detected);

    const inputType = voiceUsedRef.current ? "voice" : "text";
    const userMessage: Message = { role: "user", content: trimmed };
    // A fresh start (e.g. opening a Playbook path) begins a brand-new
    // conversation rather than appending to the previous one.
    if (fresh) clearConversation();
    const nextMessages = fresh ? [userMessage] : [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    voiceUsedRef.current = false;
    setError(null);

    // No keyword→tool shortcut: every message flows through the routing
    // engine, which decides (and gates) whether audio is appropriate.
    setIsLoading(true);

    try {
      await presenceDelay();

      const prefs = getPrefs();
      const res = await fetch("/api/companion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(nextMessages),
          inputType,
          coachingMode,
          emotionalState: EMOTION_LABELS[detected],
          dayState: dayStateSummary(getDayState()),
          aiTone: prefs.aiTone,
          helpMode: prefs.helpMode,
          supportStyle: prefs.supportStyle,
          userName: prefs.name || undefined,
          businessContext: businessContextSummary(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
      if (voiceOutput && data.message) void playTTS(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey) {
      voiceUsedRef.current = false;
      return;
    }
    e.preventDefault();
    void handleSend();
  }

  function toggleVoiceMode() {
    const next = !voiceMode;
    setVoiceMode(next);
    if (next && speechSupported && !isListening) {
      baseInputRef.current = input;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        /* mic may already be active */
      }
    } else if (!next && isListening) {
      recognitionRef.current?.stop();
    }
  }

  return (
    <div
      className={`relative flex min-h-dvh text-lg text-[#2d2926] ${shellClass}`}
    >
      {showOnboarding && (
        <OnboardingFlow onDone={() => setShowOnboarding(false)} />
      )}
      <CompanionBackground page={scenePage} seed={sceneSeed} />

      <div className="relative z-10 flex min-h-dvh w-full">
        <AppSidebar
          activeNav={activeNav}
          activeSection={activeSection}
          onNavSelect={handleNavSelect}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar
            onAdjustDay={() => setActiveSection("energy")}
            onNewChat={resetChat}
            onNewDayChat={handleNewDayChat}
            onSettings={() => setOverlay("settings")}
            onProfile={() => setOverlay("profile")}
            onOpenAvatars={() => setActiveSection("client-avatars")}
          />
          <FocusActiveBar timer={pomodoroTimer} />

          {activeSection !== "home" && (
            <div className="shrink-0 px-4 pt-3 sm:px-6">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 rounded-xl border border-[#1e4f4f]/25 bg-white/80 px-4 py-2.5 text-lg font-bold text-[#1e4f4f] hover:bg-white"
              >
                <span className="text-2xl leading-none">‹</span> Back
              </button>
            </div>
          )}

          {activeSection === "home" && (
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <IdentityBar
                emotion={displayEmotion}
                photoError={photoError}
                logoError={logoError}
                onPhotoError={() => setPhotoError(true)}
                onLogoError={() => setLogoError(true)}
              />

              <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                {/* Home stays calm: greeting up top, open space here, the chat
                    box below. No menus to scan. */}
                <SimpleChat
                  messages={messages}
                  stateHint={stateHint}
                  showHint={isIdle}
                  isLoading={isLoading}
                  formatParagraphs={formatAssistantParagraphs}
                />
                {isIdle && (
                  <div className="mx-auto mt-5 flex max-w-xl flex-col items-center gap-2.5">
                    <p className="text-sm text-[#9a8f82]">
                      Not sure where to start? Tap one:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        "Help me write something",
                        "I'm feeling overwhelmed",
                        "What should I work on?",
                      ].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void handleSend(s, true)}
                          className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2 text-base font-medium text-[#1e4f4f] transition-colors hover:bg-white"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} className="h-2" />
              </div>

              {error && (
                <p
                  className="px-4 pb-2 text-center text-base text-[#a85c4a]"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <footer className="input-footer sticky bottom-0 shrink-0 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
                <div className="mx-auto w-full max-w-xl">
                  <ChatInputBar
                    input={input}
                    isLoading={isLoading}
                    isListening={isListening}
                    speechSupported={speechSupported}
                    inputRef={inputRef}
                    onInputChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onToggleListening={toggleListening}
                    onSend={() => void handleSend()}
                  />
                  <div className="mt-2 flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center justify-center gap-3">
                      {isIdle && (
                        <p className="text-sm text-[#9a8f82]">
                          You can just start typing or talking.
                        </p>
                      )}
                      {(() => {
                        const vs = getVoiceStatus();
                        // Essential plan has no voice — show a locked upgrade chip.
                        if (!vs.hasVoice) {
                          return (
                            <span
                              title="Voice is part of Voice Lite and Voice Pro"
                              className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#9a8f82]"
                            >
                              🔒 Voice — upgrade to talk back & forth
                            </span>
                          );
                        }
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (voiceOutput) ttsAudioRef.current?.pause();
                              setVoiceBlocked(false);
                              setVoiceOutput((v) => !v);
                            }}
                            title="Shari reads her replies aloud"
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                              voiceOutput
                                ? "bg-[#1e4f4f] text-white"
                                : "bg-white/70 text-[#6b635a] hover:bg-white"
                            }`}
                          >
                            {voiceOutput ? "🔊 Voice on" : "🔈 Voice off"} ·{" "}
                            {Math.ceil(vs.leftMin)}m left
                          </button>
                        );
                      })()}
                    </div>
                    {voiceBlocked && (
                      <p className="text-xs font-semibold text-[#a85c4a]">
                        You&apos;re out of voice minutes this month — upgrade for
                        more.
                      </p>
                    )}
                  </div>
                </div>
              </footer>
            </main>
          )}

          {/* Every non-home panel sits on a frosted white surface so text stays
              readable over the photo background, while the image still frames
              it. */}
          {activeSection !== "home" && (
            <div
              className="min-h-0 flex-1 overflow-y-auto px-2 py-3 sm:px-4"
              role="presentation"
              title="Click outside the panel to go back"
              onClick={(e) => {
                // Click on the surrounding area (not the panel itself) goes back.
                if (e.target === e.currentTarget) goBack();
              }}
            >
              <div className="mx-auto min-h-full w-full max-w-3xl rounded-3xl bg-white/80 shadow-sm backdrop-blur-sm">

          {activeSection === "focus-timer" && (
            <FocusTimerPanel
              timer={pomodoroTimer}
              onStartSession={handleFocusSession}
            />
          )}

          {activeSection === "brain-dump" && (
            <BrainDumpPanel
              onOpen={(s) => setActiveSection(s)}
              onAsk={handlePlaybookAsk}
              registerBack={registerBack}
            />
          )}

          {activeSection === "breathe" && (
            <BreathePanel onDone={() => setActiveSection("home")} />
          )}

          {activeSection === "focus-audio" && (
            <FocusAudioPanel
              emotion={displayEmotion}
              initialCategory={focusAudioCategory ?? undefined}
              onDone={() => {
                setFocusAudioCategory(null);
                setActiveSection("home");
              }}
            />
          )}

          {activeSection === "focus" && (
            <FocusAreaPanel onOpen={handleToolSelect} />
          )}

          {activeSection === "time-block" && (
            <TimeBlockPanel onStart={startBlock} onTestAlert={testAlert} />
          )}

          {activeSection === "games" && (
            <GamesPanel onOpen={(s) => setActiveSection(s)} />
          )}

          {activeSection === "spin-wheel" && (
            <SpinWheelPanel
              onOpen={(s) => setActiveSection(s)}
              onAsk={handlePlaybookAsk}
            />
          )}

          {activeSection === "progress" && (
            <ProgressPanel onOpen={(s) => setActiveSection(s)} />
          )}

          {activeSection === "business-profile" && (
            <BusinessProfilePanel
              onDone={() => {
                setActiveNav("chat");
                setActiveSection("home");
              }}
            />
          )}

          {activeSection === "client-avatars" && <IdealClientBuilder />}

          {activeSection === "projects" && (
            <ProjectsPanel
              onOpen={(s) => setActiveSection(s)}
              onAsk={handlePlaybookAsk}
            />
          )}

          {activeSection === "playbook" && (
            <StrategiesPanel
              onOpen={(s) => setActiveSection(s)}
              onAsk={handlePlaybookAsk}
              registerBack={registerBack}
            />
          )}

          {activeSection === "templates-library" && (
            <TemplatesLibrary
              onOpen={(s) => setActiveSection(s)}
              onGenerate={openGenerator}
              onBack={() => {
                setActiveNav("chat");
                setActiveSection("home");
              }}
            />
          )}

          {activeSection === "email-generator" && (
            <EmailGeneratorPanel onOpen={(s) => setActiveSection(s)} />
          )}

          {activeSection === "snippets" && <SnippetsLibrary />}

          {activeSection === "content-types" && (
            <ContentTypesPanel onGenerate={openGenerator} />
          )}

          {activeSection === "content-generator" && (
            <ContentGeneratorPanel
              seed={genSeed}
              onOpen={(s) => setActiveSection(s)}
            />
          )}

          {activeSection === "energy" && (
            <AdjustMyDayPanel
              onDone={() => {
                setActiveNav("chat");
                setActiveSection("home");
              }}
            />
          )}
              </div>
            </div>
          )}
        </div>
      </div>

      {warning && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[min(92%,28rem)] -translate-x-1/2">
          <div className="companion-fade-in flex items-center gap-3 rounded-2xl bg-[#1e4f4f] px-4 py-3 text-white shadow-2xl">
            <span aria-hidden="true">⏰</span>
            <p className="flex-1 text-sm font-medium">
              <span className="font-semibold">{warning.title}</span> starts in
              about 15 minutes.
            </p>
            <button
              type="button"
              onClick={() => setWarning(null)}
              aria-label="Dismiss"
              className="shrink-0 rounded-md px-2 py-0.5 text-white/80 hover:bg-white/15"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <ModalSheet
        open={overlay === "settings"}
        onClose={() => setOverlay(null)}
        title="Settings"
      >
        <SettingsPanel />
      </ModalSheet>

      <ModalSheet
        open={overlay === "profile"}
        onClose={() => setOverlay(null)}
        title="Profile"
      >
        <ProfilePanel
          onOpen={(s) => {
            setOverlay(null);
            setActiveSection(s);
          }}
        />
      </ModalSheet>

      {triggeredBlock && (
        <TimeBlockTrigger
          block={triggeredBlock}
          onStartNow={() => startBlock(triggeredBlock)}
          onSnooze={() => {
            snoozeBlock(triggeredBlock.id, 10);
            setTriggeredBlock(null);
          }}
          onReschedule={() => {
            setTriggeredBlock(null);
            setActiveSection("time-block");
          }}
          onNotReady={() => blockNotReady(triggeredBlock)}
        />
      )}
    </div>
  );
}
