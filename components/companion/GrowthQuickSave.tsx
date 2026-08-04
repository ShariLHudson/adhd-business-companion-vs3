"use client";

import { useMemo, useState } from "react";
import {
  quickSaveDestinationLabel,
  recommendQuickSaveDestination,
  type QuickSaveDestination,
} from "@/lib/growthQuickSave";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";
import { createEvidenceEntry } from "@/lib/evidenceBankStore";
import { createJourneyEntry } from "@/lib/myJourneyStore";
import { createPortfolioEntry } from "@/lib/portfolioStore";
import type { GrowthVaultSectionId } from "@/lib/growthCenterHub";
import {
  openGrowthVaultHubSection,
  openOutcomeGoalsHubTab,
} from "@/lib/growthCenterHub";
import { OutcomeGoalMultiLinkPicker } from "@/components/companion/OutcomeGoalMultiLinkPicker";
import { packGoalLinks } from "@/lib/goals/goalLinking";

const INPUT =
  "mt-2 w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]";

type Props = {
  onSaved: () => void;
  onOpenHubSection: (id: GrowthVaultSectionId) => void;
  onOpenOutcomeTab?: () => void;
};

export function GrowthQuickSave({ onSaved, onOpenHubSection, onOpenOutcomeTab }: Props) {
  const [text, setText] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [linkedGoalIds, setLinkedGoalIds] = useState<string[]>([]);

  const recommendation = useMemo(
    () => recommendQuickSaveDestination(text),
    [text],
  );

  function saveTo(destination: QuickSaveDestination) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const goalLinks = packGoalLinks(linkedGoalIds);

    switch (destination) {
      case "wins":
        createSavedGrowthWin({
          whatHappened: trimmed,
          ts: new Date().toISOString(),
          icon: "🏆",
          attachments: [],
          ...goalLinks,
        });
        setSavedMessage("Saved to My Wins™.");
        openGrowthVaultHubSection("wins-this-week");
        onOpenHubSection("wins-this-week");
        break;
      case "evidence":
        createEvidenceEntry({
          whatHappened: trimmed,
          category: "Client Testimonial",
          whatImproved: "",
          whatMovedForward: "",
          whatProblemSolved: "",
          whoBenefited: "",
          whyItMattered: trimmed,
          whatThisProves: "",
          attachments: [],
          ...goalLinks,
        });
        setSavedMessage("Saved to Evidence Bank™.");
        openGrowthVaultHubSection("evidence-bank");
        onOpenHubSection("evidence-bank");
        break;
      case "my-journey": {
        const isLesson = /\b(?:learned|lesson|realized|figured out|insight|takeaway)\b/i.test(
          trimmed,
        );
        createJourneyEntry({
          title: trimmed.slice(0, 80),
          category: isLesson ? "Lessons Learned" : "Major Life Events",
          chapter: "Current Season",
          date: new Date().toISOString().slice(0, 10),
          whatHappened: trimmed,
          whatDidILearn: isLesson ? trimmed : "",
          howDidThisShapeMe: "",
          whatWisdom: "",
          attachments: [],
          ...goalLinks,
        });
        setSavedMessage("Saved to My Journey™.");
        openGrowthVaultHubSection("my-journey");
        onOpenHubSection("my-journey");
        break;
      }
      case "portfolio":
        createPortfolioEntry({
          title: trimmed.slice(0, 80),
          assetType: "Other",
          description: trimmed,
          link: "",
          completedAt: new Date().toISOString().slice(0, 10),
          attachments: [],
          ...goalLinks,
        });
        setSavedMessage("Saved to Portfolio™.");
        openGrowthVaultHubSection("portfolio");
        onOpenHubSection("portfolio");
        break;
      case "goal-progress":
        sessionStorage.setItem(
          "companion-goal-progress-prefill-v1",
          JSON.stringify({ note: trimmed, goalId: goalLinks.outcomeGoalId }),
        );
        setSavedMessage("Open Goals below to record progress.");
        openOutcomeGoalsHubTab("goals");
        onOpenOutcomeTab?.();
        break;
    }

    setText("");
    onSaved();
  }

  const altDestinations = recommendation.alternatives.filter(
    (d) => d !== recommendation.recommended,
  );

  return (
    <div
      className="rounded-2xl border border-[#1e4f4f]/20 bg-gradient-to-br from-[#f0f8f8]/80 to-white p-4"
      data-testid="growth-quick-save"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
        Quick Save™
      </p>
      <label className="mt-2 block text-sm font-semibold text-[#1f1c19]">
        What would you like to save?
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSavedMessage(null);
          }}
          rows={2}
          placeholder="I decided to hire a salesperson."
          className={INPUT}
          data-testid="quick-save-input"
        />
      </label>

      <div className="mt-3">
        <OutcomeGoalMultiLinkPicker
          value={linkedGoalIds}
          onChange={setLinkedGoalIds}
          label="Link to goal?"
          helperText="Optional — link this item if it helps move one of your goals forward."
        />
      </div>

      {text.trim() ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
            Recommended
          </p>
          <button
            type="button"
            onClick={() => saveTo(recommendation.recommended)}
            className="w-full rounded-xl border border-[#1e4f4f]/35 bg-white px-4 py-2.5 text-left text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
            data-testid="quick-save-recommended"
          >
            {quickSaveDestinationLabel(recommendation.recommended)}
          </button>
          {altDestinations.length ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
                Other options
              </p>
              <div className="flex flex-wrap gap-2">
                {altDestinations.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => saveTo(dest)}
                    className="rounded-full border border-[#e7dfd4] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
                  >
                    {quickSaveDestinationLabel(dest)}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {savedMessage ? (
        <p className="mt-3 text-sm text-[#1e4f4f]" data-testid="quick-save-status">
          {savedMessage}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-[#9a8f82]">
        Growth Vault™ holds wins, proof, portfolio, and journey. Outcome Goals™
        tracks progress and insights.
      </p>
    </div>
  );
}
