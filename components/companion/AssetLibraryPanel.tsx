"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ASSET_LIBRARY_UPDATED_EVENT,
  ASSET_LIBRARY_DISPLAY_NAME,
  categoryLabel,
  getAssetReferences,
  getAssetRecords,
  getUnattachedAssets,
  searchAssets,
  type AssetCategory,
  type AssetRecord,
} from "@/lib/assetLibrary";
import { resolveGrowthAttachment } from "@/lib/growthAttachments";

type Props = {
  onBack?: () => void;
};

const FILTER_CHIPS: { id: AssetCategory | "all" | "unattached" | "recent"; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "image", label: "Images" },
  { id: "screenshot", label: "Screenshots" },
  { id: "document", label: "Documents" },
  { id: "pdf", label: "PDFs" },
  { id: "video", label: "Videos" },
  { id: "certificate", label: "Certificates" },
  { id: "audio", label: "Audio" },
  { id: "voice-note", label: "Voice notes" },
  { id: "unattached", label: "Unattached" },
];

export function AssetLibraryPanel({ onBack }: Props) {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTER_CHIPS)[number]["id"]>("recent");

  useEffect(() => {
    const load = () => setAssets(getAssetRecords());
    load();
    window.addEventListener(ASSET_LIBRARY_UPDATED_EVENT, load);
    return () => window.removeEventListener(ASSET_LIBRARY_UPDATED_EVENT, load);
  }, []);

  const visible = useMemo(() => {
    if (filter === "unattached") {
      return searchAssets({ query, unattachedOnly: true });
    }
    if (filter === "recent") {
      const recent = getAssetRecords().slice(0, 40);
      if (!query.trim()) return recent;
      return searchAssets({ query });
    }
    if (filter === "all") {
      return searchAssets({ query });
    }
    return searchAssets({ query, category: filter });
  }, [assets, filter, query]);

  return (
    <div
      className="asset-library min-h-full bg-gradient-to-b from-[#1f1812] to-[#2a2118] text-[#f5efe6]"
      data-testid="asset-library-panel"
    >
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#c9a66b]">
              Growth
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#f5efe6]">
              {ASSET_LIBRARY_DISPLAY_NAME}
            </h1>
            <p className="mt-1 text-sm text-[#9a8f82]">
              Every upload lives here once — Portfolio, Evidence, Journal, and
              Capture all reference the same files.
            </p>
          </div>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-[#c9a66b]/40 px-3 py-1.5 text-xs font-semibold text-[#f5efe6]"
            >
              Back
            </button>
          ) : null}
        </header>

        <div className="mt-5">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search filename, title, tags…"
            className="w-full rounded-xl border border-[#c9a66b]/25 bg-[#342820]/80 px-4 py-2.5 text-sm text-[#f5efe6] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none"
            aria-label="Search assets"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                filter === chip.id
                  ? "border-[#c9a66b] bg-[#c9a66b]/20 text-[#f5efe6]"
                  : "border-[#c9a66b]/25 text-[#9a8f82]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 text-center text-sm text-[#9a8f82]">
            No assets yet. Upload from Capture, Evidence, Portfolio, or Journal —
            they&apos;ll appear here automatically.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {visible.map((asset) => {
              const refs = getAssetReferences(asset.id);
              const preview =
                asset.category === "image" || asset.category === "screenshot"
                  ? resolveGrowthAttachment({
                      id: asset.id,
                      assetId: asset.id,
                      kind: "image",
                      name: asset.filename,
                      url: asset.url,
                    })
                  : null;
              return (
                <li
                  key={asset.id}
                  className="flex gap-3 rounded-xl border border-[#c9a66b]/20 bg-[#342820]/60 p-3"
                >
                  {preview?.url ? (
                    <img
                      src={preview.url}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#2a2118] text-lg">
                      📎
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#f5efe6]">
                      {asset.title || asset.filename}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8f82]">
                      {categoryLabel(asset.category)}
                      {refs.length > 0
                        ? ` · ${refs.length} reference${refs.length === 1 ? "" : "s"}`
                        : " · unattached"}
                    </p>
                    {asset.tags.length > 0 ? (
                      <p className="mt-1 truncate text-xs text-[#c9b9a4]">
                        {asset.tags.join(", ")}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-8 text-center text-xs text-[#6f6259]">
          {getUnattachedAssets().length} unattached · {assets.length} total
        </p>
      </div>
    </div>
  );
}
