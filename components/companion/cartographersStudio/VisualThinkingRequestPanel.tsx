"use client";

import { useEffect, useRef, useState } from "react";
import {
  VISUAL_THINKING_DEPTH_QUESTION,
  VISUAL_THINKING_REQUEST_PLACEHOLDER,
  VISUAL_THINKING_RESEARCH_PROMPT,
  VISUAL_THINKING_STUDIO_SUPPORTING,
  VISUAL_THINKING_STUDIO_TITLE,
  VISUAL_THINKING_USER_LED_PROMPT,
  applyHelpDepth,
  applyRequestText,
  applyUserControl,
  clearVisualThinkingRequestDraft,
  confirmRecommendation,
  createVisualThinkingRequest,
  loadVisualThinkingRequestDraft,
  saveVisualThinkingRequestDraft,
  visibleDepthChoices,
  type VisualThinkingHelpDepth,
  type VisualThinkingRequest,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import { CARTOGRAPHERS_STUDIO_BACKGROUND } from "@/lib/cartographersStudio/media";

type Props = {
  onOpenPreviousWork: () => void;
  onConfirmed?: (request: VisualThinkingRequest) => void;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Request-first opening experience for Visual Thinking Studio.
 * Sits above the Cartography room image — does not replace the background.
 */
export function VisualThinkingRequestPanel({
  onOpenPreviousWork,
  onConfirmed,
}: Props) {
  const [request, setRequest] = useState<VisualThinkingRequest>(() =>
    createVisualThinkingRequest({}),
  );
  const [draftText, setDraftText] = useState("");
  const [showAllDepth, setShowAllDepth] = useState(false);
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const existing = loadVisualThinkingRequestDraft();
    if (existing && existing.status !== "capturing") {
      setRequest(existing);
      setDraftText(existing.rawRequest);
    }
  }, []);

  useEffect(() => {
    saveVisualThinkingRequestDraft(request);
  }, [request]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function updateRequest(next: VisualThinkingRequest) {
    setRequest(next);
  }

  function handleContinue() {
    const text = (textareaRef.current?.value ?? draftText).trim();
    if (!text) {
      textareaRef.current?.focus();
      return;
    }
    setDraftText(text);
    updateRequest(applyRequestText(request, text));
  }

  function handleDepth(
    depth: Exclude<VisualThinkingHelpDepth, "unspecified">,
  ) {
    updateRequest(applyHelpDepth(request, depth));
  }

  function handleConfirm() {
    const confirmed = confirmRecommendation(request);
    updateRequest(confirmed);
    onConfirmed?.(confirmed);
  }

  function startUserLed() {
    const next = createVisualThinkingRequest({
      rawRequest: draftText.trim(),
      entryPath: "user_led_visual",
    });
    setDraftText(next.rawRequest);
    updateRequest(next);
  }

  function startResearch() {
    const next = createVisualThinkingRequest({
      rawRequest: draftText.trim(),
      entryPath: "research_assisted",
    });
    setDraftText(next.rawRequest);
    updateRequest(next);
  }

  function continueUserLedOrResearch() {
    const text = (textareaRef.current?.value ?? draftText).trim();
    if (!text) {
      textareaRef.current?.focus();
      return;
    }
    setDraftText(text);
    updateRequest(applyRequestText({ ...request, rawRequest: text }, text));
  }

  function toggleVoice() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const spoken = event.results[0]?.[0]?.transcript?.trim();
      if (!spoken) return;
      setDraftText((prev) => (prev ? `${prev.trim()} ${spoken}` : spoken));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  const depthChoices = visibleDepthChoices({ showAll: showAllDepth });
  const speechSupported = Boolean(getSpeechRecognitionCtor());
  const phase = request.status;

  return (
    <div
      className="vts-request"
      data-testid="visual-thinking-request-panel"
      data-vts-phase={phase}
      data-vts-background={CARTOGRAPHERS_STUDIO_BACKGROUND}
    >
      <div className="vts-request__glass">
        <header className="vts-request__header">
          <h1 className="vts-request__title" id="vts-request-title">
            {VISUAL_THINKING_STUDIO_TITLE}
          </h1>
          {phase === "capturing" ||
          phase === "user_led" ||
          phase === "research_intake" ? (
            <p className="vts-request__supporting">
              {phase === "user_led"
                ? VISUAL_THINKING_USER_LED_PROMPT
                : phase === "research_intake"
                  ? VISUAL_THINKING_RESEARCH_PROMPT
                  : VISUAL_THINKING_STUDIO_SUPPORTING}
            </p>
          ) : null}
        </header>

        {(phase === "capturing" ||
          phase === "user_led" ||
          phase === "research_intake") && (
          <>
            <label className="sr-only" htmlFor="vts-request-input">
              Your request
            </label>
            <div className="vts-request__input-row">
              <textarea
                id="vts-request-input"
                ref={textareaRef}
                className="vts-request__textarea"
                data-testid="visual-thinking-request-input"
                rows={4}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder={
                  phase === "user_led"
                    ? VISUAL_THINKING_USER_LED_PROMPT
                    : phase === "research_intake"
                      ? VISUAL_THINKING_RESEARCH_PROMPT
                      : VISUAL_THINKING_REQUEST_PLACEHOLDER
                }
              />
              <button
                type="button"
                className={`vts-request__mic${listening ? " vts-request__mic--active" : ""}`}
                data-testid="visual-thinking-request-mic"
                disabled={!speechSupported}
                aria-label={listening ? "Stop listening" : "Voice input"}
                aria-pressed={listening}
                onClick={toggleVoice}
              >
                Mic
              </button>
            </div>

            <div className="vts-request__primary-actions">
              <button
                type="button"
                className="vts-request__primary"
                data-testid="visual-thinking-request-continue"
                onClick={
                  phase === "capturing" ? handleContinue : continueUserLedOrResearch
                }
              >
                Continue
              </button>
            </div>

            {phase === "capturing" ? (
              <div className="vts-request__secondary">
                <button
                  type="button"
                  className="vts-request__secondary-btn"
                  data-testid="visual-thinking-open-previous"
                  onClick={onOpenPreviousWork}
                >
                  Open Previous Work
                </button>
                <button
                  type="button"
                  className="vts-request__secondary-btn"
                  data-testid="visual-thinking-create-own"
                  onClick={startUserLed}
                >
                  Create My Own Visual
                </button>
                <button
                  type="button"
                  className="vts-request__secondary-btn"
                  data-testid="visual-thinking-research-build"
                  onClick={startResearch}
                >
                  Research and Build It for Me
                </button>
              </div>
            ) : null}
          </>
        )}

        {phase === "awaiting_depth" ? (
          <section
            className="vts-request__depth"
            data-testid="visual-thinking-depth-question"
            aria-labelledby="vts-depth-heading"
          >
            <p className="vts-request__echo">{request.rawRequest}</p>
            <h2 id="vts-depth-heading" className="vts-request__section-title">
              {VISUAL_THINKING_DEPTH_QUESTION}
            </h2>
            <div className="vts-request__choices" role="group">
              {depthChoices.visible.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className="vts-request__choice"
                  data-testid={`visual-thinking-depth-${choice.id}`}
                  onClick={() => handleDepth(choice.id)}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            {depthChoices.hiddenCount > 0 && !showAllDepth ? (
              <button
                type="button"
                className="vts-request__more"
                data-testid="visual-thinking-depth-more"
                onClick={() => setShowAllDepth(true)}
              >
                More options
              </button>
            ) : null}
            <p className="vts-request__note" data-testid="visual-thinking-depth-full-detail">
              You can always ask for more detail later — fewer choices here does
              not limit how thorough Spark can be.
            </p>
          </section>
        ) : null}

        {phase === "preview" ? (
          <section
            className="vts-request__preview"
            data-testid="visual-thinking-recommendation-preview"
            aria-labelledby="vts-preview-heading"
          >
            <p className="vts-request__echo">{request.rawRequest}</p>
            <h2 id="vts-preview-heading" className="vts-request__section-title">
              Here&apos;s what I think would help:
            </h2>
            <p
              className="vts-request__summary"
              data-testid="visual-thinking-recommendation-summary"
            >
              {request.recommendationSummary}
            </p>
            {request.declinesMap ? (
              <p
                className="vts-request__note"
                data-testid="visual-thinking-no-map-honored"
              >
                No map required — we&apos;ll stay with a written result.
              </p>
            ) : null}
            <div className="vts-request__preview-actions">
              <button
                type="button"
                className="vts-request__primary"
                data-testid="visual-thinking-confirm-yes"
                onClick={handleConfirm}
              >
                Yes, create this
              </button>
              <button
                type="button"
                className="vts-request__secondary-btn"
                data-testid="visual-thinking-make-simpler"
                onClick={() =>
                  updateRequest(applyUserControl(request, "simplify"))
                }
              >
                Make it simpler
              </button>
              <button
                type="button"
                className="vts-request__secondary-btn"
                data-testid="visual-thinking-add-detail"
                onClick={() =>
                  updateRequest(applyUserControl(request, "add_detail"))
                }
              >
                Add more detail
              </button>
              <button
                type="button"
                className="vts-request__secondary-btn"
                data-testid="visual-thinking-different-format"
                onClick={() =>
                  updateRequest(applyUserControl(request, "different_format"))
                }
              >
                Choose a different format
              </button>
            </div>
          </section>
        ) : null}

        {phase === "confirmed" ? (
          <section
            className="vts-request__confirmed"
            data-testid="visual-thinking-confirmed"
          >
            <p className="vts-request__section-title">We&apos;re ready when you are.</p>
            <p className="vts-request__summary">
              {request.recommendationSummary}
            </p>
            <p className="vts-request__note">
              Full generation comes next — nothing has been built yet. You can
              still change direction anytime.
            </p>
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="visual-thinking-start-over"
              onClick={() => {
                clearVisualThinkingRequestDraft();
                setDraftText("");
                updateRequest(createVisualThinkingRequest({}));
              }}
            >
              Start a different request
            </button>
          </section>
        ) : null}

        {(phase === "user_led" || phase === "research_intake") &&
        request.rawRequest &&
        request.status !== "preview" &&
        request.status !== "awaiting_depth" ? (
          <p
            className="vts-request__path-note"
            data-testid={
              phase === "user_led"
                ? "visual-thinking-user-led-path"
                : "visual-thinking-research-path"
            }
          >
            {phase === "user_led"
              ? "User-led visual path — no map type choice and no research required."
              : "Research-assisted path — Spark will learn with you before building."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
