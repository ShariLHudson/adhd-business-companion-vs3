"use client";

import { useMemo } from "react";

import { getAiExtensionsCenterBootstrap } from "@/lib/founder/aiExtensionsCenter";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { AiExtensionCard } from "./aiExtensions/AiExtensionCard";
import { RoomHeader } from "./executive/RoomHeader";

export function FounderAiExtensionsCenter() {
  const center = useMemo(() => getAiExtensionsCenterBootstrap(), []);

  return (
    <div className="founder-ai-ext">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="AI Extensions Center™"
        title="Specialist AI Tools"
        question="Which extension helps with today's work?"
        purpose="Calm access to ChatGPT, Claude, Gemini, Cursor, and image tools — Founder remains the Executive Headquarters."
      />

      <section className="founder-ai-ext__hero" aria-labelledby="ai-ext-hero">
        <p className="founder-ai-ext__lead" id="ai-ext-hero">
          {center.summary}
        </p>
      </section>

      <div className="founder-ai-ext__grid">
        {center.tools.map((tool) => (
          <AiExtensionCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
