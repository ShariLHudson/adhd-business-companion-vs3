"use client";

import { useMemo, useState } from "react";
import { canonicalMapName } from "@/lib/cartographersStudio/mapDefinitions";
import type { VisualFocusMap } from "@/lib/visualFocus";
import { studioCardTitleForMode } from "@/lib/visualFocus/studioCards";

export function MyMapsPanel({
  maps,
  onOpen,
  onEdit,
  onPrint,
  onRename,
  onDelete,
  onCreate,
  onClose,
}: {
  maps: VisualFocusMap[];
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onPrint: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  const [moreFor, setMoreFor] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const sorted = useMemo(
    () =>
      [...maps].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [maps],
  );

  return (
    <div
      className="cartographers-learn-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-maps-title"
      data-testid="cartography-my-maps"
    >
      <div className="cartographers-my-maps">
        <header className="cartographers-my-maps__header">
          <h2 id="my-maps-title">My Maps</h2>
          <button type="button" className="cartographers-chrome-link" onClick={onClose}>
            Close
          </button>
        </header>

        {sorted.length === 0 ? (
          <div className="cartographers-my-maps__empty" data-testid="my-maps-empty">
            <p>Your completed maps will appear here.</p>
            <button
              type="button"
              className="cartographers-map-entry__primary"
              onClick={onCreate}
            >
              Create a Map
            </button>
          </div>
        ) : (
          <ul className="cartographers-my-maps__list">
            {sorted.map((map) => (
              <li key={map.id} className="cartographers-my-maps__item">
                <div>
                  <p className="cartographers-my-maps__title">
                    {map.title?.trim() || "Untitled map"}
                  </p>
                  <p className="cartographers-my-maps__meta">
                    {studioCardTitleForMode(map.mode) ||
                      canonicalMapName(map.mode)}{" "}
                    · Updated{" "}
                    {new Date(map.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="cartographers-my-maps__actions">
                  <button
                    type="button"
                    className="cartographers-map-entry__primary"
                    onClick={() => onOpen(map.id)}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="cartographers-map-entry__secondary"
                    onClick={() => onEdit(map.id)}
                  >
                    Edit
                  </button>
                  <div className="cartographers-my-maps__more-wrap">
                    <button
                      type="button"
                      className="cartographers-map-entry__secondary"
                      aria-expanded={moreFor === map.id}
                      aria-haspopup="menu"
                      onClick={() =>
                        setMoreFor((id) => (id === map.id ? null : map.id))
                      }
                    >
                      More
                    </button>
                    {moreFor === map.id ? (
                      <ul
                        className="cartographers-my-maps__menu"
                        role="menu"
                      >
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setRenameId(map.id);
                              setRenameValue(map.title);
                              setMoreFor(null);
                            }}
                          >
                            Rename
                          </button>
                        </li>
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              onPrint(map.id);
                              setMoreFor(null);
                            }}
                          >
                            Print
                          </button>
                        </li>
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className="cartographers-my-maps__danger"
                            onClick={() => {
                              onDelete(map.id);
                              setMoreFor(null);
                            }}
                          >
                            Delete
                          </button>
                        </li>
                      </ul>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {renameId ? (
          <div className="cartographers-my-maps__rename" role="dialog" aria-modal="true">
            <p>Rename this map</p>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              aria-label="New map title"
              autoFocus
            />
            <div className="cartographers-guided__actions">
              <button
                type="button"
                className="cartographers-map-entry__secondary"
                onClick={() => setRenameId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cartographers-map-entry__primary"
                onClick={() => {
                  onRename(renameId, renameValue.trim() || "Untitled map");
                  setRenameId(null);
                }}
              >
                Save name
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
