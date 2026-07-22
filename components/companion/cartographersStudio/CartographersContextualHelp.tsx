"use client";

import { HowThisFitsTogetherLink } from "@/components/companion/HowThisFitsTogetherLink";
import {
  CARTOGRAPHERS_BROWSE_MAP_TYPES,
  CARTOGRAPHERS_HELP,
  CARTOGRAPHERS_UPDATE_MAP,
} from "@/lib/cartographersStudio";
import type { VisualFocusMap } from "@/lib/visualFocus";
import { studioCardTitleForMode } from "@/lib/visualFocus/studioCards";

type Props = {
  map: VisualFocusMap | null;
  onClose: () => void;
  onBrowseMapTypes?: () => void;
};

/**
 * Contextual Help for the open map — never navigates away by itself (Prompt 140).
 */
export function CartographersContextualHelp({
  map,
  onClose,
  onBrowseMapTypes,
}: Props) {
  const mapName = map
    ? map.title?.trim() || studioCardTitleForMode(map.mode)
    : "Cartographer's Studio";

  return (
    <div
      className="cartographers-learn-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cartographers-contextual-help-title"
      data-testid="cartographers-contextual-help"
    >
      <div className="cartographers-learn-overlay__card max-w-lg">
        <p
          id="cartographers-contextual-help-title"
          className="cartographers-learn-overlay__name"
        >
          {CARTOGRAPHERS_HELP} — {mapName}
        </p>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#3d3832]">
          {map ? (
            <>
              <p>
                This map helps you see how your thinking fits together. Add
                branches one at a time — capture first, organize when it feels
                natural.
              </p>
              <p>
                <span className="font-semibold">Add or edit:</span> use + Branch
                on the canvas or outline, double-click a label to rename, and
                drag to reconnect when you need a new parent.
              </p>
              <p>
                <span className="font-semibold">Keep the picture true:</span>{" "}
                after outline changes, the map should refresh on its own. If it
                ever looks out of date, choose {CARTOGRAPHERS_UPDATE_MAP}.
              </p>
              <p>
                <span className="font-semibold">Saving:</span> your work is kept
                in your Atlas as you go. Leave and come back with Continue
                Mapping whenever you are ready.
              </p>
              <p>
                <span className="font-semibold">Companion Intelligence:</span>{" "}
                summaries, risks, and suggestions reflect the current map — not
                an older draft.
              </p>
              <p>
                <span className="font-semibold">Projects:</span> when this map
                came from Visualize This, you can return to that Project without
                losing the map. Deleting a map never deletes the Project.
              </p>
            </>
          ) : (
            <>
              <p>
                Choose Mind Map on the wall or table to begin. Capture what is on
                your mind first — Spark will help shape the picture after you
                share.
              </p>
              <p>
                Resume Previous Map continues the latest map you were working
                on. The Atlas teaches what each map type is for.
              </p>
            </>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <HowThisFitsTogetherLink areaOrPlaceId="cartographers-studio" />
          <div className="flex flex-wrap justify-end gap-2">
            {onBrowseMapTypes ? (
              <button
                type="button"
                className="cartographers-chrome-link cartographers-chrome-link--ink"
                data-testid="cartographers-help-browse-types"
                onClick={onBrowseMapTypes}
              >
                {CARTOGRAPHERS_BROWSE_MAP_TYPES}
              </button>
            ) : null}
            <button
              type="button"
              className="cartographers-chrome-link cartographers-chrome-link--ink cartographers-chrome-link--strong"
              data-testid="cartographers-help-dismiss"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
