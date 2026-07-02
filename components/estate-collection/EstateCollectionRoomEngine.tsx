"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import type { GrowthAttachment } from "@/lib/growthAttachments";
import {
  emptyCaptureValues,
  getEstateCollectionRoom,
  consumeCollectionPrefill,
  type EstateCollectionCaptureValues,
  type EstateCollectionRoomId,
} from "@/lib/estate/collectionFramework";
import {
  captureValuesFromItem,
} from "@/lib/estate/collectionFramework/captureUtils";
import {
  filterCollectionItems,
  paginateCollectionItems,
  type CollectionBrowseState,
} from "@/lib/estate/collectionFramework/collectionQuery";
import { EstateCollectionBrowseBar } from "./EstateCollectionBrowseBar";
import { EstateCollectionCaptureForm } from "./EstateCollectionCaptureForm";
import { EstateCollectionItemCard } from "./EstateCollectionItemCard";
import { EstateCollectionRoomScene } from "./EstateCollectionRoomScene";
import { EstateCollectionRoomShell } from "./EstateCollectionRoomShell";
import "./estate-collection-room.css";

type Props = {
  roomId: EstateCollectionRoomId;
  onBack: () => void;
  backLabel?: string | null;
};

/**
 * Spark Estate Collection Framework™ — one engine for all collection rooms.
 */
export function EstateCollectionRoomEngine({
  roomId,
  onBack,
  backLabel = "Companion",
}: Props) {
  const room = getEstateCollectionRoom(roomId);
  const { adapter, capture, browse, display } = room;
  const composeRef = useRef<HTMLDivElement | null>(null);

  const initialCapture = useMemo(
    () => emptyCaptureValues(capture.fields),
    [capture.fields],
  );

  const [items, setItems] = useState(() => adapter.listItems());
  const [draft, setDraft] = useState<EstateCollectionCaptureValues>(initialCapture);
  const [attachments, setAttachments] = useState<GrowthAttachment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [browseState, setBrowseState] = useState<CollectionBrowseState>({
    search: "",
    favoritesOnly: false,
    category: null,
    visibleCount: browse.pageSize,
  });

  const reload = useCallback(() => {
    setItems(adapter.listItems());
  }, [adapter]);

  useEffect(() => {
    reload();
    if (!adapter.updatedEventName) return;
    const onUpdate = () => reload();
    window.addEventListener(adapter.updatedEventName, onUpdate);
    return () => window.removeEventListener(adapter.updatedEventName, onUpdate);
  }, [adapter, reload]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    const prefill = consumeCollectionPrefill(roomId);
    if (!prefill) return;
    setDraft({
      ...emptyCaptureValues(capture.fields),
      ...prefill.values,
    });
    setActivePrompt(null);
    window.setTimeout(() => {
      composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [roomId, capture.fields]);

  const filteredItems = useMemo(
    () => filterCollectionItems(items, browseState),
    [items, browseState],
  );

  const { visible, hasMore, total } = useMemo(
    () => paginateCollectionItems(filteredItems, browseState.visibleCount),
    [filteredItems, browseState.visibleCount],
  );

  function applySuggestedPrompt(prompt: string) {
    setActivePrompt(prompt);
    const primary = capture.primaryFieldId;
    setDraft((current) => ({
      ...current,
      [primary]: current[primary]?.trim()
        ? `${current[primary]}\n\n${prompt} `
        : `${prompt} `,
    }));
    composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetCompose() {
    setDraft(emptyCaptureValues(capture.fields));
    setAttachments([]);
    setEditingId(null);
    setActivePrompt(null);
  }

  function saveDraft() {
    const saveOptions = {
      ...(editingId ? { editId: editingId } : {}),
      attachments,
    };
    if (!adapter.saveItem(draft, saveOptions)) {
      return;
    }
    resetCompose();
    setStatusMessage(
      editingId
        ? (capture.updatedMessage ?? "Updated quietly.")
        : (capture.savedMessage ?? "Saved quietly."),
    );
    reload();
  }

  function beginEdit(itemId: string) {
    const captureValues =
      adapter.getItemCapture?.(itemId) ??
      captureValuesFromItem(
        items.find((item) => item.id === itemId)!,
        capture.fields,
      );
    if (!captureValues) return;
    setEditingId(itemId);
    setDraft(captureValues);
    const item = items.find((entry) => entry.id === itemId);
    setAttachments(item?.attachments ?? []);
    composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const promptsLabel = capture.suggestedPromptsLabel ?? "You might start with";
  const followUpLabel = capture.followUpSectionLabel ?? "When you are ready";
  const removeLabel = display.removeLabel ?? "Remove";
  const sparkLine =
    items.length > 0 && room.returnSparkPrompt
      ? room.returnSparkPrompt
      : room.openingSparkPrompt;

  return (
    <EstateCollectionRoomShell room={room}>
      <div
        className="estate-collection-panel-root"
        data-collection-style={display.style}
        data-collection-room={roomId}
        data-collection-has-entries={items.length > 0 ? "true" : "false"}
      >
        <EstateWorkspace
          className="estate-collection-panel"
          variant={roomId === "evidence-vault" ? "vault" : "ivory"}
        >
          <GrowthPanelBackButton onBack={onBack} label={backLabel} />

          <header className="estate-collection-panel__header estate-collection-panel__flow-item">
            <EstateCollectionRoomScene room={room} />
            <p className="estate-workspace__kicker">{room.kicker}</p>
            <h1 className="estate-workspace__title">{room.roomName}</h1>
            <p className="estate-workspace__lead">{room.description}</p>
          </header>

          <div
            ref={composeRef}
            className="estate-collection-panel__compose-zone estate-collection-panel__flow-item"
          >
            <EstateCollectionCaptureForm
              roomId={room.id}
              capture={capture}
              values={draft}
              onChange={setDraft}
              onSave={saveDraft}
              onCancelEdit={editingId ? resetCompose : undefined}
              statusMessage={statusMessage}
              editingId={editingId}
              attachments={attachments}
              onAttachmentsChange={
                capture.enableAttachments ? setAttachments : undefined
              }
            />
          </div>

          <section
            className="estate-collection-panel__spark estate-collection-panel__flow-item"
            aria-label="Spark opening"
          >
            <p className="estate-collection-panel__spark-line">{sparkLine}</p>
          </section>

          {room.suggestedPrompts.length > 0 ? (
            <section
              className="estate-collection-panel__prompts estate-collection-panel__flow-item"
              aria-label="Suggested prompts"
            >
              <h2 className="estate-collection-panel__section-title estate-collection-panel__section-title--soft">
                {promptsLabel}
              </h2>
              <ul className="estate-collection-panel__prompt-list">
                {room.suggestedPrompts.map((prompt) => (
                  <li key={prompt}>
                    <button
                      type="button"
                      className="estate-collection-panel__prompt-btn"
                      aria-pressed={activePrompt === prompt}
                      onClick={() => applySuggestedPrompt(prompt)}
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section
            className="estate-workspace__section estate-collection-panel__collection estate-collection-panel__flow-item"
            aria-label={room.collectionTitle}
          >
            <h2 className="estate-collection-panel__section-title">
              {room.collectionTitle}
            </h2>

            {items.length > 0 ? (
              <EstateCollectionBrowseBar
                items={items}
                browse={browse}
                state={browseState}
                onChange={setBrowseState}
              />
            ) : null}

            {total === 0 ? (
              <p className="estate-collection-panel__empty">
                {items.length === 0
                  ? room.collectionEmptyMessage
                  : browse.emptyFilterMessage}
              </p>
            ) : (
              <>
                <ul
                  className={[
                    "estate-collection-panel__items",
                    `estate-collection-panel__items--${display.style}`,
                    display.card.layout === "shelf"
                      ? "estate-collection-panel__items--grid"
                      : "",
                    display.card.layout === "museum"
                      ? "estate-collection-panel__items--museum"
                      : "",
                  ].join(" ")}
                >
                  {visible.map((item) => (
                    <li key={item.id}>
                      <EstateCollectionItemCard
                        item={item}
                        displayStyle={display.style}
                        card={display.card}
                        removeLabel={removeLabel}
                        onEdit={
                          adapter.getItemCapture || adapter.saveItem
                            ? () => beginEdit(item.id)
                            : undefined
                        }
                        onToggleFavorite={
                          adapter.toggleFavorite
                            ? () => {
                                adapter.toggleFavorite?.(item.id);
                                reload();
                              }
                            : undefined
                        }
                        onRemove={
                          adapter.removeItem
                            ? () => {
                                adapter.removeItem?.(item.id);
                                if (editingId === item.id) resetCompose();
                                reload();
                              }
                            : undefined
                        }
                      />
                    </li>
                  ))}
                </ul>
                {hasMore ? (
                  <button
                    type="button"
                    className="estate-collection-panel__load-more"
                    onClick={() =>
                      setBrowseState((current) => ({
                        ...current,
                        visibleCount: current.visibleCount + browse.pageSize,
                      }))
                    }
                  >
                    {browse.loadMoreLabel}
                  </button>
                ) : null}
              </>
            )}
          </section>

          {room.followUpQuestions.length > 0 ? (
            <section
              className="estate-collection-panel__followups estate-collection-panel__flow-item"
              aria-label="Gentle follow-up questions"
            >
              <h2 className="estate-collection-panel__section-title">
                {followUpLabel}
              </h2>
              <ul className="estate-collection-panel__followup-list">
                {room.followUpQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </EstateWorkspace>
      </div>
    </EstateCollectionRoomShell>
  );
}
