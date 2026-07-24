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
import {
  applyKnowledgeGapAnswer,
  clearKnowledgeBundle,
  knowledgeHandoffToGenerationContext,
  loadKnowledgeBundle,
  prepareVisualThinkingKnowledge,
  projectKnowledgePreparationStatus,
  saveKnowledgeBundle,
  type VisualThinkingKnowledgeBundle,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import {
  applyPresentationOverride,
  clearPresentationPlan,
  collectPresentationStructureSignals,
  loadPresentationPlan,
  planVisualThinkingPresentation,
  projectPresentationWorkspace,
  savePresentationPlan,
  type VisualThinkingPresentationPlan,
} from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import {
  clearThinkingWorkspace,
  createThinkingWorkspace,
  loadThinkingWorkspace,
  saveThinkingWorkspace,
  type ThinkingWorkspaceState,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";
import {
  acquireVisualThinkingResearch,
  applyResearchToKnowledgeBundle,
  clearResearchBundle,
  dismissWorkspaceResearchNotification,
  knowledgeResearchSatisfiesGenerationGate,
  loadResearchBundle,
  planVisualThinkingResearch,
  projectResearchStatus,
  saveResearchBundle,
  type VisualThinkingResearchBundle,
  type VisualThinkingResearchFindingInput,
} from "@/lib/cartographersStudio/visualThinkingResearchAcquisition";
import {
  assessClarificationNecessity,
  assessRequestAuthorization,
  buildAutomaticContinuationPlan,
  resolveKnowledgeGap,
} from "@/lib/cartographersStudio/visualThinkingGenerateFirst";
import { runVisualThinkingResearchToResult } from "@/lib/cartographersStudio/visualThinkingResearchToResult";
import {
  applyCoCreationAction,
  applyRepresentationSyncChoice,
  autosaveEditingSession,
  clearEditingSession,
  createWorkspaceEditingSession,
  loadEditingSession,
  projectCoCreationInspector,
  updateSelection,
  type CoCreationActionId,
  type WorkspaceEditingSession,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceEditing";
import {
  buildLearningReturnV2,
  createAskInLearningHandoff,
  getSupportingWrittenLearningView,
  loadLearningIntegrationRequest,
  loadWorkspaceLearningContext,
} from "@/lib/learningIntelligence";
import { ThinkingWorkspace } from "@/components/companion/cartographersStudio/ThinkingWorkspace";
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
 * Builds 2–7: Understanding → Orchestrator → Knowledge → Generation → Presentation → Workspace.
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
  const [knowledgeBundle, setKnowledgeBundle] =
    useState<VisualThinkingKnowledgeBundle | null>(null);
  const [gapAnswer, setGapAnswer] = useState("");
  const [generationBundle, setGenerationBundle] =
    useState<VisualThinkingGenerationBundle | null>(null);
  const [presentationPlan, setPresentationPlan] =
    useState<VisualThinkingPresentationPlan | null>(null);
  const [thinkingWorkspace, setThinkingWorkspace] =
    useState<ThinkingWorkspaceState | null>(null);
  const [editingSession, setEditingSession] =
    useState<WorkspaceEditingSession | null>(null);
  const [coCreationNotice, setCoCreationNotice] = useState<string | null>(null);
  const [showLearningWritten, setShowLearningWritten] = useState(false);
  const [learningReturnNotice, setLearningReturnNotice] = useState<string | null>(
    null,
  );
  const [researchBundle, setResearchBundle] =
    useState<VisualThinkingResearchBundle | null>(null);
  const [researchDraft, setResearchDraft] = useState("");
  const [showWrittenReview, setShowWrittenReview] = useState(false);
  const [showThisDifferently, setShowThisDifferently] = useState(false);
  const [showAllAlternates, setShowAllAlternates] = useState(false);
  const [activeDeliverableId, setActiveDeliverableId] = useState<string | null>(
    null,
  );
  const [draftText, setDraftText] = useState("");
  const [correctionText, setCorrectionText] = useState("");
  const [showCorrection, setShowCorrection] = useState(false);
  const [showAllDepth, setShowAllDepth] = useState(false);
  const [listening, setListening] = useState(false);
  const [generateFirstAck, setGenerateFirstAck] = useState<string | null>(null);
  const [generateFirstProgress, setGenerateFirstProgress] = useState<string[]>(
    [],
  );
  const autoContinueLockRef = useRef(false);
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
    const existingKnowledge = loadKnowledgeBundle();
    if (existingKnowledge) setKnowledgeBundle(existingKnowledge);
    const existingGen = loadGenerationBundle();
    if (existingGen) {
      setGenerationBundle(existingGen);
      setActiveDeliverableId(existingGen.run.primaryDeliverableId);
    }
    const existingPresentation = loadPresentationPlan();
    if (existingPresentation) setPresentationPlan(existingPresentation);
    const existingWorkspace = loadThinkingWorkspace();
    if (existingWorkspace) setThinkingWorkspace(existingWorkspace);
    const existingEditing = loadEditingSession();
    if (existingEditing) setEditingSession(existingEditing);
    const existingResearch = loadResearchBundle();
    if (existingResearch) setResearchBundle(existingResearch);
  }, []);

  useEffect(() => {
    saveVisualThinkingRequestDraft(request);
  }, [request]);

  useEffect(() => {
    if (knowledgeBundle) saveKnowledgeBundle(knowledgeBundle);
  }, [knowledgeBundle]);

  useEffect(() => {
    if (generationBundle) saveGenerationBundle(generationBundle);
  }, [generationBundle]);

  useEffect(() => {
    if (presentationPlan) savePresentationPlan(presentationPlan);
  }, [presentationPlan]);

  useEffect(() => {
    if (thinkingWorkspace) saveThinkingWorkspace(thinkingWorkspace);
  }, [thinkingWorkspace]);

  useEffect(() => {
    if (editingSession && thinkingWorkspace) {
      autosaveEditingSession(editingSession, thinkingWorkspace);
    }
  }, [editingSession, thinkingWorkspace]);

  useEffect(() => {
    if (researchBundle) saveResearchBundle(researchBundle);
  }, [researchBundle]);

  // Restore interactive workspace when session has gen+presentation but no workspace yet.
  useEffect(() => {
    if (thinkingWorkspace) return;
    if (
      !generationBundle ||
      !presentationPlan ||
      !understanding ||
      !experiencePlan
    ) {
      return;
    }
    const restored = createThinkingWorkspace({
      understanding,
      experiencePlan,
      knowledgePackage: knowledgeBundle?.package ?? null,
      generationBundle,
      presentationPlan,
    });
    if (restored) {
      setThinkingWorkspace(restored);
      setEditingSession(
        createWorkspaceEditingSession({
          workspace: restored,
          generationBundle,
        }),
      );
    }
  }, [
    thinkingWorkspace,
    generationBundle,
    presentationPlan,
    understanding,
    experiencePlan,
    knowledgeBundle,
  ]);

  // Keep editing session aligned when a workspace opens with a generation bundle.
  useEffect(() => {
    if (!thinkingWorkspace || !generationBundle) return;
    if (editingSession?.workspaceId === thinkingWorkspace.id) return;
    setEditingSession(
      createWorkspaceEditingSession({
        workspace: thinkingWorkspace,
        generationBundle,
      }),
    );
  }, [thinkingWorkspace, generationBundle, editingSession?.workspaceId]);

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
  const knowledgeStatus = knowledgeBundle
    ? projectKnowledgePreparationStatus(knowledgeBundle)
    : null;
  const researchStatus = researchBundle
    ? projectResearchStatus(researchBundle)
    : null;
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
  const presentationWorkspace =
    presentationPlan && generationBundle
      ? projectPresentationWorkspace(presentationPlan, generationBundle, {
          showThisDifferentlyOpen: showThisDifferently,
          showAllAlternates,
          viewportWidth:
            typeof window !== "undefined" ? window.innerWidth : 1024,
        })
      : null;

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

  function runGenerateFirstPipeline(rawText: string) {
    const run = runVisualThinkingResearchToResult(rawText, {
      entryPath:
        request.entryPath === "research_assisted"
          ? "research_assisted"
          : "describe_request",
    });
    setGenerateFirstAck(run.acknowledgement);
    setGenerateFirstProgress(run.progressLabels);
    setRequest(run.request);
    setUnderstanding(run.understanding);
    setExperiencePlan(run.experiencePlan);
    setKnowledgeBundle(run.knowledgeBundle);
    setResearchBundle(run.researchBundle);
    setGenerationBundle(run.generationBundle);
    setPresentationPlan(run.presentationPlan);
    setThinkingWorkspace(run.workspace);
    if (run.workspace && run.generationBundle) {
      setEditingSession(
        createWorkspaceEditingSession({
          workspace: run.workspace,
          generationBundle: run.generationBundle,
        }),
      );
    } else {
      setEditingSession(null);
    }
    setCoCreationNotice(null);
    setActiveDeliverableId(
      run.generationBundle?.run.primaryDeliverableId ?? null,
    );
    setGapAnswer("");
    setShowThisDifferently(false);
    setShowWrittenReview(false);
    onConfirmed?.(run.request);
  }

  function handleContinue() {
    const text = (textareaRef.current?.value ?? draftText).trim();
    if (!text) {
      textareaRef.current?.focus();
      return;
    }
    setDraftText(text);
    const auth = assessRequestAuthorization(text);
    if (
      auth.authorized &&
      (auth.creationMode === "build_for_me" ||
        auth.creationMode === "build_myself")
    ) {
      autoContinueLockRef.current = true;
      runGenerateFirstPipeline(text);
      return;
    }
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
    const auth = assessRequestAuthorization(request.rawRequest);
    if (auth.skipRecommendationConfirm) {
      runGenerateFirstPipeline(request.rawRequest);
      return;
    }
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
    const knowledge = prepareVisualThinkingKnowledge({
      request: confirmed,
      understanding,
      experiencePlan: confirmedPlan,
      attachedStructuredContent: confirmed.rawRequest,
    });
    setKnowledgeBundle(knowledge);
    setGenerationBundle(null);
    setPresentationPlan(null);
    setThinkingWorkspace(null);
    setResearchBundle(null);
    clearResearchBundle();
    setResearchDraft("");
    setActiveDeliverableId(null);
    setGapAnswer("");
    setShowThisDifferently(false);
    setShowWrittenReview(false);
    onConfirmed?.(confirmed);
  }

  function beginResearchPlan() {
    if (!knowledgeBundle) return;
    const { plan, items } = planVisualThinkingResearch({
      knowledgeBundle,
      workspaceActive: Boolean(thinkingWorkspace),
    });
    setResearchBundle({
      plan,
      items,
      citations: [],
      conflicts: [],
      updatedKnowledgePackage: knowledgeBundle.package,
      updatedHandoff: knowledgeBundle.handoff,
      workspaceNotification: null,
      acquiredAt: null,
    });
  }

  function submitResearchFinding() {
    if (!knowledgeBundle || !researchDraft.trim()) return;
    const openGap =
      knowledgeBundle.package.knowledgeGaps.find(
        (g) =>
          g.status === "open" &&
          (g.researchNeeded || g.resolutionType === "external_research") &&
          g.priority === "required",
      ) ??
      knowledgeBundle.package.knowledgeGaps.find(
        (g) =>
          g.status === "open" &&
          (g.researchNeeded || g.resolutionType === "external_research"),
      );
    const userAuthorityGap = Boolean(
      openGap &&
        (openGap.userInputNeeded || openGap.resolutionType === "user_input"),
    );
    const finding: VisualThinkingResearchFindingInput = {
      knowledgeGapId: openGap?.id ?? null,
      question: openGap?.focusedQuestion || openGap?.description,
      content: researchDraft.trim(),
      title:
        openGap?.focusedQuestion?.slice(0, 80) ||
        openGap?.area ||
        "Verified detail",
      source: "Member-provided verified information",
      sourceCategory: userAuthorityGap
        ? "previously_verified_user_information"
        : "trusted_reference",
      confidence: "high",
      freshness: "current",
      verification: "verified",
      userAuthority: userAuthorityGap,
    };

    const acquired = acquireVisualThinkingResearch(
      {
        knowledgeBundle,
        workspaceActive: Boolean(thinkingWorkspace || generationBundle),
        strategyOverride: researchBundle?.plan.strategy,
      },
      [finding],
    );
    const nextKnowledge = applyResearchToKnowledgeBundle(
      knowledgeBundle,
      acquired,
    );
    setKnowledgeBundle(nextKnowledge);
    setResearchBundle(acquired);
    setResearchDraft("");
  }

  function beginGenerationFromKnowledge() {
    if (!experiencePlan || !understanding || !knowledgeBundle) return;
    const handoffCtx = knowledgeHandoffToGenerationContext(
      knowledgeBundle.handoff,
      {
        requestId: request.id,
        understandingId: understanding.id,
        rawRequest: request.rawRequest,
        userFacingGoal: understanding.userFacingGoal,
        successDefinition: understanding.successDefinition,
      },
      knowledgeBundle.package,
    );
    const researchFacts =
      researchBundle?.updatedKnowledgePackage.items
        .filter((i) => i.category === "research_acquired")
        .map((i) => i.content)
        .join("\n") ?? "";
    const supplied = [handoffCtx.suppliedContent, researchFacts]
      .filter(Boolean)
      .join("\n");
    const researchOpen = knowledgeBundle.package.knowledgeGaps.some(
      (g) =>
        g.status === "open" &&
        (g.researchNeeded || g.resolutionType === "external_research"),
    );
    let nextResearch = researchBundle;
    if (researchOpen && !researchBundle) {
      const planned = planVisualThinkingResearch({
        knowledgeBundle,
        workspaceActive: Boolean(thinkingWorkspace),
      });
      nextResearch = {
        plan: planned.plan,
        items: planned.items,
        citations: [],
        conflicts: [],
        updatedKnowledgePackage: knowledgeBundle.package,
        updatedHandoff: knowledgeBundle.handoff,
        workspaceNotification: null,
        acquiredAt: null,
      };
      setResearchBundle(nextResearch);
    }
    const bundle = startGenerationFromConfirmedPlan(experiencePlan, {
      requestId: handoffCtx.requestId,
      understandingId: handoffCtx.understandingId,
      rawRequest: handoffCtx.rawRequest,
      userFacingGoal: handoffCtx.userFacingGoal,
      successDefinition: handoffCtx.successDefinition,
      suppliedContent: supplied || handoffCtx.suppliedContent,
      topicHint: handoffCtx.topicHint,
      freshnessNotice: handoffCtx.freshnessNotice,
      // Never treat "research still open / only planned" as generation-complete.
      knowledgeResearchSatisfied:
        knowledgeResearchSatisfiesGenerationGate(nextResearch),
    });
    setGenerationBundle(bundle);
    setActiveDeliverableId(bundle.run.primaryDeliverableId);
    const nextPresentation = planVisualThinkingPresentation({
      understanding,
      experiencePlan,
      knowledgePackage: knowledgeBundle.package,
      generationBundle: bundle,
    });
    setPresentationPlan(nextPresentation);
    const workspace = createThinkingWorkspace({
      understanding,
      experiencePlan,
      knowledgePackage: knowledgeBundle.package,
      generationBundle: bundle,
      presentationPlan: nextPresentation,
    });
    if (workspace) setThinkingWorkspace(workspace);
    setShowThisDifferently(false);
    setShowAllAlternates(false);
    setShowWrittenReview(false);
  }

  function submitGapAnswer() {
    if (!knowledgeBundle || !understanding || !experiencePlan) return;
    if (!knowledgeStatus?.focusedGapId || !gapAnswer.trim()) return;
    const next = applyKnowledgeGapAnswer(
      knowledgeBundle,
      {
        request,
        understanding,
        experiencePlan,
        attachedStructuredContent: request.rawRequest,
      },
      knowledgeStatus.focusedGapId,
      gapAnswer.trim(),
    );
    setKnowledgeBundle(next);
    setGapAnswer("");
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
    const text = (textareaRef.current?.value ?? draftText).trim();
    if (!text) {
      textareaRef.current?.focus();
      return;
    }
    setDraftText(text);
    autoContinueLockRef.current = true;
    // Research and Build It for Me must continue through the full result pipeline.
    const seeded = createVisualThinkingRequest({
      rawRequest: text,
      entryPath: "research_assisted",
    });
    setRequest(seeded);
    runGenerateFirstPipeline(text);
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
  const requestAuth = useMemo(
    () =>
      request.rawRequest.trim()
        ? assessRequestAuthorization(request.rawRequest)
        : null,
    [request.rawRequest],
  );

  // Safety net: if a clear build_for_me request lands in preview, continue automatically.
  useEffect(() => {
    if (autoContinueLockRef.current) return;
    if (phase !== "preview" || generationBundle || knowledgeBundle) return;
    if (!requestAuth?.skipRecommendationConfirm) return;
    if (!request.rawRequest.trim()) return;
    autoContinueLockRef.current = true;
    runGenerateFirstPipeline(request.rawRequest);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot when preview appears
  }, [phase, request.rawRequest, requestAuth?.skipRecommendationConfirm]);

  return (
    <div
      className="vts-request"
      data-testid="visual-thinking-request-panel"
      data-vts-phase={phase}
      data-vts-background={CARTOGRAPHERS_STUDIO_BACKGROUND}
      data-vts-generate-first={
        requestAuth?.skipRecommendationConfirm ? "true" : "false"
      }
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
          {generateFirstAck ? (
            <p
              className="vts-request__supporting"
              data-testid="visual-thinking-generate-first-ack"
            >
              {generateFirstAck}
            </p>
          ) : null}
          {generateFirstProgress.length > 0 &&
          phase === "confirmed" &&
          !generationBundle ? (
            <p
              className="vts-request__note"
              data-testid="visual-thinking-generate-first-progress"
            >
              {generateFirstProgress[0]}
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
              {requestAuth?.skipRecommendationConfirm ? (
                <p
                  className="vts-request__note"
                  data-testid="visual-thinking-auto-creating"
                >
                  Creating your guide…
                </p>
              ) : (
              <button
                type="button"
                className="vts-request__primary"
                data-testid="visual-thinking-confirm-yes"
                onClick={handleConfirm}
              >
                Yes, create this
              </button>
              )}
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

        {phase === "confirmed" &&
        knowledgeBundle &&
        knowledgeStatus &&
        !generationBundle ? (
          <section
            className="vts-request__confirmed"
            data-testid="visual-thinking-confirmed"
            data-knowledge-status={knowledgeBundle.plan.status}
          >
            <p
              className="vts-request__section-title"
              data-testid="visual-thinking-knowledge-status"
            >
              {knowledgeStatus.headline}
            </p>
            {knowledgeStatus.showResearchNeeded ? (
              <div
                className="vts-request__research"
                data-testid="visual-thinking-knowledge-research-needed"
              >
                <p className="vts-request__note">
                  I can build the structure now, but I need current information
                  before I fill in the product-specific details.
                </p>
                {!researchBundle ? (
                  <button
                    type="button"
                    className="vts-request__secondary-btn"
                    data-testid="visual-thinking-begin-research"
                    onClick={beginResearchPlan}
                  >
                    Gather verified information
                  </button>
                ) : null}
                {researchStatus ? (
                  <div
                    className="vts-request__research-status"
                    data-testid="visual-thinking-research-status"
                    data-research-status={researchBundle?.plan.status}
                  >
                    <p className="vts-request__summary">
                      {researchStatus.headline}
                    </p>
                    <p className="vts-request__label">
                      Status: {researchStatus.statusLabel}
                      {researchStatus.conflictCount > 0
                        ? ` · ${researchStatus.conflictCount} conflict${researchStatus.conflictCount === 1 ? "" : "s"} noted`
                        : ""}
                      {researchStatus.citationCount > 0
                        ? ` · ${researchStatus.citationCount} source${researchStatus.citationCount === 1 ? "" : "s"}`
                        : ""}
                    </p>
                    {researchStatus.showFreshnessWarning ? (
                      <p
                        className="vts-request__note"
                        data-testid="visual-thinking-research-freshness-warning"
                      >
                        Some details may need a current source — I will not
                        pretend outdated information is fresh.
                      </p>
                    ) : null}
                    {researchBundle &&
                    researchBundle.conflicts.length > 0 ? (
                      <p
                        className="vts-request__note"
                        data-testid="visual-thinking-research-conflict"
                      >
                        Sources disagree on at least one point. I will keep both
                        visible and treat the answer as uncertain.
                      </p>
                    ) : null}
                    {researchStatus.requiredRemaining > 0 ||
                    researchBundle?.plan.status === "ready" ||
                    researchBundle?.plan.status === "partial" ? (
                      <div className="vts-request__correction">
                        <p className="vts-request__summary">
                          {researchBundle?.items.find(
                            (i) =>
                              i.priority === "required" &&
                              (i.status === "planned" ||
                                i.status === "still_unresolved"),
                          )?.question ??
                            "What verified detail should we add?"}
                        </p>
                        <textarea
                          className="vts-request__textarea"
                          data-testid="visual-thinking-research-finding"
                          rows={2}
                          value={researchDraft}
                          onChange={(e) => setResearchDraft(e.target.value)}
                          placeholder="Add a verified detail you trust…"
                        />
                        <button
                          type="button"
                          className="vts-request__primary"
                          data-testid="visual-thinking-research-finding-submit"
                          onClick={submitResearchFinding}
                        >
                          Add verified information
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
            {knowledgeStatus.showMissingQuestion &&
            knowledgeStatus.focusedQuestion ? (
              <div
                className="vts-request__correction"
                data-testid="visual-thinking-knowledge-question"
              >
                <p className="vts-request__summary">
                  {knowledgeStatus.focusedQuestion}
                </p>
                <textarea
                  className="vts-request__textarea"
                  data-testid="visual-thinking-knowledge-answer"
                  rows={2}
                  value={gapAnswer}
                  onChange={(e) => setGapAnswer(e.target.value)}
                  placeholder="Add what you know…"
                />
                <button
                  type="button"
                  className="vts-request__primary"
                  data-testid="visual-thinking-knowledge-answer-submit"
                  onClick={submitGapAnswer}
                >
                  Continue
                </button>
              </div>
            ) : null}
            {knowledgeBundle.package.conflicts.length > 0 ? (
              <p
                className="vts-request__note"
                data-testid="visual-thinking-knowledge-conflict-note"
              >
                I noticed a few details that don&apos;t quite agree yet — I&apos;ll
                keep both visible so nothing is quietly overwritten.
              </p>
            ) : null}
            <div className="vts-request__preview-actions">
              {requestAuth?.skipSafeOutlineGate &&
              knowledgeStatus.canProceedGenerateFirst ? (
                <p
                  className="vts-request__note"
                  data-testid="visual-thinking-auto-generating"
                >
                  Creating your guide…
                </p>
              ) : null}
              {!requestAuth?.skipSafeOutlineGate &&
              knowledgeStatus.canCreateFully ? (
                <button
                  type="button"
                  className="vts-request__primary"
                  data-testid="visual-thinking-begin-generation"
                  onClick={beginGenerationFromKnowledge}
                >
                  Create this
                </button>
              ) : null}
              {!requestAuth?.skipSafeOutlineGate &&
              knowledgeStatus.canContinueSafeOutline &&
              !knowledgeStatus.canCreateFully ? (
                <button
                  type="button"
                  className="vts-request__primary"
                  data-testid="visual-thinking-begin-safe-outline"
                  onClick={beginGenerationFromKnowledge}
                >
                  Continue with a safe outline
                </button>
              ) : null}
            </div>
            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="visual-thinking-start-over"
              onClick={() => {
                clearVisualThinkingRequestDraft();
                clearKnowledgeBundle();
                clearGenerationBundle();
                clearPresentationPlan();
                clearThinkingWorkspace();
                clearEditingSession();
                clearResearchBundle();
                setDraftText("");
                setUnderstanding(null);
                setExperiencePlan(null);
                setKnowledgeBundle(null);
                setGenerationBundle(null);
                setPresentationPlan(null);
                setThinkingWorkspace(null);
                setEditingSession(null);
                setCoCreationNotice(null);
                setResearchBundle(null);
                setResearchDraft("");
                setActiveDeliverableId(null);
                setShowWrittenReview(false);
                setRequest(createVisualThinkingRequest({}));
              }}
            >
              Start a different request
            </button>
          </section>
        ) : null}

        {phase === "confirmed" && generationBundle && generationStatus ? (
          <section
            className="vts-request__confirmed vts-presentation"
            data-testid="visual-thinking-confirmed"
            data-generation-status={generationBundle.run.status}
            data-presentation={
              presentationWorkspace?.activePresentation ?? "none"
            }
            data-split-mode={presentationWorkspace?.splitViewMode ?? "unavailable"}
            data-workspace={thinkingWorkspace ? "open" : "none"}
          >
            <header className="vts-presentation__bar">
              <div className="vts-presentation__bar-main">
                <h2
                  className="vts-request__section-title"
                  data-testid="visual-thinking-presentation-title"
                >
                  {presentationWorkspace?.title ??
                    activeDeliverable?.title ??
                    "Your result"}
                </h2>
                <p
                  className="vts-request__label"
                  data-testid="visual-thinking-active-presentation"
                >
                  {presentationWorkspace?.activePresentationLabel ??
                    generationStatus.headline}
                </p>
              </div>
              <div className="vts-presentation__bar-actions">
                <button
                  type="button"
                  className="vts-request__secondary-btn"
                  data-testid="visual-thinking-show-differently"
                  aria-expanded={showThisDifferently}
                  onClick={() => setShowThisDifferently((v) => !v)}
                >
                  Show this differently
                </button>
                <button
                  type="button"
                  className="vts-request__secondary-btn"
                  data-testid="visual-thinking-toggle-written-review"
                  aria-pressed={showWrittenReview}
                  onClick={() => setShowWrittenReview((v) => !v)}
                >
                  {showWrittenReview ? "Hide written review" : "Written review"}
                </button>
                <label className="vts-presentation__density">
                  <span className="vts-request__label">View</span>
                  <select
                    className="vts-presentation__density-select"
                    data-testid="visual-thinking-density"
                    aria-label="Information density"
                    value={
                      presentationPlan?.userOverrides.informationDensity ??
                      presentationPlan?.informationDensity ??
                      "balanced"
                    }
                    onChange={(e) => {
                      if (!presentationPlan) return;
                      setPresentationPlan(
                        applyPresentationOverride(presentationPlan, {
                          kind: "set_density",
                          density: e.target.value as
                            | "low"
                            | "balanced"
                            | "high",
                        }),
                      );
                    }}
                  >
                    <option value="low">Focus</option>
                    <option value="balanced">Balanced</option>
                    <option value="high">Show more</option>
                  </select>
                </label>
              </div>
            </header>

            {presentationWorkspace?.incompletenessVisible ? (
              <p
                className="vts-request__note"
                data-testid="visual-thinking-incomplete-notice"
                role="status"
              >
                {presentationWorkspace.incompletenessMessage}
              </p>
            ) : null}

            {generationStatus.researchBlocked ? (
              <p
                className="vts-request__note"
                data-testid="visual-thinking-research-blocked"
              >
                {generationStatus.detail ??
                  "I'm ready to build this once the research is gathered."}
              </p>
            ) : null}

            {showThisDifferently && presentationWorkspace ? (
              <div
                className="vts-presentation__alternates"
                data-testid="visual-thinking-presentation-alternates"
              >
                <p className="vts-request__label">Eligible views</p>
                <ul className="vts-request__choices">
                  {presentationWorkspace.alternatePresentations.map((alt) => (
                    <li key={alt.type}>
                      <button
                        type="button"
                        className="vts-request__choice"
                        data-testid={`visual-thinking-alt-${alt.type}`}
                        onClick={() => {
                          if (!presentationPlan || !understanding || !experiencePlan)
                            return;
                          const signals = collectPresentationStructureSignals({
                            understanding,
                            experiencePlan,
                            knowledgePackage: knowledgeBundle?.package ?? null,
                            generationBundle,
                          });
                          const nextPlan = applyPresentationOverride(
                            presentationPlan,
                            {
                              kind: "set_presentation",
                              presentation: alt.type,
                            },
                            signals,
                          );
                          setPresentationPlan(nextPlan);
                          const switched = createThinkingWorkspace({
                            understanding,
                            experiencePlan,
                            knowledgePackage: knowledgeBundle?.package ?? null,
                            generationBundle,
                            presentationPlan: nextPlan,
                          });
                          if (switched) setThinkingWorkspace(switched);
                          setShowThisDifferently(false);
                          setShowWrittenReview(false);
                        }}
                      >
                        {alt.label}
                      </button>
                    </li>
                  ))}
                </ul>
                {!showAllAlternates &&
                (presentationPlan?.availablePresentations.length ?? 0) >
                  presentationWorkspace.alternatePresentations.length + 1 ? (
                  <button
                    type="button"
                    className="vts-request__more"
                    data-testid="visual-thinking-more-alternates"
                    onClick={() => setShowAllAlternates(true)}
                  >
                    Show more ways
                  </button>
                ) : null}
              </div>
            ) : null}

            {thinkingWorkspace && generationBundle ? (
              <ThinkingWorkspace
                workspace={thinkingWorkspace}
                deliverables={generationBundle.deliverables}
                onWorkspaceChange={(next) => {
                  setThinkingWorkspace(next);
                  if (editingSession) {
                    const synced = updateSelection(
                      editingSession,
                      next,
                      next.selection.primaryObjectId
                        ? [next.selection.primaryObjectId]
                        : [],
                    );
                    setEditingSession({
                      ...synced.session,
                      generationBundle:
                        synced.session.generationBundle ?? generationBundle,
                    });
                  }
                }}
                researchNotification={researchBundle?.workspaceNotification}
                onDismissResearchNotification={() => {
                  if (!researchBundle) return;
                  setResearchBundle(
                    dismissWorkspaceResearchNotification(researchBundle),
                  );
                }}
                onReviewResearch={() => {
                  setShowWrittenReview(true);
                }}
                coCreationInspector={
                  editingSession
                    ? projectCoCreationInspector(editingSession, thinkingWorkspace)
                    : null
                }
                syncPreview={editingSession?.pendingSyncPreview ?? null}
                coCreationNotice={coCreationNotice}
                onSyncChoice={(choice) => {
                  if (!editingSession) return;
                  setEditingSession(
                    applyRepresentationSyncChoice(editingSession, choice),
                  );
                  setCoCreationNotice(
                    choice === "keep_current"
                      ? "Kept your current views."
                      : "Related views will stay in sync with this change.",
                  );
                }}
                onCoCreateAction={(action: CoCreationActionId) => {
                  if (!editingSession || !thinkingWorkspace) return;
                  const payload =
                    action === "annotate"
                      ? {
                          annotationText:
                            window.prompt(
                              "Add a private note for this piece",
                              "",
                            ) ?? undefined,
                          annotationType: "personal_note" as const,
                        }
                      : action === "ask_board"
                        ? {
                            question:
                              window.prompt(
                                "What should the Board focus on?",
                                "What would you improve here?",
                              ) ?? "What would you improve here?",
                          }
                        : undefined;
                  if (action === "annotate" && !payload?.annotationText) return;
                  const result = applyCoCreationAction(
                    editingSession,
                    thinkingWorkspace,
                    action,
                    payload,
                  );
                  setEditingSession(result.session);
                  setThinkingWorkspace(result.workspace);
                  setGenerationBundle(result.generationBundle);
                  setCoCreationNotice(result.userFacingNotice);
                }}
                onAskShari={(prompt, context) => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("visual-thinking-ask-shari", {
                        detail: { prompt, context },
                      }),
                    );
                  }
                }}
                learningPilot={(() => {
                  const learningCtx = loadWorkspaceLearningContext();
                  const learningReq = loadLearningIntegrationRequest();
                  if (!learningCtx || !learningReq) return null;
                  const written = getSupportingWrittenLearningView(learningReq);
                  return {
                    topic: learningCtx.learningTopic,
                    writtenExplanationAvailable: written.available,
                    onOpenWrittenExplanation: () => setShowLearningWritten(true),
                    onAskInLearning: () => {
                      const selectedId =
                        thinkingWorkspace.selection.primaryObjectId;
                      const selected = selectedId
                        ? thinkingWorkspace.objects.find((o) => o.id === selectedId)
                        : null;
                      const question =
                        window.prompt(
                          "What would you like to ask in Learning?",
                          learningReq.learnerQuestion ??
                            "I have a question about this part.",
                        ) ?? "";
                      if (!question.trim()) return;
                      createAskInLearningHandoff({
                        sourceLearningSessionId:
                          learningCtx.sourceLearningSessionId,
                        visualThinkingWorkspaceId: thinkingWorkspace.id,
                        question: question.trim(),
                        selectedObjectIds: selectedId ? [selectedId] : [],
                        selectedObjectSummaries: selected
                          ? [`${selected.title} — ${selected.summary}`]
                          : [],
                        relevantKnowledgeItemIds:
                          learningCtx.approvedKnowledgeItemIds.slice(0, 8),
                        currentPresentation:
                          learningCtx.currentPresentation,
                      });
                      const ret = buildLearningReturnV2({
                        request: learningReq,
                        visualThinkingWorkspaceId: thinkingWorkspace.id,
                        pendingQuestion: question.trim(),
                        requestedResumeAction: "ask_my_visual_question",
                      });
                      setLearningReturnNotice(ret.resumeMessage);
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("visual-thinking-return-to-learning", {
                            detail: { returnPayload: ret, askInLearning: true },
                          }),
                        );
                      }
                    },
                    onReturnToLearning: () => {
                      const ret = buildLearningReturnV2({
                        request: learningReq,
                        visualThinkingWorkspaceId: thinkingWorkspace.id,
                        activePresentation: learningCtx.currentPresentation,
                      });
                      setLearningReturnNotice(ret.resumeMessage);
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("visual-thinking-return-to-learning", {
                            detail: { returnPayload: ret },
                          }),
                        );
                      }
                    },
                  };
                })()}
              />
            ) : null}

            {showLearningWritten && loadLearningIntegrationRequest() ? (
              <section
                className="vts-request__section"
                data-testid="learning-written-explanation"
                aria-label="Written learning explanation"
              >
                <h3 className="vts-request__section-title">
                  {
                    getSupportingWrittenLearningView(
                      loadLearningIntegrationRequest()!,
                    ).title
                  }
                </h3>
                <p className="vts-request__note">
                  {
                    getSupportingWrittenLearningView(
                      loadLearningIntegrationRequest()!,
                    ).body
                  }
                </p>
                <button
                  type="button"
                  className="vts-request__secondary-btn"
                  onClick={() => setShowLearningWritten(false)}
                >
                  Close written explanation
                </button>
              </section>
            ) : null}

            {learningReturnNotice ? (
              <p
                className="vts-request__note"
                data-testid="learning-return-notice"
                role="status"
              >
                {learningReturnNotice}
              </p>
            ) : null}

            {generationStatus.showReview &&
            activeDeliverable &&
            (showWrittenReview || !thinkingWorkspace) ? (
              <div
                className={`vts-request__deliverable vts-presentation__primary${
                  presentationWorkspace?.splitViewMode === "side_by_side"
                    ? " vts-presentation__primary--split"
                    : ""
                }`}
                data-testid="visual-thinking-review-deliverable"
                data-deliverable-role={
                  activeDeliverable.role === "primary" ||
                  activeDeliverable.id === primaryDeliverable?.id
                    ? "primary"
                    : "supporting"
                }
              >
                <p className="vts-request__label">
                  {activeDeliverable.role === "primary" ||
                  activeDeliverable.id === primaryDeliverable?.id
                    ? "Primary result"
                    : "Supporting result"}
                </p>
                <h3 className="vts-request__section-title">
                  {activeDeliverable.title}
                </h3>
                <ul
                  className="vts-request__blocks"
                  data-testid="visual-thinking-deliverable-blocks"
                >
                  {activeDeliverable.blocks.map((b) => {
                    const hidden =
                      presentationWorkspace &&
                      activeDeliverable.role === "primary" &&
                      presentationWorkspace.collapsedBlockIds.includes(b.id) &&
                      !presentationWorkspace.visibleBlockIds.includes(b.id);
                    if (hidden) {
                      return (
                        <li key={b.id} className="vts-request__block vts-request__block--collapsed">
                          <button
                            type="button"
                            className="vts-request__more"
                            data-testid={`visual-thinking-expand-block-${b.id}`}
                            onClick={() => {
                              if (!presentationPlan) return;
                              setPresentationPlan(
                                applyPresentationOverride(presentationPlan, {
                                  kind: "toggle_section",
                                  sectionId: b.id,
                                  expanded: true,
                                }),
                              );
                            }}
                          >
                            Show more
                          </button>
                        </li>
                      );
                    }
                    return (
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
                    );
                  })}
                </ul>

                {presentationWorkspace?.userLedShell ||
                activeDeliverable.visualShell ? (
                  <div
                    className="vts-presentation__canvas-shell"
                    data-testid="visual-thinking-visual-shell-note"
                  >
                    <p className="vts-request__note">
                      {activeDeliverable.sourceMode === "user_led_shell" ||
                      presentationWorkspace?.userLedShell
                        ? "Your visual workspace is ready — not a completed map."
                        : thinkingWorkspace
                          ? "Use the Thinking Workspace above to arrange and explore."
                          : "A visual structure is ready for the Thinking Workspace."}
                    </p>
                    {presentationWorkspace?.userLedShell ? (
                      <ul className="vts-presentation__shell-actions">
                        {presentationWorkspace.userLedActions.map((action) => (
                          <li key={action}>
                            <button
                              type="button"
                              className="vts-request__secondary-btn"
                              data-testid={`visual-thinking-shell-${action
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                              onClick={() => {
                                if (action === "Open Previous Work") {
                                  onOpenPreviousWork();
                                }
                              }}
                            >
                              {action}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
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

            {supportingDeliverables.length > 0 &&
            presentationWorkspace?.showSupporting !== false ? (
              <aside
                className="vts-request__supporting-block vts-presentation__supporting"
                data-testid="visual-thinking-generated-supporting"
              >
                <p className="vts-request__label">
                  {presentationWorkspace?.supportingLabel ?? "Also available"}
                </p>
                <ul className="vts-request__supporting-list">
                  {supportingDeliverables.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        className="vts-request__remove"
                        data-testid={`visual-thinking-open-supporting-${d.type}`}
                        onClick={() => {
                          setActiveDeliverableId(d.id);
                          if (presentationPlan) {
                            setPresentationPlan(
                              applyPresentationOverride(presentationPlan, {
                                kind: "select_supporting",
                                deliverableId: d.id,
                              }),
                            );
                          }
                        }}
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
              </aside>
            ) : null}

            <button
              type="button"
              className="vts-request__secondary-btn"
              data-testid="visual-thinking-start-over"
              onClick={() => {
                clearVisualThinkingRequestDraft();
                clearKnowledgeBundle();
                clearGenerationBundle();
                clearPresentationPlan();
                clearThinkingWorkspace();
                clearEditingSession();
                clearResearchBundle();
                setDraftText("");
                setUnderstanding(null);
                setExperiencePlan(null);
                setKnowledgeBundle(null);
                setGenerationBundle(null);
                setPresentationPlan(null);
                setThinkingWorkspace(null);
                setEditingSession(null);
                setCoCreationNotice(null);
                setResearchBundle(null);
                setResearchDraft("");
                setActiveDeliverableId(null);
                setShowThisDifferently(false);
                setShowWrittenReview(false);
                setRequest(createVisualThinkingRequest({}));
              }}
            >
              Start a different request
            </button>
          </section>
        ) : null}

        {phase === "confirmed" && !knowledgeBundle && !generationBundle ? (
          <section
            className="vts-request__confirmed"
            data-testid="visual-thinking-confirmed"
          >
            <p className="vts-request__section-title">
              We&apos;re ready when you are.
            </p>
            <p className="vts-request__note">
              Confirm from the recommendation to prepare what we already know.
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
