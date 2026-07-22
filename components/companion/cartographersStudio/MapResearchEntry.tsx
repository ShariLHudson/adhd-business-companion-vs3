"use client";

import { useMemo, useState } from "react";
import type { CartographyMapDefinition } from "@/lib/cartographersStudio/mapDefinitions";
import {
  detectResearchEntry,
  researchModesForMap,
  type MapDetailLevel,
} from "@/lib/visualFocus/researchAssisted";

/**
 * Research-Assisted Entry (universal cartography intelligence).
 *
 * One question at a time. Asks what the member wants to map, reads whether they
 * signalled uncertainty, and offers three plain-language choices — never forcing
 * research terminology. If they choose research, one calm mode selection follows.
 *
 * "Build from what I know" and "Help me think it through" route back to the
 * existing guided/discovery builders so nothing regresses.
 */
export function MapResearchEntry({
  definition,
  onCancel,
  onBuildFromKnown,
  onThinkItThrough,
  onResearch,
}: {
  definition: CartographyMapDefinition;
  onCancel: () => void;
  onBuildFromKnown: (topic: string) => void;
  onThinkItThrough: (topic: string) => void;
  onResearch: (topic: string, detailLevel: MapDetailLevel) => void;
}) {
  const [topic, setTopic] = useState("");
  const [phase, setPhase] = useState<"ask" | "mode">("ask");

  const detection = useMemo(() => detectResearchEntry(topic), [topic]);
  const modes = useMemo(
    () => researchModesForMap(definition.visualFocusMode),
    [definition.visualFocusMode],
  );

  const cleanTopic = detection.topic.trim() || topic.trim();
  const canProceed = topic.trim().length > 0;
  // Gently lead with research when the member signalled they don't know.
  const leadWithResearch =
    detection.suggestedChoice === "research-it" && detection.shouldOfferResearch;

  function beginResearch() {
    if (!canProceed) return;
    setPhase("mode");
  }

  return (
    <div
      className="cartographers-learn-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cartography-research-title"
      data-testid="cartography-research-entry"
      data-map-id={definition.id}
      data-phase={phase}
    >
      <div className="cartographers-guided">
        <p className="cartographers-guided__kicker">{definition.name}</p>

        {phase === "ask" ? (
          <>
            <h2
              id="cartography-research-title"
              className="cartographers-guided__title"
            >
              What would you like to map?
            </h2>
            <p className="cartographers-guided__example">
              You do not need to know the steps. Tell me the topic in your own
              words — I can research it and build a first version with you.
            </p>
            <textarea
              className="cartographers-guided__input cartographers-guided__input--area"
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. how to record and share a Loom video"
              aria-label="What would you like to map?"
              data-testid="cartography-research-topic"
              autoFocus
            />

            <div
              className="cartographers-guided__actions"
              data-lead={leadWithResearch ? "research" : "known"}
            >
              <button
                type="button"
                className="cartographers-map-entry__primary"
                data-testid="cartography-research-it"
                disabled={!canProceed}
                onClick={beginResearch}
              >
                Research it for me
              </button>
              <button
                type="button"
                className="cartographers-map-entry__secondary"
                data-testid="cartography-build-from-known"
                onClick={() => onBuildFromKnown(cleanTopic)}
              >
                Build from what I know
              </button>
              <button
                type="button"
                className="cartographers-map-entry__secondary"
                data-testid="cartography-think-it-through"
                onClick={() => onThinkItThrough(cleanTopic)}
              >
                Help me think it through
              </button>
              <button
                type="button"
                className="cartographers-map-entry__secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2
              id="cartography-research-title"
              className="cartographers-guided__title"
            >
              How much detail would help?
            </h2>
            <p className="cartographers-guided__example">
              I can research “{cleanTopic}” and build any of these. You can make
              it simpler or deeper at any time.
            </p>
            <div
              className="cartographers-guided__actions cartographers-guided__actions--stack"
              role="group"
              aria-label="Choose a detail level"
            >
              {modes.map((mode) => (
                <button
                  key={mode.level}
                  type="button"
                  className="cartographers-map-entry__primary cartographers-research-mode"
                  data-testid={`cartography-research-mode-${mode.level}`}
                  onClick={() => onResearch(cleanTopic, mode.level)}
                >
                  <span className="cartographers-research-mode__label">
                    {mode.label}
                  </span>
                  <span className="cartographers-research-mode__hint">
                    {mode.bestFor} {mode.yields}
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="cartographers-map-entry__secondary"
                data-testid="cartography-research-back"
                onClick={() => setPhase("ask")}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
