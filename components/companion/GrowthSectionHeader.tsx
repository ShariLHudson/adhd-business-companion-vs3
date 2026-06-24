"use client";

import { useRef } from "react";
import {
  GROWTH_ARCHIVE_PERIODS,
  type GrowthArchivePeriod,
} from "@/lib/growthArchive";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import {
  GROWTH_SECTION_META,
  type GrowthPanelNav,
} from "@/lib/growthNavigation";

import { readFileAsAttachment, type GrowthAttachment } from "@/lib/growthAttachments";

const TOOL_BTN =
  "rounded-full border border-[#e7d9c8] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f261f] hover:bg-[#faf7f2]";

const SUB_HEADER_BTN =
  "inline-flex items-center gap-1 rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-sm font-semibold text-[#2f261f] hover:bg-[#f3ebe0]";

export function GrowthSectionHeader({
  nav,
  search,
  onSearchChange,
  searchPlaceholder,
  onPrint,
  onQuickAttach,
  onCloseAll,
}: {
  nav: GrowthPanelNav;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onPrint?: () => void;
  onQuickAttach?: (attachments: GrowthAttachment[]) => void;
  onCloseAll?: () => void;
}) {
  const showSearch = onSearchChange != null;
  const meta = GROWTH_SECTION_META[nav.current];
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const isSubPage = nav.current !== "growth";

  async function ingestFiles(files: FileList | null) {
    if (!files?.length || !onQuickAttach) return;
    const next: GrowthAttachment[] = [];
    for (const file of Array.from(files)) {
      const att = await readFileAsAttachment(file);
      if (att) next.push(att);
    }
    if (next.length) onQuickAttach(next);
  }

  return (
    <header className="space-y-4">
      {isSubPage ? (
        <div className="flex flex-wrap items-center gap-2">
          <GrowthPanelBackButton
            onBack={nav.onBack}
            label={nav.backLabel ?? "Growth"}
          />
          {onCloseAll ? (
            <button type="button" onClick={onCloseAll} className={SUB_HEADER_BTN}>
              Close All
            </button>
          ) : null}
        </div>
      ) : nav.backLabel ? (
        <GrowthPanelBackButton onBack={nav.onBack} label={nav.backLabel} />
      ) : null}

      <div>
        <h2 className="text-3xl font-bold text-[#2f261f]">
          {meta.emoji} {meta.title}
        </h2>
        <p className="mt-1 text-[#6f6259]">{meta.subtitle}</p>
      </div>

      {showSearch ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#e7d9c8] bg-[#faf7f2]/60 p-3 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="search"
            value={search ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder ?? `Search ${meta.title}…`}
            className="min-w-[12rem] flex-1 rounded-full border border-[#e4ddd2] bg-white px-4 py-2 text-sm text-[#2d2926] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25"
            aria-label={`Search ${meta.title}`}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onPrint?.() ?? window.print()}
              className={TOOL_BTN}
            >
              🖨 Print
            </button>
            <button
              type="button"
              disabled
              title="PDF export coming soon"
              className="cursor-not-allowed rounded-full border border-dashed border-[#e7d9c8] px-3 py-1.5 text-xs text-[#b8afa4]"
            >
              📄 Export PDF
            </button>
            {onQuickAttach ? (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  className="hidden"
                  onChange={(e) => {
                    void ingestFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <input
                  ref={imageRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    void ingestFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={TOOL_BTN}
                >
                  📎 Attach File
                </button>
                <button
                  type="button"
                  onClick={() => imageRef.current?.click()}
                  className={TOOL_BTN}
                >
                  🖼 Upload Image
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function GrowthArchiveBar({
  period,
  onPeriodChange,
}: {
  period: GrowthArchivePeriod;
  onPeriodChange: (period: GrowthArchivePeriod) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
        Archive
      </span>
      {GROWTH_ARCHIVE_PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPeriodChange(p.id)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            period === p.id
              ? "bg-[#2f261f] text-white"
              : "border border-[#e7d9c8] bg-white text-[#6f6259]"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
