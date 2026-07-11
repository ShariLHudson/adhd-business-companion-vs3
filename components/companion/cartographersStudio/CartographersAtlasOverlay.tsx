"use client";

import { useState } from "react";
import {
  CARTOGRAPHERS_ATLAS_ENTRIES,
  CARTOGRAPHERS_ATLAS_INTRO,
  type CartographersAtlasEntry,
} from "@/lib/cartographersStudio/atlas";

export function CartographersAtlasOverlay({
  onClose,
  onCreateMindMap,
}: {
  onClose: () => void;
  onCreateMindMap: () => void;
}) {
  const [selectedId, setSelectedId] = useState(
    CARTOGRAPHERS_ATLAS_ENTRIES[0]!.id,
  );
  const selected =
    CARTOGRAPHERS_ATLAS_ENTRIES.find((entry) => entry.id === selectedId) ??
    CARTOGRAPHERS_ATLAS_ENTRIES[0]!;

  return (
    <div
      className="cartographers-learn-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cartographers-atlas-title"
      data-testid="cartographers-atlas-overlay"
    >
      <div className="cartographers-atlas">
        <header className="cartographers-atlas__header">
          <div>
            <p className="cartographers-atlas__kicker">Learning center</p>
            <h2 id="cartographers-atlas-title" className="cartographers-atlas__title">
              {CARTOGRAPHERS_ATLAS_INTRO.title}
            </h2>
            <p className="cartographers-atlas__subtitle">
              {CARTOGRAPHERS_ATLAS_INTRO.subtitle}
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <p className="cartographers-atlas__intro">{CARTOGRAPHERS_ATLAS_INTRO.body}</p>

        <div className="cartographers-atlas__body">
          <nav className="cartographers-atlas__nav" aria-label="Visual methods">
            {CARTOGRAPHERS_ATLAS_ENTRIES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={[
                  "cartographers-atlas__nav-item",
                  entry.id === selected.id
                    ? "cartographers-atlas__nav-item--active"
                    : "",
                ].join(" ")}
                data-testid={`atlas-nav-${entry.id}`}
                onClick={() => setSelectedId(entry.id)}
              >
                <span>{entry.name}</span>
                {entry.canCreate ? (
                  <span className="cartographers-atlas__ready">Ready</span>
                ) : null}
              </button>
            ))}
          </nav>

          <AtlasEntryDetail
            entry={selected}
            onCreateMindMap={() => {
              onClose();
              onCreateMindMap();
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AtlasEntryDetail({
  entry,
  onCreateMindMap,
}: {
  entry: CartographersAtlasEntry;
  onCreateMindMap: () => void;
}) {
  return (
    <article
      className="cartographers-atlas__detail"
      data-testid={`atlas-detail-${entry.id}`}
    >
      <h3 className="cartographers-atlas__detail-title">{entry.name}</h3>
      <AtlasField label="What it is" value={entry.whatItIs} />
      <AtlasField label="Why it works" value={entry.whyItWorks} />
      <AtlasField label="Best used for" value={entry.bestUsedFor} />
      <AtlasField label="When not to use it" value={entry.whenNotToUse} />
      <AtlasField label="Example" value={entry.example} />
      <div className="cartographers-atlas__field">
        <p className="cartographers-atlas__field-label">Related visual methods</p>
        <p className="cartographers-atlas__field-value">
          {entry.relatedMethods.join(" · ")}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {entry.canCreate ? (
          <button
            type="button"
            className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
            data-testid="atlas-create-this-map"
            onClick={onCreateMindMap}
          >
            Create This Map
          </button>
        ) : (
          <p className="text-sm text-[#9a8f82]">
            Coming soon — Mind Map is ready to create today.
          </p>
        )}
      </div>
    </article>
  );
}

function AtlasField({ label, value }: { label: string; value: string }) {
  return (
    <div className="cartographers-atlas__field">
      <p className="cartographers-atlas__field-label">{label}</p>
      <p className="cartographers-atlas__field-value">{value}</p>
    </div>
  );
}
