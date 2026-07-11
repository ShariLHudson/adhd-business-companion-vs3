"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ConservatoryScene } from "@/components/prototype/conversationWorkspace/ConservatoryScene";
import { CONSERVATORY_BG } from "@/components/prototype/conversationWorkspace/mockData";
import { SparkAlphaDevPanel } from "./SparkAlphaDevPanel";
import { SparkAlphaSuggestionChips } from "./SparkAlphaSuggestionChips";
import { SparkAlphaTopBar } from "./SparkAlphaTopBar";
import { getPrefs } from "@/lib/companionStore";
import { usePomodoroTimer } from "@/lib/usePomodoroTimer";
import {
  createHiddenWorkLog,
  environmentScoreForIntent,
  estimateFlowConfidence,
  modulesToBrainSummary,
  recordTurnHiddenWork,
  latestHiddenIntentSummary,
  updateWorkspaceContext,
  resolveActionFromUserTurn,
  parseSuggestionsFromAssistant,
  formatConversationTranscript,
  conversationTitle,
  printConversation,
  downloadConversationPdf,
  createGoogleDocFromConversation,
  openGoogleCalendarPrefill,
  saveToGoogleDriveViaDoc,
  googleConnectUrl,
  type SparkAlphaContextModule,
  type SparkAlphaConversationIntent,
  type SparkAlphaDevPanelState,
  type SparkAlphaHiddenWorkLog,
  type SparkAlphaSuggestion,
  type SparkAlphaSuggestionEffect,
  type ConversationExportKind,
  SPARK_ALPHA_ENVIRONMENT_ID,
} from "@/lib/sparkAlpha";
import { runWisdomLoop, pickOpeningPhrase } from "@/lib/sparkWisdom";
import { buildCoachingFallbackResponse } from "@/lib/sparkConversation/coachingFallback";

type ChatLine = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const OPENING_PHRASE_SEED_KEY = "spark-alpha-opening-seed";

function readOpeningSeed(): string {
  if (typeof window === "undefined") return "spark-alpha-ssr";
  try {
    const stored = sessionStorage.getItem(OPENING_PHRASE_SEED_KEY);
    if (stored) return stored;
    const seed = `spark-alpha-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(OPENING_PHRASE_SEED_KEY, seed);
    return seed;
  } catch {
    return "spark-alpha-fallback";
  }
}
function createLineId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `line-${crypto.randomUUID()}`;
  }
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "TEXTAREA" ||
    tag === "INPUT" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

type ExecutableAction = SparkAlphaSuggestionEffect | ConversationExportKind;

function isFocusEffect(
  action: ExecutableAction,
): action is Extract<SparkAlphaSuggestionEffect, { type: "focus_timer" }> {
  return typeof action === "object" && action.type === "focus_timer";
}

/**
 * Spark Alpha — Relationship Prototype
 * Conversation is the interface. Conservatory only. Invisible layer logged for dev.
 */
export function SparkAlphaPage() {
  const conversationId = useId();
  const [lines, setLines] = useState<ChatLine[]>(() => {
    const phrase = pickOpeningPhrase(readOpeningSeed());
    return [{ id: createLineId(), role: "assistant", text: phrase }];
  });
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [intent, setIntent] = useState<SparkAlphaConversationIntent>("general");
  const [modules, setModules] = useState<SparkAlphaContextModule[]>([
    "business_brain",
    "related_conversations",
  ]);
  const [confidence, setConfidence] = useState<"low" | "medium" | "high">("medium");
  const [hiddenLog, setHiddenLog] = useState<SparkAlphaHiddenWorkLog>(() =>
    createHiddenWorkLog(conversationId),
  );
  const [researchPrepared, setResearchPrepared] = useState(false);
  const [permissionRequired, setPermissionRequired] = useState<string[]>([]);
  const [wisdomSummaries, setWisdomSummaries] = useState<string[]>([]);
  const [memberNeedPrimary, setMemberNeedPrimary] = useState<string | null>(null);
  const [outcomeSummary, setOutcomeSummary] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pomodoro = usePomodoroTimer();

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setDevOpen((v) => !v);
        return;
      }

      if (devOpen) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length !== 1) return;
      if (loading) return;
      if (isEditableTarget(event.target)) return;

      const textarea = textareaRef.current;
      if (!textarea) return;

      event.preventDefault();
      textarea.focus({ preventScroll: true });
      setDraft((prev) => prev + event.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [devOpen, loading]);

  useEffect(() => {
    const scrollToLatest = () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };
    scrollToLatest();
    const frame = requestAnimationFrame(scrollToLatest);
    return () => cancelAnimationFrame(frame);
  }, [lines, loading]);

  const devState: SparkAlphaDevPanelState = useMemo(() => {
    const completed = hiddenLog.entries.filter((e) => e.status === "completed");
    const prepared = hiddenLog.entries.filter((e) => e.status === "prepared");
    const withheld = hiddenLog.entries.filter((e) => e.status === "withheld");
    return {
      conversationId,
      intent,
      confidence,
      brainLoaded: modulesToBrainSummary(modules),
      modulesLoaded: modules,
      researchPrepared,
      hiddenWorkCompleted: completed,
      hiddenWorkPrepared: prepared,
      suggestionsWithheld: withheld,
      permissionRequired,
      environmentScore: environmentScoreForIntent(intent),
      environmentId: SPARK_ALPHA_ENVIRONMENT_ID,
      hiddenIntentSummary: latestHiddenIntentSummary(hiddenLog),
      memberNeedPrimary,
      wisdomLoopSummaries: wisdomSummaries,
      outcomeSummary,
    };
  }, [
    conversationId,
    intent,
    confidence,
    modules,
    researchPrepared,
    hiddenLog,
    permissionRequired,
    wisdomSummaries,
    memberNeedPrimary,
    outcomeSummary,
  ]);

  const activeSuggestions = useMemo(() => {
    if (loading) return [];
    const last = lines[lines.length - 1];
    if (!last || last.role !== "assistant") return [];
    return parseSuggestionsFromAssistant(last.text);
  }, [lines, loading]);

  const runInvisibleLayer = useCallback(
    (turnId: string, userMessage: string) => {
      const context = updateWorkspaceContext({
        turnId,
        message: userMessage,
        priorIntent: intent,
        priorModules: modules,
      });
      setIntent(context.intent);
      setModules(context.loadedModules.length ? context.loadedModules : modules);
      const conf = estimateFlowConfidence(userMessage, context.intent);
      setConfidence(conf);
      setResearchPrepared(/\bresearch\b/i.test(userMessage));
      const perms: string[] = [];
      if (/\b(draft|write|create|export|publish|send)\b/i.test(userMessage)) {
        perms.push("Final output / export — awaiting explicit permission");
      }
      if (/\b(save|gallery|remember)\b/i.test(userMessage)) {
        perms.push("Persistent save — awaiting member consent");
      }
      setPermissionRequired(perms);
      setHiddenLog((prev) =>
        recordTurnHiddenWork({
          log: prev,
          turnId,
          userMessage,
          context,
          confidence: conf,
        }),
      );
    },
    [intent, modules],
  );

  const appendAssistantNote = useCallback((text: string) => {
    setLines((prev) => [
      ...prev,
      { id: createLineId(), role: "assistant", text },
    ]);
  }, []);

  const runConversationAction = useCallback(
    async (action: ExecutableAction, snapshot: ChatLine[]) => {
      const transcript = formatConversationTranscript(snapshot);
      const title = conversationTitle(snapshot);

      if (isFocusEffect(action)) {
        pomodoro.startWith(action.minutes, action.label);
        return;
      }

      const kind = typeof action === "string" ? action : action.type;

      if (kind === "print") {
        const err = printConversation(title, transcript);
        if (err) appendAssistantNote(err);
        return;
      }

      if (kind === "pdf") {
        const err = await downloadConversationPdf(title, transcript);
        if (err) appendAssistantNote(err);
        else appendAssistantNote("PDF saved — check your downloads.");
        return;
      }

      if (kind === "google_doc") {
        const result = await createGoogleDocFromConversation(title, transcript);
        if (result.ok) {
          appendAssistantNote("Opened your Google Doc — it's in Drive too.");
        } else if (result.connect) {
          appendAssistantNote(`${result.message}`);
          window.location.href = googleConnectUrl("/spark-alpha");
        } else {
          appendAssistantNote(result.message);
        }
        return;
      }

      if (kind === "google_calendar") {
        openGoogleCalendarPrefill(title, transcript);
        appendAssistantNote("Opened Google Calendar — pick a time and save.");
        return;
      }

      if (kind === "google_drive") {
        const result = await saveToGoogleDriveViaDoc(title, transcript);
        if (result.ok) {
          appendAssistantNote("Saved to Google Drive as a Doc.");
        } else if (result.connect) {
          appendAssistantNote(result.message);
          window.location.href = googleConnectUrl("/spark-alpha");
        } else {
          appendAssistantNote(result.message);
        }
      }
    },
    [appendAssistantNote, pomodoro],
  );

  const handleSend = useCallback(
    async (textOverride?: string, sideEffect?: SparkAlphaSuggestionEffect) => {
      const text = (textOverride ?? draft).trim();
      if (!text || loading) return;

      const lastAssistant =
        [...lines].reverse().find((line) => line.role === "assistant")?.text ?? null;

      const turnId = createLineId();
      const userLine: ChatLine = { id: turnId, role: "user", text };
      const nextMessages = [...lines, userLine];
      setLines(nextMessages);
      setDraft("");
      setLoading(true);
      runInvisibleLayer(turnId, text);

      const wisdom = runWisdomLoop({
        memberMessage: text,
        messageHistory: lines.map((line) => ({
          role: line.role,
          content: line.text,
        })),
      });
      setWisdomSummaries(wisdom.devSummaries);
      setMemberNeedPrimary(wisdom.memberNeed.primary);
      setOutcomeSummary(wisdom.outcomeDiscovery.hopedSuccess);

      const hiddenIntentHint = wisdom.promptHint;

      const action =
        sideEffect ?? resolveActionFromUserTurn(text, lastAssistant);
      if (action) {
        void runConversationAction(action, nextMessages);
      }

      try {
        const prefs = getPrefs();
        const apiMessages = nextMessages.map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));

        const res = await fetch("/api/companion-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            coachingMode: "today",
            inputType: "text",
            userName: prefs.name || undefined,
            aiTone: prefs.aiTone,
            helpMode: prefs.helpMode,
            supportStyle: prefs.supportStyle,
            intentHint: intent,
            hiddenIntentHint,
          }),
        });

        const data = (await res.json()) as {
          message?: string;
          error?: string;
          usedCoachingFallback?: boolean;
        };

        const assistantText =
          data.message?.trim() ||
          buildCoachingFallbackResponse(text);

        if (!res.ok && !data.message?.trim()) {
          setLines((prev) => [
            ...prev,
            {
              id: createLineId(),
              role: "assistant",
              text: assistantText,
            },
          ]);
          return;
        }

        setLines((prev) => [
          ...prev,
          {
            id: createLineId(),
            role: "assistant",
            text: assistantText,
          },
        ]);
      } catch {
        setLines((prev) => [
          ...prev,
          {
            id: createLineId(),
            role: "assistant",
            text: buildCoachingFallbackResponse(text),
          },
        ]);
      } finally {
        setLoading(false);
        requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
      }
    },
    [draft, loading, lines, intent, runInvisibleLayer, runConversationAction],
  );

  const handleSuggestionChoose = useCallback(
    (suggestion: SparkAlphaSuggestion) => {
      void handleSend(suggestion.sendText, suggestion.sideEffect);
    },
    [handleSend],
  );

  const canSend = draft.trim().length > 0 && !loading;

  return (
    <div
      className="spark-alpha-root"
      style={{ backgroundImage: `url(${CONSERVATORY_BG})` }}
    >
      <ConservatoryScene />

      <SparkAlphaTopBar
        visible={pomodoro.isActive}
        displayMins={pomodoro.displayMins}
        displaySecs={pomodoro.displaySecs}
        label={pomodoro.label}
        running={pomodoro.running}
        onPause={pomodoro.pause}
        onResume={pomodoro.start}
        onEnd={pomodoro.reset}
      />

      <div className="spark-alpha-frosted" role="main">
        <div className="spark-alpha-thread" ref={threadRef} aria-live="polite">
          {lines.map((line) => (
            <p
              key={line.id}
              className={`spark-alpha-line spark-alpha-line--${line.role}`}
            >
              {line.text}
            </p>
          ))}
          {loading && (
            <p className="spark-alpha-line spark-alpha-line--assistant spark-alpha-line--thinking">
              …
            </p>
          )}
          <div ref={bottomRef} className="spark-alpha-thread__anchor" aria-hidden />
        </div>

        <SparkAlphaSuggestionChips
          suggestions={activeSuggestions}
          disabled={loading}
          onChoose={handleSuggestionChoose}
        />

        <form
          className="spark-alpha-input"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
          }}
        >
          <div className="spark-alpha-input__row">
            <textarea
              ref={textareaRef}
              name="message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Just start typing…"
              rows={2}
              aria-label="Message"
              disabled={loading}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend(event.currentTarget.value);
                }
              }}
            />
            <button
              type="submit"
              className="spark-alpha-input__send"
              disabled={!canSend}
              aria-label="Send message"
            >
              {loading ? "…" : "Send"}
            </button>
          </div>
          <p className="spark-alpha-input__hint">
            Type anywhere · Enter to send · Shift+Enter for a new line
          </p>
        </form>
      </div>

      <SparkAlphaDevPanel
        open={devOpen}
        onClose={() => setDevOpen(false)}
        state={devState}
      />
    </div>
  );
}
