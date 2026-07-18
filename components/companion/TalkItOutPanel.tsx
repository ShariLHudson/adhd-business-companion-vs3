"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ParkingLotRoomShell } from "@/components/companion/ParkingLotRoomShell";
import { NavigationReturnBar } from "@/components/companion/NavigationReturnBar";
import {
  hasDestinationOriginBeneath,
  popNavigationFrame,
} from "@/lib/navigationContext";
import {
  TALK_IT_OUT_END,
  TALK_IT_OUT_END_ACK,
  TALK_IT_OUT_INPUT_PLACEHOLDER,
  TALK_IT_OUT_PAUSE,
  TALK_IT_OUT_PAUSE_ACK,
  TALK_IT_OUT_SAVE,
  TALK_IT_OUT_SAVE_DEFAULT_WHERE,
  TALK_IT_OUT_SUMMARY_OFFER,
  TALK_IT_OUT_SUPPORT_LINE,
  TALK_IT_OUT_TITLE,
  appendTalkItOutMessages,
  buildDiscoveryDraft,
  buildTalkItOutTurn,
  createTalkItOutSession,
  endTalkItOutSession,
  pauseTalkItOutSession,
  resumeOrCreateTalkItOutSession,
  saveTalkItOutDiscovery,
  type TalkItOutSession,
} from "@/lib/talkItOut";

type Props = {
  onBack?: () => void;
  registerBack?: (fn: (() => void) | null) => void;
};

const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-3 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea]";

function useSpeechInput(
  onResult: (text: string) => void,
): { supported: boolean; listening: boolean; toggle: () => void } {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{
    stop: () => void;
    start: () => void;
    onresult:
      | ((ev: {
          results: { [i: number]: { [j: number]: { transcript: string } } };
        }) => void)
      | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
  } | null>(null);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggle = useCallback(() => {
    if (!supported) return;
    const SR =
      (
        window as unknown as {
          SpeechRecognition?: new () => NonNullable<
            typeof recognitionRef.current
          >;
          webkitSpeechRecognition?: new () => NonNullable<
            typeof recognitionRef.current
          >;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => NonNullable<
            typeof recognitionRef.current
          >;
        }
      ).webkitSpeechRecognition;
    if (!SR) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (ev) => {
      const transcript = ev.results[0]?.[0]?.transcript?.trim();
      if (transcript) onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onResult, supported]);

  return { supported, listening, toggle };
}

export function TalkItOutPanel({ onBack, registerBack }: Props) {
  const [session, setSession] = useState<TalkItOutSession | null>(null);
  const [input, setInput] = useState("");
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [saveDraft, setSaveDraft] = useState<string | null>(null);
  const [offerSummary, setOfferSummary] = useState(false);
  const [showMoreControls, setShowMoreControls] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSession(resumeOrCreateTalkItOutSession());
  }, []);

  useEffect(() => {
    registerBack?.(onBack ?? null);
    return () => registerBack?.(null);
  }, [onBack, registerBack]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [session?.messages.length, statusLine]);

  const applySpeech = useCallback((text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  const speech = useSpeechInput(applySpeech);

  const conversationStarted =
    (session?.messages.filter((m) => m.role === "user").length ?? 0) > 0;

  const send = useCallback(() => {
    if (!session || !input.trim()) return;
    const userText = input.trim();
    setInput("");
    setStatusLine(null);
    setOfferSummary(false);

    const userMsg = {
      id: `tio-u-${Date.now()}`,
      role: "user" as const,
      content: userText,
      createdAt: new Date().toISOString(),
    };
    const withUser = appendTalkItOutMessages(session, [userMsg]);
    const turn = buildTalkItOutTurn(withUser, userText);
    const assistantMsg = {
      id: `tio-a-${Date.now()}`,
      role: "assistant" as const,
      content: turn.assistantText,
      questionId: turn.questionId,
      createdAt: new Date().toISOString(),
    };
    const used = turn.questionId
      ? [...withUser.usedQuestionIds, turn.questionId]
      : withUser.usedQuestionIds;
    const next = appendTalkItOutMessages(withUser, [assistantMsg], {
      usedQuestionIds: used,
      explicitHelpRequested:
        withUser.explicitHelpRequested || turn.explicitHelpRequested,
      futureFeelingAsked: turn.futureFeelingAsked,
      thinkingMap: turn.thinkingMap ?? withUser.thinkingMap,
    });
    setSession(next);
    const userTurns = next.messages.filter((m) => m.role === "user").length;
    if (userTurns >= 4 && userTurns % 4 === 0) {
      setOfferSummary(true);
    }
  }, [input, session]);

  const handlePause = () => {
    if (!session) return;
    const next = pauseTalkItOutSession(session);
    setSession(next);
    setStatusLine(TALK_IT_OUT_PAUSE_ACK);
  };

  const handleEnd = () => {
    if (!session) return;
    const next = endTalkItOutSession(session);
    setSession(next);
    setStatusLine(TALK_IT_OUT_END_ACK);
  };

  const handleNew = () => {
    setStatusLine(null);
    setOfferSummary(false);
    setSaveDraft(null);
    setShowMoreControls(false);
    setSession(createTalkItOutSession());
    inputRef.current?.focus();
  };

  const openSave = () => {
    if (!session) return;
    setSaveDraft(buildDiscoveryDraft(session));
  };

  const confirmSave = () => {
    if (!session || !saveDraft?.trim()) return;
    const next = saveTalkItOutDiscovery(session, saveDraft.trim());
    setSession(next);
    setSaveDraft(null);
    setStatusLine(TALK_IT_OUT_SAVE_DEFAULT_WHERE);
  };

  if (!session) {
    return (
      <ParkingLotRoomShell onOutsideDismiss={onBack}>
        <p className="p-6 text-lg text-[#3d3832]">Opening Talk It Out…</p>
      </ParkingLotRoomShell>
    );
  }

  const lastAssistant = [...session.messages]
    .reverse()
    .find((m) => m.role === "assistant");

  return (
    <ParkingLotRoomShell onOutsideDismiss={onBack}>
      <div
        className="flex h-full min-h-0 flex-col gap-3 p-4 sm:p-5"
        data-testid="talk-it-out-panel"
        data-conversation-started={conversationStarted ? "true" : "false"}
      >
        <header className="shrink-0">
          {hasDestinationOriginBeneath() ? (
            <div className="mb-3">
              <NavigationReturnBar
                currentDestination="talk-it-out"
                onReturn={() => {
                  popNavigationFrame();
                  onBack?.();
                }}
              />
            </div>
          ) : null}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#1f1c19] sm:text-3xl">
                {TALK_IT_OUT_TITLE}
              </h1>
              <p
                className="mt-1 text-base text-[#5a534a] sm:text-lg"
                data-testid="talk-it-out-one-line"
              >
                {TALK_IT_OUT_SUPPORT_LINE}
              </p>
            </div>
            {onBack ? (
              <button
                type="button"
                className={BTN_SECONDARY}
                onClick={onBack}
                data-testid="talk-it-out-back"
              >
                Leave
              </button>
            ) : null}
          </div>
        </header>

        <div
          className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-[#e7dfd4]/80 bg-white/75 p-4"
          data-testid="talk-it-out-thread"
          aria-live="polite"
        >
          {session.messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "assistant"
                  ? "text-lg leading-relaxed text-[#1f1c19] sm:text-xl"
                  : "ml-4 rounded-xl bg-[#1e4f4f]/8 px-3 py-2 text-base text-[#1f1c19] sm:text-lg"
              }
              data-role={m.role}
            >
              {m.content.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-3" : undefined}>
                  {para}
                </p>
              ))}
            </div>
          ))}
          {statusLine ? (
            <p
              className="text-base text-[#1e4f4f]"
              data-testid="talk-it-out-status"
            >
              {statusLine}
            </p>
          ) : null}
          {offerSummary && lastAssistant ? (
            <p className="text-base text-[#5a534a]">{TALK_IT_OUT_SUMMARY_OFFER}</p>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {saveDraft !== null ? (
          <div
            className="shrink-0 rounded-2xl border border-[#e7dfd4] bg-white p-4"
            data-testid="talk-it-out-save"
          >
            <p className="mb-2 text-sm font-semibold text-[#3d3832]">
              Edit before saving (private Talk It Out history)
            </p>
            <textarea
              className="min-h-[100px] w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-base text-[#1f1c19]"
              value={saveDraft}
              onChange={(e) => setSaveDraft(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className={BTN_PRIMARY} onClick={confirmSave}>
                Save privately
              </button>
              <button
                type="button"
                className={BTN_SECONDARY}
                onClick={() => setSaveDraft(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {session.status !== "completed" ? (
          <div className="shrink-0 space-y-2">
            <div
              className="flex items-end gap-2 rounded-xl border border-[#d4cdc3] bg-white px-2 py-2 focus-within:border-[#1e4f4f]"
              data-testid="talk-it-out-composer"
            >
              <textarea
                ref={inputRef}
                className="min-h-[52px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-lg text-[#1f1c19] outline-none"
                placeholder={TALK_IT_OUT_INPUT_PLACEHOLDER}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                data-testid="talk-it-out-input"
                rows={2}
              />
              {speech.supported ? (
                <button
                  type="button"
                  className={`mb-1 shrink-0 rounded-lg px-2.5 py-2 text-sm font-semibold ${
                    speech.listening
                      ? "bg-[#1e4f4f]/15 text-[#1e4f4f]"
                      : "text-[#4b463f] hover:bg-[#f5f0ea]"
                  }`}
                  onClick={speech.toggle}
                  aria-pressed={speech.listening}
                  aria-label={
                    speech.listening ? "Stop listening" : "Microphone"
                  }
                  data-testid="talk-it-out-mic"
                  title={speech.listening ? "Stop listening" : "Microphone"}
                >
                  {speech.listening ? "Listening" : "Mic"}
                </button>
              ) : null}
              <button
                type="button"
                className={`${BTN_PRIMARY} mb-0.5 shrink-0`}
                onClick={send}
                disabled={!input.trim()}
                data-testid="talk-it-out-send"
              >
                Send
              </button>
            </div>

            {conversationStarted ? (
              <div
                className="flex flex-wrap items-center gap-2"
                data-testid="talk-it-out-progressive-controls"
              >
                {!showMoreControls ? (
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#1e4f4f] hover:underline"
                    onClick={() => setShowMoreControls(true)}
                    data-testid="talk-it-out-more-controls"
                  >
                    More…
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className={BTN_SECONDARY}
                      onClick={handlePause}
                      data-testid="talk-it-out-pause"
                    >
                      {TALK_IT_OUT_PAUSE}
                    </button>
                    <button
                      type="button"
                      className={BTN_SECONDARY}
                      onClick={openSave}
                      data-testid="talk-it-out-save-btn"
                    >
                      {TALK_IT_OUT_SAVE}
                    </button>
                    <button
                      type="button"
                      className={BTN_SECONDARY}
                      onClick={handleEnd}
                      data-testid="talk-it-out-end"
                    >
                      {TALK_IT_OUT_END}
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={BTN_PRIMARY} onClick={handleNew}>
              Start again
            </button>
            {onBack ? (
              <button type="button" className={BTN_SECONDARY} onClick={onBack}>
                Leave
              </button>
            ) : null}
          </div>
        )}
      </div>
    </ParkingLotRoomShell>
  );
}
