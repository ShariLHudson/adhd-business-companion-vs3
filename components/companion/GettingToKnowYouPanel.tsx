"use client";

import { useEffect, useState } from "react";
import {
  ALL_DISCOVERY_QUESTIONS,
  clearDiscoveryAnswer,
  disableDiscovery,
  disableDiscoverySection,
  discoveryDisabled,
  discoveryProgressSummary,
  DISCOVERY_SECTION_LABELS,
  enableDiscovery,
  enableDiscoverySection,
  getDiscoveryStore,
  isSectionDisabled,
  restartDiscovery,
  updateDiscoveryAnswer,
  type DiscoveryQuestionId,
  type DiscoverySectionId,
} from "@/lib/companionDiscovery";
import { getCurrentRelationshipPhase } from "@/lib/companionRelationshipPhases";
import { getPhase1OnboardingState } from "@/lib/phase1Onboarding";
import {
  buildWhatIveLearnedProfile,
  formatPhase2DiscoveryForPanel,
  formatWhatIveLearnedForPanel,
  getPhase2DiscoveryState,
  isPhase2DiscoveryActive,
  MILESTONE_LABELS,
} from "@/lib/phase2ProgressiveDiscovery";
import {
  formatMyOperatingManualForPanel,
  isPhase3AdaptiveRelationshipActive,
} from "@/lib/phase3AdaptiveRelationship";
import {
  formatBusinessOperatingManualForPanel,
  isPhase4BusinessOperatingPartnerActive,
} from "@/lib/phase4BusinessOperatingPartner";
import {
  formatLegacyIntelligenceForDisplay,
  formatPersonalOperatingManualForDisplay,
  formatWhatWeveBuiltTogetherForDisplay,
  formatWisdomEngineForDisplay,
  getPhase5EcosystemState,
  isPhase5CompanionIntelligenceEcosystemActive,
} from "@/lib/phase5CompanionIntelligenceEcosystem";
import {
  formatConnectedEcosystemForPanel,
  isPhase6CompanionIntelligenceNetworkActive,
} from "@/lib/phase6CompanionIntelligenceNetwork";
import {
  formatBusinessIntelligenceForPanel,
  isPhase7BusinessIntelligenceEcosystemActive,
} from "@/lib/businessIntelligenceEcosystem";
import {
  formatPreparedWorkspaceForPanel,
  isPhase8AutonomousPreparationActive,
} from "@/lib/autonomousPreparation";
import {
  formatWisdomIntelligenceForPanel,
  isPhase9WisdomIntelligenceActive,
} from "@/lib/wisdomIntelligence";
import {
  formatEcosystemIntelligenceForPanel,
  isPhase11EcosystemIntelligenceActive,
} from "@/lib/ecosystemIntelligence";
import {
  formatTransformationIntelligenceForPanel,
  isPhase10TransformationIntelligenceActive,
} from "@/lib/transformationIntelligence";

function ManualSection({
  title,
  children,
  onAccurate,
  onUpdate,
  showCorrection,
}: {
  title: string;
  children: React.ReactNode;
  onAccurate?: () => void;
  onUpdate?: () => void;
  showCorrection?: boolean;
}) {
  const [updateHint, setUpdateHint] = useState(false);
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-4">
      <p className="text-base font-semibold text-[#1f1c19]">{title}</p>
      <div className="mt-3 font-sans text-sm text-[#3d3630]">{children}</div>
      {showCorrection !== false ? (
        <div className="mt-4 border-t border-[#e7dfd4] pt-3">
          {updateHint ? (
            <p className="text-sm text-[#6b635a]">
              Tell me in chat what to adjust — I&apos;ll refine this over time.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={onAccurate}
                className="rounded-lg border border-[#b8d4d4] px-3 py-1.5 text-[#1e4f4f]"
              >
                That&apos;s accurate
              </button>
              <button
                type="button"
                onClick={() => {
                  setUpdateHint(true);
                  onUpdate?.();
                }}
                className="text-[#6b635a] underline"
              >
                Update this
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function PanelMarkdown({ text }: { text: string }) {
  return <pre className="whitespace-pre-wrap font-sans text-sm text-[#3d3630]">{text}</pre>;
}

export function GettingToKnowYouPanel({ onBack }: { onBack?: () => void }) {
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState<DiscoveryQuestionId | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    window.addEventListener("companion-discovery-updated", fn);
    window.addEventListener("companion-phase2-discovery-updated", fn);
    window.addEventListener("companion-phase3-relationship-updated", fn);
    window.addEventListener("companion-phase4-partner-updated", fn);
    window.addEventListener("companion-phase5-ecosystem-updated", fn);
    window.addEventListener("companion-phase6-network-updated", fn);
    window.addEventListener("companion-phase7-business-intelligence-updated", fn);
    window.addEventListener("companion-phase8-preparation-updated", fn);
    window.addEventListener("companion-phase9-wisdom-updated", fn);
    window.addEventListener("companion-phase11-ecosystem-updated", fn);
    window.addEventListener("companion-phase10-transformation-updated", fn);
    return () => {
      window.removeEventListener("companion-discovery-updated", fn);
      window.removeEventListener("companion-phase2-discovery-updated", fn);
      window.removeEventListener("companion-phase3-relationship-updated", fn);
      window.removeEventListener("companion-phase4-partner-updated", fn);
      window.removeEventListener("companion-phase5-ecosystem-updated", fn);
      window.removeEventListener("companion-phase6-network-updated", fn);
      window.removeEventListener("companion-phase7-business-intelligence-updated", fn);
      window.removeEventListener("companion-phase8-preparation-updated", fn);
      window.removeEventListener("companion-phase9-wisdom-updated", fn);
      window.removeEventListener("companion-phase11-ecosystem-updated", fn);
      window.removeEventListener("companion-phase10-transformation-updated", fn);
    };
  }, []);

  const store = getDiscoveryStore();
  const progress = discoveryProgressSummary();
  const sections = Object.keys(DISCOVERY_SECTION_LABELS) as DiscoverySectionId[];
  const relationshipPhase = getCurrentRelationshipPhase();
  const phaseNumber = relationshipPhase.number;
  const panelTitle = phaseNumber >= 3 ? "My Operating Manual™" : "Getting To Know You™";
  const phase1Profile = getPhase1OnboardingState().profile;
  const phase2Active = isPhase2DiscoveryActive();
  const phase2State = phase2Active ? getPhase2DiscoveryState() : null;
  const learnedProfile =
    phase2State && phase2State.sessionCount >= 1
      ? buildWhatIveLearnedProfile(phase2State)
      : null;
  const milestonesReached = learnedProfile?.milestonesReached ?? [];
  const phase3Active = isPhase3AdaptiveRelationshipActive();
  const phase4Active = isPhase4BusinessOperatingPartnerActive();
  const phase5Active = isPhase5CompanionIntelligenceEcosystemActive();
  const phase6Active = isPhase6CompanionIntelligenceNetworkActive();
  const phase7Active = isPhase7BusinessIntelligenceEcosystemActive();
  const phase8Active = isPhase8AutonomousPreparationActive();
  const phase9Active = isPhase9WisdomIntelligenceActive();
  const phase10Active = isPhase10TransformationIntelligenceActive();
  const phase11Active = isPhase11EcosystemIntelligenceActive();
  const phase5State = phase5Active ? getPhase5EcosystemState() : null;
  const businessStage = phase5State?.businessStage ?? phase1Profile.businessStage;

  function startEdit(id: DiscoveryQuestionId) {
    setEditing(id);
    setEditValue(store.answers[id] ?? "");
  }

  function saveEdit() {
    if (!editing || !editValue.trim()) return;
    updateDiscoveryAnswer(editing, editValue.trim());
    setEditing(null);
    setEditValue("");
    setTick((t) => t + 1);
  }

  const phase1Summary = [
    phase1Profile.businessType ? `**Business:** ${phase1Profile.businessType}` : null,
    phase1Profile.primaryChallenge
      ? `**Current Challenge:** ${phase1Profile.primaryChallenge}`
      : learnedProfile?.challenges[0]
        ? `**Current Challenge:** ${learnedProfile.challenges[0]}`
        : null,
    phase1Profile.immediateGoal || phase1Profile.desiredOutcome
      ? `**Current Goal:** ${phase1Profile.immediateGoal ?? phase1Profile.desiredOutcome}`
      : learnedProfile?.business.currentGoal
        ? `**Current Goal:** ${learnedProfile.business.currentGoal}`
        : null,
    phase1Profile.successDefinition || phase1Profile.winDefinition
      ? `**Success This Week:** ${phase1Profile.successDefinition ?? phase1Profile.winDefinition}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm font-semibold text-[#1e4f4f]"
        >
          ‹ Profile
        </button>
      ) : null}

      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{panelTitle}</p>
      <p className="mt-1 text-base text-[#6b635a]">{progress.label}</p>
      <p className="mt-1 text-sm text-[#9a8f82]">
        {phaseNumber >= 3
          ? "A living guide to how you work — human, supportive, and always yours to correct."
          : "Relationship-building, not a checklist. Edit, skip, or turn off anytime."}
      </p>
      <p className="mt-2 text-sm font-medium text-[#1e4f4f]">
        Phase {relationshipPhase.number}: {relationshipPhase.name}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (discoveryDisabled()) enableDiscovery();
            else disableDiscovery();
            setTick((t) => t + 1);
          }}
          className="rounded-lg border border-[#c9bfb0] px-3 py-1.5 text-sm font-semibold text-[#3d3630]"
        >
          {discoveryDisabled() ? "Turn questions back on" : "Turn off all questions"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Clear all discovery answers and start fresh?")) {
              restartDiscovery();
              setTick((t) => t + 1);
            }
          }}
          className="rounded-lg border border-[#c9bfb0] px-3 py-1.5 text-sm font-semibold text-[#a85c4a]"
        >
          Restart onboarding
        </button>
      </div>

      {phaseNumber <= 2 && (phase1Summary || learnedProfile) ? (
        <ManualSection title="What I've Learned So Far">
          {phase1Summary ? (
            <PanelMarkdown text={phase1Summary} />
          ) : learnedProfile ? (
            <PanelMarkdown text={formatWhatIveLearnedForPanel(learnedProfile)} />
          ) : null}
          {milestonesReached.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-[#3d3630]">
              {milestonesReached.map((id) => (
                <li key={id}>✓ {MILESTONE_LABELS[id]}</li>
              ))}
            </ul>
          ) : null}
        </ManualSection>
      ) : null}

      {phaseNumber === 2 && learnedProfile ? (
        <ManualSection title="Progressive Discovery™">
          <PanelMarkdown
            text={formatPhase2DiscoveryForPanel(
              learnedProfile,
              `Phase ${relationshipPhase.number}: ${relationshipPhase.name}`,
            )}
          />
        </ManualSection>
      ) : null}

      {phase3Active ? (
        <ManualSection title="My Operating Manual™">
          <PanelMarkdown text={formatMyOperatingManualForPanel()} />
        </ManualSection>
      ) : null}

      {phase4Active ? (
        <ManualSection title="Business Operating Manual™">
          <PanelMarkdown
            text={formatBusinessOperatingManualForPanel(undefined, businessStage)}
          />
        </ManualSection>
      ) : null}

      {phase5Active ? (
        <>
          <ManualSection title="Personal Operating Manual™">
            <PanelMarkdown text={formatPersonalOperatingManualForDisplay()} />
          </ManualSection>
          {!phase9Active ? (
            <ManualSection title="Wisdom Engine™">
              <p className="text-sm text-[#6b635a]">
                Personal insights only — specific to you, not generic advice.
              </p>
              <PanelMarkdown text={formatWisdomEngineForDisplay()} />
            </ManualSection>
          ) : null}
          <ManualSection title="What We've Built Together">
            <PanelMarkdown text={formatWhatWeveBuiltTogetherForDisplay()} />
            <div className="mt-4 border-t border-[#e7dfd4] pt-3">
              <PanelMarkdown text={formatLegacyIntelligenceForDisplay()} />
            </div>
          </ManualSection>
        </>
      ) : null}

      {phase6Active ? (
        <ManualSection title="Companion Intelligence Network™">
          <p className="text-sm text-[#6b635a]">
            The connected ecosystem — so you don&apos;t have to remember where things live.
          </p>
          <PanelMarkdown text={formatConnectedEcosystemForPanel()} />
        </ManualSection>
      ) : null}

      {phase7Active ? (
        <ManualSection title="Business Intelligence Ecosystem™">
          <p className="text-sm text-[#6b635a]">
            How your business grows, struggles, and where focus matters most — in plain language.
          </p>
          <PanelMarkdown text={formatBusinessIntelligenceForPanel()} />
        </ManualSection>
      ) : null}

      {phase8Active ? (
        <ManualSection title="Prepared For You">
          <p className="text-sm text-[#6b635a]">
            Resources gathered before you ask — you decide what to use.
          </p>
          <PanelMarkdown text={formatPreparedWorkspaceForPanel()} />
        </ManualSection>
      ) : null}

      {phase9Active ? (
        <ManualSection title="Personal Wisdom">
          <p className="text-sm text-[#6b635a]">
            What you&apos;ve learned works for you — earned from experience, not theory.
          </p>
          <PanelMarkdown text={formatWisdomIntelligenceForPanel()} />
        </ManualSection>
      ) : null}

      {phase10Active ? (
        <ManualSection title="Legacy & Transformation Intelligence™">
          <p className="text-sm text-[#6b635a]">
            Who you were, who you&apos;re becoming — growth, legacy, and evidence of change.
          </p>
          <PanelMarkdown text={formatTransformationIntelligenceForPanel()} />
        </ManualSection>
      ) : null}

      {phase11Active ? (
        <ManualSection title="Ecosystem Intelligence™">
          <p className="text-sm text-[#6b635a]">
            Your whole life system — capacity, energy, purpose, and how everything connects.
          </p>
          <PanelMarkdown text={formatEcosystemIntelligenceForPanel()} />
        </ManualSection>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        <p className="text-sm font-semibold text-[#6b635a]">Discovery answers</p>
        {sections.map((sectionId) => {
          const meta = DISCOVERY_SECTION_LABELS[sectionId];
          const questions = ALL_DISCOVERY_QUESTIONS.filter((q) => q.section === sectionId);
          const answered = questions.filter((q) => store.answers[q.id]);
          const sectionOff = isSectionDisabled(sectionId);

          return (
            <div
              key={sectionId}
              className="overflow-hidden rounded-xl border border-[#d4cdc3] bg-white/85"
            >
              <div className="flex items-start justify-between gap-2 px-4 py-3">
                <div>
                  <p className="text-base font-semibold text-[#1f1c19]">{meta.title}</p>
                  <p className="text-sm text-[#6b635a]">{meta.blurb}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (sectionOff) enableDiscoverySection(sectionId);
                    else disableDiscoverySection(sectionId);
                    setTick((t) => t + 1);
                  }}
                  className="shrink-0 text-xs font-semibold text-[#1e4f4f] underline"
                >
                  {sectionOff ? "Enable" : "Disable"}
                </button>
              </div>
              {sectionOff ? (
                <p className="border-t border-[#e7dfd4] px-4 py-2 text-sm text-[#9a8f82]">
                  Questions from this area are paused.
                </p>
              ) : answered.length === 0 ? (
                <p className="border-t border-[#e7dfd4] px-4 py-2 text-sm text-[#9a8f82]">
                  No discoveries here yet.
                </p>
              ) : (
                <ul className="border-t border-[#e7dfd4]">
                  {answered.map((q) => (
                    <li key={q.id} className="border-b border-[#e7dfd4] px-4 py-3 last:border-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                        {q.prompt}
                      </p>
                      {editing === q.id ? (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-w-0 flex-1 rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm"
                          />
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="text-sm font-semibold text-[#1e4f4f]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="text-sm text-[#6b635a]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="mt-1 text-base text-[#1f1c19]">{store.answers[q.id]}</p>
                          <div className="mt-2 flex gap-3 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => startEdit(q.id)}
                              className="text-[#1e4f4f] underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                clearDiscoveryAnswer(q.id);
                                setTick((t) => t + 1);
                              }}
                              className="text-[#a85c4a] underline"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
