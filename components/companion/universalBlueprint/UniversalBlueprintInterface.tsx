"use client";

import { useEffect, useState } from "react";
import "@/app/companion/universal-blueprint-interface.css";
import {
  buildBlueprintInterfaceSession,
  readBlueprintInterfaceSession,
  startFromBlueprintPath,
  startFromPreviousWorkPath,
  writeBlueprintInterfaceSession,
  type BlueprintBrowserItem,
  type BlueprintStartPath,
  type KnownContextReuseDecision,
} from "@/lib/universalBlueprintInterface";
import {
  ensureEventBlueprintsRegistered,
  getWorkBlueprintState,
  type BlueprintDepthMode,
  type WorkBlueprintState,
} from "@/lib/universalWorkEngine";
import { UniversalBlueprintEntry } from "./UniversalBlueprintEntry";
import { UniversalBlueprintBrowser } from "./UniversalBlueprintBrowser";
import { UniversalBlueprintPreview } from "./UniversalBlueprintPreview";
import { KnownContextReuseReview } from "./KnownContextReuseReview";
import { BuildFromPreviousWorkPanel } from "./BuildFromPreviousWorkPanel";
import { BlueprintDepthControls } from "./BlueprintDepthControls";
import { SaveAsBlueprintReviewPanel } from "./SaveAsBlueprintReviewPanel";

type Step =
  | "entry"
  | "browser"
  | "preview"
  | "known_context"
  | "previous"
  | "active"
  | "save_as";

type Props = {
  workTypeId: string;
  /** Known business/context values offered for reuse review. */
  knownContext?: Readonly<Record<string, string>>;
  inferredKeys?: readonly string[];
  recentBlueprintIds?: readonly string[];
  companyId?: string | null;
  companyRole?: string | null;
  /** Start From Scratch — host opens Create without forcing a Blueprint. */
  onStartFromScratch?: () => void;
  /** Called when UWE Work is initialized or resumed. */
  onWorkReady?: (state: WorkBlueprintState, startPath: BlueprintStartPath) => void;
  onClose?: () => void;
  /** When set, open directly into active depth/save controls for this Work. */
  resumeWorkId?: string | null;
};

/**
 * Universal Blueprint Interface — reusable for Event and future Work Types.
 * Calls only Universal Work Engine / Blueprint public exports.
 */
export function UniversalBlueprintInterface({
  workTypeId,
  knownContext = {},
  inferredKeys = [],
  recentBlueprintIds = [],
  companyId,
  companyRole,
  onStartFromScratch,
  onWorkReady,
  onClose,
  resumeWorkId,
}: Props) {
  const [step, setStep] = useState<Step>("entry");
  const [selected, setSelected] = useState<BlueprintBrowserItem | null>(null);
  const [depthMode, setDepthMode] =
    useState<BlueprintDepthMode>("guided_build");
  const [active, setActive] = useState<WorkBlueprintState | null>(null);
  const [startPath, setStartPath] = useState<BlueprintStartPath | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    ensureEventBlueprintsRegistered();
  }, []);

  useEffect(() => {
    if (!resumeWorkId) return;
    const session = readBlueprintInterfaceSession(resumeWorkId);
    const existing = getWorkBlueprintState(resumeWorkId);
    if (existing) {
      setActive(existing);
      setDepthMode(existing.depthMode);
      setStep("active");
      setStartPath(session?.startPath ?? "start_from_blueprint");
      setStatus("Welcome back — picking up where you left off.");
      return;
    }
    if (session) {
      setStep("entry");
      setStartPath(session.startPath);
      setStatus(
        "I still remember where we were, but that work isn’t open in this session yet. Choose how you’d like to continue.",
      );
    }
  }, [resumeWorkId]);

  const persist = (
    state: WorkBlueprintState,
    path: BlueprintStartPath,
    approvedKeys: readonly string[] = [],
  ) => {
    writeBlueprintInterfaceSession(
      buildBlueprintInterfaceSession({
        workId: state.workId,
        workTypeId: state.workTypeId,
        blueprintId: state.blueprintId,
        depthMode: state.depthMode,
        startPath: path,
        approvedKnownContextKeys: approvedKeys,
        sourceWorkId:
          state.provenance.kind === "previous_work"
            ? state.provenance.sourceWorkId
            : null,
      }),
    );
  };

  const finishInit = (
    state: WorkBlueprintState,
    path: BlueprintStartPath,
    approvedKeys: readonly string[] = [],
  ) => {
    setActive(state);
    setStartPath(path);
    setStep("active");
    setStatus("Saved — you can leave and come back to this exact place.");
    persist(state, path, approvedKeys);
    onWorkReady?.(state, path);
  };

  const runInitialize = (decision?: KnownContextReuseDecision) => {
    if (!selected) return;
    setError(null);
    try {
      const result = startFromBlueprintPath({
        blueprintId: selected.blueprintId,
        workTypeId,
        depthMode,
        version: selected.version,
        knownContext,
        inferredKeys,
        reuseDecision: decision ?? {
          approvedKeys: [],
          declinedKeys: Object.keys(knownContext),
          editedValues: {},
        },
      });
      finishInit(
        result.state,
        "start_from_blueprint",
        decision?.approvedKeys ?? [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "I couldn’t start from that Blueprint just now.",
      );
      setStep("preview");
    }
  };

  const choosePath = (path: BlueprintStartPath) => {
    setError(null);
    setStartPath(path);
    if (path === "start_from_scratch") {
      onStartFromScratch?.();
      return;
    }
    if (path === "start_from_blueprint") {
      setStep("browser");
      return;
    }
    setStep("previous");
  };

  return (
    <div
      className="ubi-root"
      data-testid="universal-blueprint-interface"
      data-ubi-step={step}
      data-work-type={workTypeId}
    >
      {onClose ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className="ubi-secondary"
            data-testid="ubi-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      ) : null}

      {step === "entry" ? (
        <UniversalBlueprintEntry onChoose={choosePath} />
      ) : null}

      {step === "browser" ? (
        <UniversalBlueprintBrowser
          workTypeId={workTypeId}
          recentBlueprintIds={recentBlueprintIds}
          onBack={() => setStep("entry")}
          onSelect={(item) => {
            setSelected(item);
            setStep("preview");
          }}
        />
      ) : null}

      {step === "preview" && selected ? (
        <UniversalBlueprintPreview
          blueprintId={selected.blueprintId}
          version={selected.version}
          selectedDepth={depthMode}
          onDepthChange={setDepthMode}
          onBack={() => setStep("browser")}
          error={error}
          onContinue={() => {
            const hasContext = Object.values(knownContext).some((v) =>
              Boolean(v?.trim()),
            );
            if (hasContext) {
              setStep("known_context");
            } else {
              runInitialize();
            }
          }}
        />
      ) : null}

      {step === "known_context" && selected ? (
        <KnownContextReuseReview
          blueprintId={selected.blueprintId}
          knownContext={knownContext}
          inferredKeys={inferredKeys}
          onBack={() => setStep("preview")}
          onSkipAll={() => runInitialize()}
          onConfirm={(decision) => runInitialize(decision)}
        />
      ) : null}

      {step === "previous" ? (
        <BuildFromPreviousWorkPanel
          workTypeId={workTypeId}
          onBack={() => setStep("entry")}
          onConfirm={({ source, approvedSectionIds }) => {
            setError(null);
            try {
              const result = startFromPreviousWorkPath({
                sourceWorkId: source.workId,
                targetWorkTypeId: workTypeId,
                blueprintId: source.blueprintId,
                approvedSectionIds,
                depthMode,
              });
              finishInit(result.state, "build_from_previous_work");
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "I couldn’t build from that previous work.",
              );
            }
          }}
        />
      ) : null}

      {step === "active" && active ? (
        <section data-testid="ubi-active-work">
          <h2 className="text-xl">You’re underway</h2>
          <p className="ubi-muted mt-2">
            Work is saved. Depth can change anytime without creating a
            duplicate.
          </p>
          <p
            className="mt-3 rounded-xl bg-[#e8f0f0] px-3 py-2 text-sm font-semibold text-[#1e4f4f]"
            data-testid="ubi-active-work-id"
          >
            Continuing {active.workId}
          </p>
          <div className="mt-4">
            <BlueprintDepthControls
              workId={active.workId}
              onChanged={(mode, workId) => {
                setActive((prev) =>
                  prev ? { ...prev, depthMode: mode, workId: workId as typeof prev.workId } : prev,
                );
                if (startPath) {
                  persist(
                    { ...active, depthMode: mode, workId: workId as typeof active.workId },
                    startPath,
                  );
                }
              }}
            />
          </div>
          <button
            type="button"
            className="ubi-secondary mt-4"
            data-testid="ubi-open-save-as"
            onClick={() => setStep("save_as")}
          >
            Save as Blueprint…
          </button>
        </section>
      ) : null}

      {step === "save_as" && active ? (
        <SaveAsBlueprintReviewPanel
          workId={active.workId}
          companyId={companyId}
          companyRole={companyRole}
          onCancel={() => setStep("active")}
          onSaved={(blueprintId, category) => {
            setStatus(
              category === "company"
                ? `Saved as a Company Blueprint (${blueprintId}).`
                : `Saved as a Personal Blueprint (${blueprintId}).`,
            );
            setStep("active");
          }}
        />
      ) : null}

      {status ? (
        <p className="ubi-status" data-testid="ubi-status" role="status">
          {status}
        </p>
      ) : null}
      {error && step !== "preview" ? (
        <p className="ubi-error" role="alert" data-testid="ubi-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
