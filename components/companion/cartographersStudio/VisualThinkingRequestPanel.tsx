"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  VISUAL_THINKING_DEPTH_QUESTION,
  VISUAL_THINKING_REQUEST_PLACEHOLDER,
  VISUAL_THINKING_RESEARCH_PROMPT,
  VISUAL_THINKING_STUDIO_SUPPORTING,
  VISUAL_THINKING_STUDIO_TITLE,
  VISUAL_THINKING_USER_LED_PROMPT,
  applyHelpDepth,
  applyRequestText,
  clearVisualThinkingRequestDraft,
  confirmRecommendation,
  createVisualThinkingRequest,
  loadVisualThinkingRequestDraft,
  saveVisualThinkingRequestDraft,
  visibleDepthChoices,
  type VisualThinkingHelpDepth,
  type VisualThinkingRequest,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import {
  applyUnderstandingCorrection,
  interpretVisualThinkingUnderstanding,
  projectUnderstandingPreview,
  syncRequestFromUnderstanding,
  type VisualThinkingUnderstanding,
} from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import {
  applyExperiencePlanOverride,
  deliverableLabel,
  orchestrateVisualThinkingExperience,
  projectExperiencePlanPreview,
  visibleSupportingDeliverables,
  type VisualThinkingDeliverable,
  type VisualThinkingExperiencePlan,
} from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import {
  applyBlockEdit,
  clearGenerationBundle,
  deepenDeliverable,
  getPrimaryDeliverable,
  getSupportingDeliverables,
  loadGenerationBundle,
  projectGenerationStatus,
  replaceDeliverableInBundle,
  saveGenerationBundle,
  simplifyDeliverable,
  startGenerationFromConfirmedPlan,
  type VisualThinkingGenerationBundle,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
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
  onresult:
    | ((event: {
        results: ArrayLike<{ 0: { transcript: string } }>;
      }) => void)
    | null;
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
 * Builds 2–4: Understanding → Orchestrator plan → Generation.
 */
export function VisualThinkingRequestPanel({
  onOpenPreviousWork,
  onConfirmed,
}: Props) {
  const [request, setRequest] = useState<VisualThinkingRequest>(() =>
    createVisualThinkingRequest({}),
  );
  const [understanding, setUnderstanding] =
    useState<VisualThinkingUnderstanding | null>(null);
  const [experiencePlan, setExperiencePlan] =
    useState<VisualThinkingExperiencePlan | null>(null);
  const [generationBundle, setGenerationBundle] =
    useState<VisualThinkingGenerationBundle | null>(null);
  const [activeDeliverableId, setActiveDeliverableId] = useState<string | null>(
    null,
  );
  const [draftText, setDraftText] = useState("");
  const [correctionText, setCorrectionText] = useState("");
  const [showCorrection, setShowCorrection] = useState(false);
  const [showAllDepth, setShowAllDepth] = useState(false);
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const existing = loadVisualThinkingRequestDraft();
    if (existing && existing.status !== "capturing") {
      setRequest(existing);
      setDraftText(existing.rawRequest);
      if (existing.rawRequest.trim()) {
        const understood = interpretVisualThinkingUnderstanding(existing);
        setUnderstanding(understood);
        setExperiencePlan(orchestrateVisualThinkingExperience(understood));
      }
    }
    const existingGen = loadGenerationBundle();
    if (existingGen) {
      setGenerationBundle(existingGen);
      setActiveDeliverableId(existingGen.run.primaryDeliverableId);
    }
  }, []);

  useEffect(() => {
    saveVisualThinkingRequestDraft(request);
  }, [request]);

  useEffect(() => {
    if (generationBundle) saveGenerationBundle(generationBundle);
  }, [generationBundle]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const understandingPreview = useMemo(
    () => (understanding ? projectUnderstandingPreview(understanding) : null),
    [understanding],
  );
  const planPreview = useMemo(
    () =>
      understanding && experiencePlan
        ? projectExperiencePlanPreview(experiencePlan, understanding)
        : null,
    [understanding, experiencePlan],
  );
  const preview = understandingPreview;
  const generationStatus = generationBundle
    ? projectGenerationStatus(generationBundle.run)
    : null;
  const primaryDeliverable = generationBundle
    ? getPrimaryDeliverable(generationBundle)
    : null;
  const supportingDeliverables = generationBundle
    ? getSupportingDeliverables(generationBundle)
    : [];
  const activeDeliverable =
    generationBundle?.deliverables.find((d) => d.id === activeDeliverableId) ??
    primaryDeliverable;

  function commitRequest(next: VisualThinkingRequest, reinterpret = true) {
    if (
      reinterpret &&
      next.rawRequest.trim() &&
      (next.status === "preview" ||
        next.status === "confirmed" ||
        next.status === "user_led")
    ) {
      const understood = interpretVisualThinkingUnderstanding(next);
      setUnderstanding(understood);
      setExperiencePlan(orchestrateVisualThinkingExperience(understood));
      setRequest(syncRequestFromUnderstanding(next, understood));
      return;
    }
    setRequest(next);
    if (!next.rawRequest.trim()) {
      setUnderstanding(null);
      setExperiencePlan(null);
    }
  }

  function applyUnderstanding(
    nextUnderstanding: VisualThinkingUnderstanding,
  ) {
    setUnderstanding(nextUnderstanding);
    setExperiencePlan(orchestrateVisualThinkingExperience(nextUnderstanding));
    setRequest((prev) =>
      syncRequestFromUnderstanding(prev, nextUnderstanding),
    );
  }

  function applyPlan(nextPlan: VisualThinkingExperiencePlan) {
    setExperiencePlan(nextPlan);
  }

  function handleContinue() {
    const text = (textareaRef.current?.value ?? draftText).trim();
    if (!text) {
      textareaRef.current?.focus();
      return;
    }
    setDraftText(text);
    const next = applyRequestText(request, text);
    commitRequest(next, true);
  }

  function handleDepth(
    depth: Exclude<VisualThinkingHelpDepth, "unspecified">,
  ) {
    const next = applyHelpDepth(request, depth);
    commitRequest(next, true);
  }

  function handleConfirm() {
    const confirmed = confirmRecommendation(request);
    setRequest(confirmed);
    if (!experiencePlan || !understanding) {
      onConfirmed?.(confirmed);
      return;
    }
    const confirmedPlan = applyExperiencePlanOverride(experiencePlan, {
      kind: "confirm",
    });
    setExperiencePlan(confirmedPlan);
    const bundle = startGenerationFromConfirmedPlan(confirmedPlan, {
      requestId: confirmed.id,
      understandingId: understanding.id,
      rawRequest: confirmed.rawRequest,
      userFacingGoal: understanding.userFacingGoal,
      successDefinition: understanding.successDefinition,
      suppliedContent: confirmed.rawRequest,
    });
    setGenerationBundle(bundle);
    setActiveDeliverableId(bundle.run.primaryDeliverableId);
    onConfirmed?.(confirmed);
  }

  function updateActiveDeliverable(
    next: NonNullable<typeof activeDeliverable>,
  ) {
    if (!generationBundle) return;
    setGenerationBundle(replaceDeliverableInBundle(generationBundle, next));
  }

  function startUserLed() {
    const next = createVisualThinkingRequest({
      rawRequest: draftText.trim(),
      entryPath: "user_led_visual",
    });
    setDraftText(next.rawRequest);
    commitRequest(next, true);
  }

  function startResearch() {
    const next = createVisualThinkingRequest({
      rawRequest: draftText.trim(),
      entryPath: "research_assisted",
    });
    setDraftText(next.rawRequest);
    commitRequest(next, Boolean(next.rawRequest.trim()));
  }

  function continueUserLedOrResearch() {
    const text = (textareaRef.current?.value ?? draftText).trim();
    if (!text) {
      textareaRef.current?.focus();
      return;
    }
    setDraftText(text);
    const next = applyRequestText({ ...request, rawRequest: text }, text);
    commitRequest(next, true);
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

  function removeSupporting(deliverable: VisualThinkingDeliverable) {
    if (!experiencePlan) return;
    applyPlan(
      applyExperiencePlanOverride(experiencePlan, {
        kind: "remove_supporting",
        deliverable,
      }),
    );
  }

  function submitCorrection() {
    if (!understanding || !correctionText.trim()) return;
    applyUnderstanding(
      applyUnderstandingCorrection(understanding, {
        kind: "natural_language",
        text: correctionText.trim(),
      }),
    );
    setCorrectionText("");
    setShowCorrection(false);
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
                  phase === "capturing"
                    ? handleContinue
                    : continueUserLedOrResearch
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
            <p
              className="vts-request__note"
              data-testid="visual-thinking-depth-full-detail"
            >
              You can always ask for more detail later — fewer choices here does
              not limit how thorough Spark can be.
            </p>
          </section>
        ) : null}

        {phase === "preview" && preview && understanding && experiencePlan && planPreview ? (
          <section
            className="vts-request__preview"
            data-testid="visual-thinking-recommendation-preview"
            aria-labelledby="vts-preview-heading"
          >
            <p className="vts-request__echo">{request.rawRequest}</p>

            <p className="vts-request__label">What I think you&apos;re trying to do</p>
            <p
              className="vts-request__goal"
              data-testid="visual-thinking-interpreted-goal"
            >
              {preview.goalLine}
            </p>

            <p className="vts-request__label">Primary experience</p>
            <p
              className="vts-request__experience"
              data-testid="visual-thinking-primary-experience"
            >
              {planPreview.experienceLine}
            </p>

            <h2 id="vts-preview-heading" className="vts-request__section-title">
              Here&apos;s what I recommend
            </h2>
            <p
              className="vts-request__summary"
              data-testid="visual-thinking-recommendation-summary"
            >
              {planPreview.primaryDeliverableLine}
            </p>

            {planPreview.showSupporting && planPreview.supportingLines.length > 0 ? (
              <div
                className="vts-request__supporting-block"
                data-testid="visual-thinking-supporting-outputs"
              >
                <p className="vts-request__label">I can also include</p>
                <ul className="vts-request__supporting-list">
                  {visibleSupportingDeliverables(experiencePlan).map(
                    (deliverable) => (
                      <li key={deliverable}>
                        <span>{deliverableLabel(deliverable)}</span>
                        <button
                          type="button"
                          className="vts-request__remove"
                          data-testid={`visual-thinking-remove-${deliverable}`}
                          onClick={() => removeSupporting(deliverable)}
                        >
                          Remove
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}

            {planPreview.researchLine ? (
              <p
                className="vts-request__note"
                data-testid="visual-thinking-research-note"
              >
                {planPreview.researchLine}
              </p>
            ) : null}

            {planPreview.interactionLine || preview.creationModeLine ? (
              <p
                className="vts-request__note"
                data-testid="visual-thinking-creation-mode-note"
              >
                {planPreview.interactionLine ?? preview.creationModeLine}
              </p>
            ) : null}

            <p
              className="vts-request__note vts-request__stages"
              data-testid="visual-thinking-generation-stages"
              hidden
            >
              {planPreview.stagesSummary}
            </p>

            {understanding.declinesMap ? (
              <p
                className="vts-request__note"
                data-testid="visual-thinking-no-map-honored"
              >
                No map required — we&apos;ll stay with a written result.
              </p>
            ) : null}

            {preview.clarificationQuestion ? (
              <p
                className="vts-request__note"
                data-testid="visual-thinking-clarification"
              >
                {preview.clarificationQuestion}
              </p>
            ) : null}

            {/* Guard: never expose technical labels */}
            <span className="sr-only" data-testid="visual-thinking-no-tech-labels">
              preview
            </span>

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
                onClick={() => {
                  if (!experiencePlan) return;
                  applyPlan(
                    applyExperiencePlanOverride(experiencePlan, {
                      kind: "set_detail",
                      detail: "essentials",
                    }),
                  );
                }}
              >
                Make it simpler
              </button>
              <button
                type="button"
                className="vts-request__secondary-btn"
                data-testid="visual-thinking-add-detail"
                onClick={() => {
                  if (!experiencePlan) return;
                  applyPlan(
                    applyExperiencePlanOverride(experiencePlan, {
                      kind: "set_detail",
                      detail: "detailed",
                    }),
                  );
                }}
              >
                Add more detail
              </button>
              <button
                type="button"
                className="vts-request__secondary-btn"
                data-testid="visual-thinking-change-included"
                onClick={() => setShowCorrection(true)}
              >
                Change what&apos;s included
              </button>
              <button
                type="button"
                className="vts-request__secondary-btn"
                data-testid="visual-thinking-build-myself"
                onClick={() => {
                  if (!understanding) return;
                  applyUnderstanding(
                    applyUnderstandingCorrection(understanding, {
                      kind: "build_myself",
                    }),
                  );
                }}
              >
                I want to build it myself
              </button>
              <button
                type="button"
                className="vts-request__secondary-btn"
                data-testid="visual-thinking-correct-goal"
                onClick={() => setShowCorrection(true)}
              >
                That&apos;s not what I mean
              </button>
            </div>

            {showCorrection ? (
              <div
                className="vts-request__correction"
                data-testid="visual-thinking-correction-box"
              >
                <label className="sr-only" htmlFor="vts-correction-input">
                  Correction
                </label>
                <textarea
                  id="vts-correction-input"
                  className="vts-request__textarea"
                  data-testid="visual-thinking-correction-input"
                  rows={2}
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  placeholder="Tell me what you meant — for example, this is for training my team."
                />
                <button
                  type="button"
                  className="vts-request__primary"
                  data-testid="visual-thinking-correction-submit"
                  onClick={submitCorrection}
                >
                  Update the plan
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {phase === "confirmed" && generationBundle && generationStatus ? (
          <section
            className="vts-request__confirmed"
            data-testid="visual-thinking-confirmed"
            data-generation-status={generationBundle.run.status}
          >
            <p
              className="vts-request__section-title"
              data-testid="visual-thinking-generation-status"
            >
              {generationStatus.headline}
            </p>
            {generationStatus.researchBlocked ? (
              <p
                className="vts-request__note"
                data-testid="visual-thinking-research-blocked"
              >
                {generationStatus.detail ??
                  "I'm ready to build this once the research is gathered."}
              </p>
            ) : null}

            {generationStatus.showReview && activeDeliverable ? (
              <div
                className="vts-request__deliverable"
                data-testid="visual-thinking-review-deliverable"
                data-deliverable-role={activeDeliverable.role}
              >
                <p className="vts-request__label">
                  {activeDeliverable.role === "primary"
                    ? "Primary result"
                    : "Supporting result"}
                </p>
                <h2 className="vts-request__section-title">
                  {activeDeliverable.title}
                </h2>
                <ul
                  className="vts-request__blocks"
                  data-testid="visual-thinking-deliverable-blocks"
                >
                  {activeDeliverable.blocks.map((b) => (
                    <li
                      key={b.id}
                      className="vts-request__block"
                      data-block-type={b.type}
                      data-user-edited={b.userEdited ? "true" : "false"}
                    >
                      {b.title ? (
                        <strong className="vts-request__block-title">
                          {b.title}
                        </strong>
                      ) : null}
                      {b.editable ? (
                        <textarea
                          className="vts-request__block-input"
                          data-testid={`visual-thinking-block-${b.id}`}
                          rows={b.type === "paragraph" ? 3 : 2}
                          value={b.content}
                          onChange={(e) => {
                            updateActiveDeliverable(
                              applyBlockEdit(activeDeliverable, {
                                kind: "edit",
                                blockId: b.id,
                                content: e.target.value,
                              }),
                            );
                          }}
                        />
                      ) : (
                        <p>{b.content}</p>
                      )}
                    </li>
                  ))}
                </ul>

                {activeDeliverable.visualShell ? (
                  <p
                    className="vts-request__note"
                    data-testid="visual-thinking-visual-shell-note"
                  >
                    {activeDeliverable.sourceMode === "user_led_shell"
                      ? "An editable visual shell is ready — not a completed map."
                      : "A visual structure is ready. The interactive canvas comes later."}
                  </p>
                ) : null}

                <div className="vts-request__preview-actions">
                  <button
                    type="button"
                    className="vts-request__secondary-btn"
                    data-testid="visual-thinking-simplify-deliverable"
                    onClick={() =>
                      updateActiveDeliverable(
                        simplifyDeliverable(activeDeliverable),
                      )
                    }
                  >
                    Make it simpler
                  </button>
                  <button
                    type="button"
                    className="vts-request__secondary-btn"
                    data-testid="visual-thinking-deepen-deliverable"
                    onClick={() =>
                      updateActiveDeliverable(
                        deepenDeliverable(activeDeliverable),
                      )
                    }
                  >
                    Add more detail
                  </button>
                </div>
              </div>
            ) : null}

            {supportingDeliverables.length > 0 ? (
              <div
                className="vts-request__supporting-block"
                data-testid="visual-thinking-generated-supporting"
              >
                <p className="vts-request__label">Also included</p>
                <ul className="vts-request__supporting-list">
                  {supportingDeliverables.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        className="vts-request__remove"
                        data-testid={`visual-thinking-open-supporting-${d.type}`}
                        onClick={() => setActiveDeliverableId(d.id)}
                      >
                        {d.title}
                      </button>
                    </li>
                  ))}
                </ul>
                {primaryDeliverable &&
                activeDeliverableId !== primaryDeliverable.id ? (
                  <button
                    type="button"
                    className="vts-request__secondary-btn"
                    data-testid="visual-thinking-back-to-primary"
                    onClick={() =>
                      setActiveDeliverableId(primaryDeliverable.id)
                    }
                  >
                    Back to primary result
                  </button>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="visual-thinking-start-over"
              onClick={() => {
                clearVisualThinkingRequestDraft();
                clearGenerationBundle();
                setDraftText("");
                setUnderstanding(null);
                setExperiencePlan(null);
                setGenerationBundle(null);
                setActiveDeliverableId(null);
                setRequest(createVisualThinkingRequest({}));
              }}
            >
              Start a different request
            </button>
          </section>
        ) : null}

        {phase === "confirmed" && !generationBundle ? (
          <section
            className="vts-request__confirmed"
            data-testid="visual-thinking-confirmed"
          >
            <p className="vts-request__section-title">
              We&apos;re ready when you are.
            </p>
            <p className="vts-request__note">
              Confirm from the recommendation to create your first version.
            </p>
          </section>
        ) : null}

        {phase === "user_led" && understanding ? (
          <p
            className="vts-request__path-note"
            data-testid="visual-thinking-user-led-path"
          >
            {preview?.creationModeLine ??
              "User-led visual path — no map type choice and no research required."}
          </p>
        ) : null}

        {phase === "research_intake" ? (
          <p
            className="vts-request__path-note"
            data-testid="visual-thinking-research-path"
          >
            Research-assisted path — Spark will learn with you before building.
          </p>
        ) : null}
      </div>
    </div>
  );
}
