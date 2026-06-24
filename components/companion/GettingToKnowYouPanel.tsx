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
  getQuestion,
  isSectionDisabled,
  restartDiscovery,
  updateDiscoveryAnswer,
  type DiscoveryQuestionId,
  type DiscoverySectionId,
} from "@/lib/companionDiscovery";
import {
  buildWhatIveLearnedProfile,
  formatWhatIveLearnedForDisplay,
  getPhase2DiscoveryState,
  isPhase2DiscoveryActive,
  MILESTONE_LABELS,
} from "@/lib/phase2ProgressiveDiscovery";
import {
  formatUserOperatingManualForDisplay,
  isPhase3AdaptiveRelationshipActive,
} from "@/lib/phase3AdaptiveRelationship";
import {
  buildBusinessHealthDashboard,
  formatBusinessHealthForDisplay,
  formatBusinessOperatingManualForDisplay,
  isPhase4BusinessOperatingPartnerActive,
} from "@/lib/phase4BusinessOperatingPartner";
import { getCurrentRelationshipPhase } from "@/lib/companionRelationshipPhases";

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
    return () => {
      window.removeEventListener("companion-discovery-updated", fn);
      window.removeEventListener("companion-phase2-discovery-updated", fn);
      window.removeEventListener("companion-phase3-relationship-updated", fn);
      window.removeEventListener("companion-phase4-partner-updated", fn);
    };
  }, []);

  const store = getDiscoveryStore();
  const progress = discoveryProgressSummary();
  const sections = Object.keys(DISCOVERY_SECTION_LABELS) as DiscoverySectionId[];
  const phase2Active = isPhase2DiscoveryActive();
  const phase2State = phase2Active ? getPhase2DiscoveryState() : null;
  const learnedProfile =
    phase2State && phase2State.sessionCount >= 2
      ? buildWhatIveLearnedProfile(phase2State)
      : null;
  const milestonesReached = learnedProfile?.milestonesReached ?? [];
  const relationshipPhase = getCurrentRelationshipPhase();
  const phase3Active = isPhase3AdaptiveRelationshipActive();
  const phase4Active = isPhase4BusinessOperatingPartnerActive();
  const businessHealth = phase4Active ? buildBusinessHealthDashboard() : null;

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

      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">Getting to know you</p>
      <p className="mt-1 text-base text-[#6b635a]">{progress.label}</p>
      <p className="mt-1 text-sm text-[#9a8f82]">
        Relationship-building, not a checklist. Edit, skip, or turn off anytime.
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

      {learnedProfile ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#b8d4d4] bg-[#f4faf9] px-4 py-4">
          <p className="text-base font-semibold text-[#1e4f4f]">
            What I&apos;ve learned about you
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            A living profile — updated as we work together, not a form you filled out.
          </p>
          {milestonesReached.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-[#3d3630]">
              {milestonesReached.map((id) => (
                <li key={id}>✓ {MILESTONE_LABELS[id]}</li>
              ))}
            </ul>
          ) : null}
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-[#3d3630]">
            {formatWhatIveLearnedForDisplay(learnedProfile)}
          </pre>
        </div>
      ) : null}

      {phase3Active ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-4">
          <p className="text-base font-semibold text-[#1f1c19]">User Operating Manual™</p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-[#3d3630]">
            {formatUserOperatingManualForDisplay()}
          </pre>
        </div>
      ) : null}

      {phase4Active ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#c9d4e8] bg-[#f6f8fc] px-4 py-4">
          <p className="text-base font-semibold text-[#2f3d5c]">Business Operating Partner™</p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-[#3d3630]">
            {formatBusinessHealthForDisplay(businessHealth!)}
          </pre>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-[#3d3630]">
            {formatBusinessOperatingManualForDisplay()}
          </pre>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
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
