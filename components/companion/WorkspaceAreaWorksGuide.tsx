"use client";

import { useState } from "react";
import { initialSectionOpen } from "@/lib/expandableUi";
import { getWorkspaceHelpContent } from "@/lib/workspaceHelpContent";

const GOLD_LABEL = "text-xs font-bold uppercase tracking-wide text-[#b45309]";

/**
 * Single workspace help dropdown — PostCraft How To style.
 * Replaces "How This Area Works", "What Is This?", "How To Use This?", etc.
 */
export function WorkspaceAreaWorksGuide({ areaId }: { areaId: string }) {
  const help = getWorkspaceHelpContent(areaId);
  const [open, setOpen] = useState(initialSectionOpen);

  if (!help) return null;

  return (
    <div
      className={
        areaId === "settings"
          ? "workspace-area-works-guide workspace-area-works-guide--settings mb-4 overflow-hidden rounded-xl border border-[rgba(255,236,200,0.28)] bg-[rgba(255,255,255,0.06)] shadow-none"
          : "workspace-area-works-guide mb-4 overflow-hidden rounded-xl border border-[#e4ddd2] bg-white shadow-sm"
      }
      data-testid="workspace-area-works-guide"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          areaId === "settings"
            ? "workspace-area-works-guide__trigger flex w-full items-center gap-2 px-4 py-3.5 text-left hover:bg-white/10"
            : "workspace-area-works-guide__trigger flex w-full items-center gap-2 px-4 py-3.5 text-left hover:bg-[#faf7f2]/80"
        }
        aria-expanded={open}
      >
        <span
          className={
            areaId === "settings"
              ? "workspace-area-works-guide__chevron shrink-0 text-sm text-white/75"
              : "workspace-area-works-guide__chevron shrink-0 text-sm text-[#9a8f82]"
          }
          aria-hidden="true"
        >
          {open ? "▼" : "▶"}
        </span>
        <span
          className={
            areaId === "settings"
              ? "workspace-area-works-guide__title min-w-0 flex-1 text-sm font-semibold text-white"
              : "workspace-area-works-guide__title min-w-0 flex-1 text-sm font-semibold text-[#1f1c19]"
          }
        >
          How To Use {help.areaName}
        </span>
      </button>

      {open ? (
        <div className="workspace-area-works-guide__body border-t border-[#efe8de] px-4 pb-4 pt-3">
          <section>
            <p className={GOLD_LABEL}>What this area is</p>
            <p className="workspace-area-works-guide__copy mt-1 text-sm leading-relaxed text-[#2d2926]">
              {help.whatItIs}
            </p>
          </section>

          <section className="mt-3">
            <p className={GOLD_LABEL}>When to use it</p>
            <p className="workspace-area-works-guide__copy mt-1 text-sm leading-relaxed text-[#2d2926]">
              {help.whenToUse}
            </p>
          </section>

          <section className="mt-3">
            <p className={GOLD_LABEL}>Recommended workflow</p>
            <ol className="workspace-area-works-guide__copy mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-[#2d2926]">
              {help.workflow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          {help.tips.length > 0 ? (
            <section className="mt-3">
              <p className={GOLD_LABEL}>Helpful tips</p>
              <ul className="workspace-area-works-guide__copy mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#4b463f]">
                {help.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {help.relatedAreas ? (
            <section className="mt-3">
              <p className={GOLD_LABEL}>How it connects</p>
              <p className="workspace-area-works-guide__copy mt-1 text-sm leading-relaxed text-[#4b463f]">
                {help.relatedAreas}
              </p>
            </section>
          ) : null}

          {help.helpsToday || help.strengthens ? (
            <section className="workspace-area-works-guide__support mt-4 rounded-lg border border-[#efe8de] bg-[#faf7f2]/60 px-3 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                Support now · Growth over time
              </p>
              {help.helpsToday ? (
                <p className="workspace-area-works-guide__copy mt-2 text-sm leading-relaxed text-[#2d2926]">
                  <span className="font-medium text-[#1f1c19]">
                    Helps you today:{" "}
                  </span>
                  {help.helpsToday}
                </p>
              ) : null}
              {help.strengthens ? (
                <p className="workspace-area-works-guide__copy mt-2 text-sm leading-relaxed text-[#4b463f]">
                  <span className="font-medium text-[#1f1c19]">
                    Strengthens over time:{" "}
                  </span>
                  {help.strengthens}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Alias for clarity in new code. */
export const WorkspaceHowToUseGuide = WorkspaceAreaWorksGuide;
