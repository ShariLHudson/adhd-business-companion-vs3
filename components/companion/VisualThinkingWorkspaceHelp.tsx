"use client";

import { useState } from "react";
import { CollapsibleSection } from "@/components/companion/CollapsibleSection";
import { initialSectionOpen } from "@/lib/expandableUi";
import type { VisualThinkingHomeHelp } from "@/lib/visualThinkingHome";

const GOLD_LABEL = "text-xs font-bold uppercase tracking-wide text-[#b45309]";

export function VisualThinkingWorkspaceHelp({
  title,
  help,
}: {
  title: string;
  help: VisualThinkingHomeHelp;
}) {
  const [open, setOpen] = useState(initialSectionOpen);

  function toggleSection(id: string) {
    if (id === "visual-thinking-help") setOpen((v) => !v);
  }

  return (
    <CollapsibleSection
      id="visual-thinking-help"
      title={`How To Use ${title}`}
      open={open}
      onToggle={toggleSection}
    >
      <div className="space-y-3 text-sm leading-relaxed text-[#2d2926]">
        <section>
          <p className={GOLD_LABEL}>What it is</p>
          <p className="mt-1">{help.whatItIs}</p>
        </section>
        <section>
          <p className={GOLD_LABEL}>When to use it</p>
          <p className="mt-1">{help.whenToUse}</p>
        </section>
        <section>
          <p className={GOLD_LABEL}>Example</p>
          <p className="mt-1 font-medium text-[#1e4f4f]">{help.example}</p>
        </section>
        <section>
          <p className={GOLD_LABEL}>How to build one</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[#4b463f]">
            {help.howToBuild.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
        <p className="text-xs text-[#9a8f82]">
          Building a <span className="font-semibold text-[#6b635a]">{title}</span>{" "}
          — close when you are done to return to Visual Thinking Home.
        </p>
      </div>
    </CollapsibleSection>
  );
}
