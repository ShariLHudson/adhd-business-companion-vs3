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
  DEFAULT_COLLECTION_BROWSE_STATE,
  filterCollectionItems,
  paginateCollectionItems,
  type CollectionBrowseState,
} from "@/lib/estate/collectionFramework/collectionQuery";
import {
  consumeEvidenceVaultWorkspaceMode,
  consumeEvidenceVaultSkipEntrance,
  consumeEvidenceVaultChatPrefill,
  EVIDENCE_VAULT_ENTRANCE_COMPLETE_EVENT,
  EVIDENCE_VAULT_ENTRANCE_DOOR_MS,
  EVIDENCE_VAULT_ENTRANCE_ENTER_MS,
  EVIDENCE_VAULT_ENTRANCE_UNLOCK_MS,
  hasEvidenceVaultEntranceCompleted,
  markEvidenceVaultEntranceCompleted,
  formatEvidenceVaultFindProofReply,
  formatEvidenceVaultInsightsReply,
  type EvidenceVaultWorkspaceMode,
} from "@/lib/estate/evidenceVaultArrival";
import {
  isEvidenceVaultDoorBusy,
  prefersEvidenceVaultReducedMotion,
  resolveInitialEvidenceVaultDoorState,
  EVIDENCE_VAULT_REDUCED_MOTION_MS,
  type EvidenceVaultDoorState,
} from "@/lib/estate/evidenceVaultDoor";
import {
  exportAllEvidence,
  getEvidenceEntries,
} from "@/lib/evidenceBankStore";
import {
  EVIDENCE_VAULT_CHAT_PREFILL_ACK,
  EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS,
  type EvidenceVaultFirstEntryChoiceId,
} from "@/lib/estate/evidenceVaultExperience";
import { EstateCollectionBrowseBar } from "./EstateCollectionBrowseBar";
import {
  DiscoveryFileExperience,
  type DiscoveryFilePhase,
} from "./DiscoveryFileExperience";
import { EvidenceVaultEntrance } from "./EvidenceVaultEntrance";
import { EvidenceVaultInterior } from "./EvidenceVaultInterior";
import { EstateCollectionCaptureForm } from "./EstateCollectionCaptureForm";
import { EstateCollectionItemCard } from "./EstateCollectionItemCard";
import { EstateCollectionRoomScene } from "./EstateCollectionRoomScene";
import { EstateCollectionRoomShell } from "./EstateCollectionRoomShell";
import {
  EvidenceVaultActionBar,
  type EvidenceVaultActionId,
} from "./EvidenceVaultActionBar";
import { EvidenceVaultWorkspaceModal } from "./EvidenceVaultWorkspaceModal";
import {
  EVIDENCE_VAULT_ENTRANCE_BG,
  EVIDENCE_VAULT_ROOM_BG,
} from "@/lib/growth/growthRoom";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import "./estate-collection-room.css";
import "./evidence-vault-entrance.css";
import "./evidence-vault-interior.css";
import "./evidence-vault-workspace.css";

type VaultPanel = null | "discovery" | "browse" | "insights" | "search";

function vaultPanelForMode(mode: EvidenceVaultWorkspaceMode): VaultPanel {
  if (mode === "add") return "discovery";
  if (mode === "browse") return "browse";
  return null;
}

type Props = {
  roomId: EstateCollectionRoomId;
  onBack: () => void;
  backLabel?: string | null;
  /**
   * Evidence Vault EST-001 — place-first mode.
   * When omitted, vault reads session mode (arrive / add / browse).
   */
  evidenceVaultMode?: EvidenceVaultWorkspaceMode;
};

/**
 * Spark Estate Collection Framework — one engine for all collection rooms.
 */
export function EstateCollectionRoomEngine({
  roomId,
  onBack,
  backLabel = "Companion",
  evidenceVaultMode: evidenceVaultModeProp,
}: Props) {
  const room = getEstateCollectionRoom(roomId);
  const { adapter, capture, browse, display } = room;
  const composeRef = useRef<HTMLDivElement | null>(null);
  const isEvidenceVault = roomId === "evidence-vault";

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
    ...DEFAULT_COLLECTION_BROWSE_STATE,
    visibleCount: browse.pageSize,
  });
  const [initialVault] = useState(() => {
    if (!isEvidenceVault) {
      return {
        mode: "add" as EvidenceVaultWorkspaceMode,
        panel: null as VaultPanel,
        skipEntrance: false,
        chatPrefill: false,
      };
    }
    const skipEntrance = consumeEvidenceVaultSkipEntrance();
    const rawMode = evidenceVaultModeProp ?? consumeEvidenceVaultWorkspaceMode();
    const mode: EvidenceVaultWorkspaceMode =
      rawMode === "add" ? "arrive" : rawMode;
    const chatPrefill = consumeEvidenceVaultChatPrefill();
    const panel: VaultPanel =
      rawMode === "browse"
        ? "browse"
        : rawMode === "add" && skipEntrance
          ? "discovery"
          : vaultPanelForMode(mode);
    return {
      mode,
      panel,
      skipEntrance,
      chatPrefill,
    };
  });
  const skipEntranceOnMount = isEvidenceVault && initialVault.skipEntrance;
  const [vaultMode, setVaultMode] = useState<EvidenceVaultWorkspaceMode>(
    () => initialVault.mode,
  );
  const [vaultPanel, setVaultPanel] = useState<VaultPanel>(() => initialVault.panel);
  const [doorState, setDoorState] = useState<EvidenceVaultDoorState>(() => {
    if (!isEvidenceVault) return "open";
    return resolveInitialEvidenceVaultDoorState({
      skipEntrance: skipEntranceOnMount,
    });
  });
  const unlockInFlightRef = useRef(false);
  const unlockTimersRef = useRef<number[]>([]);
  const [chatPrefillNote, setChatPrefillNote] = useState(
    () => isEvidenceVault && initialVault.chatPrefill,
  );
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [filePhase, setFilePhase] = useState<DiscoveryFilePhase>(() => {
    if (!isEvidenceVault) return "open";
    return "folder";
  });

  useEffect(() => {
    return () => {
      for (const id of unlockTimersRef.current) {
        window.clearTimeout(id);
      }
      unlockTimersRef.current = [];
    };
  }, []);

  const vaultInsightsCopy = useMemo(
    () => (isEvidenceVault ? formatEvidenceVaultInsightsReply() : ""),
    [isEvidenceVault],
  );
  const vaultSearchCopy = useMemo(
    () => (isEvidenceVault ? formatEvidenceVaultFindProofReply() : ""),
    [isEvidenceVault],
  );

  const showEntrance =
    isEvidenceVault && vaultMode !== "browse" && doorState !== "open";
  /** Mount once when doors begin opening — fade in; stay mounted when open. */
  const showVaultInterior =
    isEvidenceVault &&
    (doorState === "open" || doorState === "opening") &&
    vaultMode === "arrive" &&
    (vaultPanel === null || vaultPanel === "discovery");
  const showInlineDiscovery =
    isEvidenceVault &&
    doorState === "open" &&
    vaultPanel === "discovery" &&
    vaultMode === "arrive";
  const showVaultActionBar =
    isEvidenceVault &&
    doorState === "open" &&
    vaultPanel === null &&
    vaultMode !== "arrive";
  const showVaultBrowse =
    isEvidenceVault && doorState === "open" && vaultPanel === "browse";
  const showVaultInsights =
    isEvidenceVault && doorState === "open" && vaultPanel === "insights";
  const showVaultSearch =
    isEvidenceVault && doorState === "open" && vaultPanel === "search";
  const vaultPlateImage = useMemo(() => {
    if (!isEvidenceVault) return undefined;
    if (
      doorState === "locked" ||
      doorState === "key_ready" ||
      doorState === "unlocking"
    ) {
      return EVIDENCE_VAULT_ENTRANCE_BG;
    }
    return EVIDENCE_VAULT_ROOM_BG;
  }, [isEvidenceVault, doorState]);
  const showBrowseOnly = !isEvidenceVault || showVaultBrowse;
  const showCaptureForm = !isEvidenceVault || vaultMode === "add";
  const showBrowse = showBrowseOnly;

  function clearUnlockTimers() {
    for (const id of unlockTimersRef.current) {
      window.clearTimeout(id);
    }
    unlockTimersRef.current = [];
  }

  function completeVaultEntrance() {
    clearUnlockTimers();
    markEvidenceVaultEntranceCompleted();
    setDoorState("open");
    unlockInFlightRef.current = false;
    window.dispatchEvent(
      new CustomEvent(EVIDENCE_VAULT_ENTRANCE_COMPLETE_EVENT),
    );
  }

  function useVaultKey() {
    if (!isEvidenceVault) return;
    if (isEvidenceVaultDoorBusy(doorState) || unlockInFlightRef.current) return;
    if (doorState !== "locked" && doorState !== "key_ready") return;
    unlockInFlightRef.current = true;
    clearUnlockTimers();
    setDoorState("unlocking");

    const reduced = prefersEvidenceVaultReducedMotion();
    if (reduced) {
      const id = window.setTimeout(() => {
        completeVaultEntrance();
      }, EVIDENCE_VAULT_REDUCED_MOTION_MS);
      unlockTimersRef.current.push(id);
      return;
    }

    const unlockId = window.setTimeout(() => {
      setDoorState("opening");
      const openId = window.setTimeout(() => {
        completeVaultEntrance();
      }, EVIDENCE_VAULT_ENTRANCE_DOOR_MS + EVIDENCE_VAULT_ENTRANCE_ENTER_MS);
      unlockTimersRef.current.push(openId);
    }, EVIDENCE_VAULT_ENTRANCE_UNLOCK_MS);
    unlockTimersRef.current.push(unlockId);
  }

  /** Skip — immediately reveal existing vault; cancel animation; no duplicate UI. */
  function skipVaultEntrance() {
    if (!isEvidenceVault) return;
    if (doorState === "open") return;
    completeVaultEntrance();
  }

  function openJournalFromInterior() {
    setVaultPanel("discovery");
    setFilePhase("folder");
  }

  function handleFirstEntryChoice(id: EvidenceVaultFirstEntryChoiceId) {
    switch (id) {
      case "add-evidence":
        setVaultMode("arrive");
        setVaultPanel("discovery");
        setFilePhase("folder");
        return;
      case "shari-remember":
        setVaultMode("arrive");
        setVaultPanel("search");
        return;
      case "look-inside":
        setVaultMode("browse");
        setVaultPanel("browse");
        return;
    }
  }

  const closeVaultPanel = useCallback(() => {
    setVaultPanel(null);
    setVaultMode("arrive");
    setFilePhase("folder");
    setEditingId(null);
    setDraft(emptyCaptureValues(capture.fields));
    setAttachments([]);
    setActivePrompt(null);
  }, [capture.fields]);

  const openVaultAction = useCallback(
    (actionId: EvidenceVaultActionId) => {
      switch (actionId) {
        case "today-discovery":
          setVaultMode("arrive");
          setVaultPanel("discovery");
          setFilePhase("folder");
          setChatPrefillNote(false);
          setDraft(emptyCaptureValues(capture.fields));
          setAttachments([]);
          setEditingId(null);
          setActivePrompt(null);
          return;
        case "browse-archive":
          setVaultMode("browse");
          setVaultPanel("browse");
          return;
        case "search-discoveries":
          setVaultMode("browse");
          setVaultPanel("search");
          return;
        case "view-insights":
          setVaultPanel("insights");
          return;
        case "print-discoveries":
          exportAllEvidence("print");
          setStatusMessage("Your discoveries are ready to print.");
          return;
        default:
          return;
      }
    },
    [capture.fields],
  );

  const reload = useCallback(() => {
    setItems(adapter.listItems());
  }, [adapter]);

  useEffect(() => {
    if (!isEvidenceVault) return;
    preloadRoomBackground(EVIDENCE_VAULT_ENTRANCE_BG);
    preloadRoomBackground(EVIDENCE_VAULT_ROOM_BG);
  }, [isEvidenceVault]);

  useEffect(() => {
    reload();
    const eventName = adapter.updatedEventName;
    if (!eventName) return;
    const onUpdate = () => reload();
    window.addEventListener(eventName, onUpdate);
    return () => window.removeEventListener(eventName, onUpdate);
  }, [adapter, reload]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    const prefill = consumeCollectionPrefill(roomId);
    if (!prefill) return;
    if (isEvidenceVault) {
      setVaultMode("arrive");
      setVaultPanel("discovery");
      setFilePhase("open");
    }
    setDraft({
      ...emptyCaptureValues(capture.fields),
      ...prefill.values,
    });
    setActivePrompt(null);
    window.setTimeout(() => {
      composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [roomId, capture.fields, isEvidenceVault]);

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

  function openNewDiscovery() {
    resetCompose();
    setVaultMode("arrive");
    setVaultPanel("discovery");
    setFilePhase("folder");
    setChatPrefillNote(false);
  }

  function saveDraft() {
    let payload = draft;
    if (
      isEvidenceVault &&
      !editingId &&
      capture.discoveryPreserveMode &&
      !payload.situation?.trim()
    ) {
      const combined = EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS.map(({ question, fieldId }) => {
        const value = payload[fieldId]?.trim();
        return value ? `${question}\n${value}` : "";
      })
        .filter(Boolean)
        .join("\n\n");
      if (combined) {
        payload = { ...payload, situation: combined };
      }
    }
    const saveOptions = {
      ...(editingId ? { editId: editingId } : {}),
      attachments,
    };
    if (!adapter.saveItem(payload, saveOptions)) {
      return;
    }
    const wasEdit = Boolean(editingId);
    resetCompose();
    setStatusMessage(
      wasEdit
        ? (capture.updatedMessage ?? "Updated quietly.")
        : (capture.savedMessage ?? "Saved quietly."),
    );
    if (isEvidenceVault && !wasEdit) {
      const [latest] = getEvidenceEntries();
      if (latest) setLastSavedId(latest.id);
    }
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
    if (isEvidenceVault) {
      setVaultMode("arrive");
      setVaultPanel("discovery");
      setFilePhase("open");
    }
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
    <EstateCollectionRoomShell
      room={room}
      backgroundImage={vaultPlateImage}
      dataVaultEntrancePhase={
        isEvidenceVault && doorState !== "open" ? doorState : undefined
      }
    >
      {isEvidenceVault ? (
        <>
          {doorState === "open" ? (
            <div className="discovery-file-exit">
              <GrowthPanelBackButton onBack={onBack} label={backLabel} />
            </div>
          ) : null}
          {showEntrance ? (
            <EvidenceVaultEntrance
              doorState={doorState}
              onUnlock={useVaultKey}
              onSkip={skipVaultEntrance}
              onBack={onBack}
            />
          ) : null}
          {showVaultInterior ? (
            <div
              className={[
                "evidence-vault-interior-mount",
                doorState === "opening"
                  ? "evidence-vault-interior-mount--entering"
                  : "evidence-vault-interior-mount--open",
              ].join(" ")}
              data-testid="evidence-vault-interior-mount"
            >
              <EvidenceVaultInterior
                journalActive={vaultPanel === "discovery"}
                onOpenJournal={openJournalFromInterior}
                onFirstEntryChoice={handleFirstEntryChoice}
                showSecondaryActions={hasEvidenceVaultEntranceCompleted()}
                onBrowseArchive={() => {
                  setVaultMode("browse");
                  setVaultPanel("browse");
                }}
                behindDiscovery={vaultPanel === "discovery"}
              />
            </div>
          ) : null}
          {showVaultActionBar ? (
            <EvidenceVaultActionBar onSelect={openVaultAction} />
          ) : null}
          {statusMessage ? (
            <p className="evidence-vault-status" role="status">
              {statusMessage}
            </p>
          ) : null}
          {showInlineDiscovery ? (
            <div className="evidence-vault-inline-discovery">
              <DiscoveryFileExperience
                capture={capture}
                values={draft}
                onChange={setDraft}
                attachments={attachments}
                onAttachmentsChange={
                  capture.enableAttachments ? setAttachments : undefined
                }
                onSave={saveDraft}
                onCancelEdit={editingId ? resetCompose : undefined}
                editingId={editingId}
                phase={filePhase}
                onPhaseChange={setFilePhase}
                lastSavedId={lastSavedId}
                chatPrefillNote={
                  chatPrefillNote ? EVIDENCE_VAULT_CHAT_PREFILL_ACK : null
                }
                onDismissChatPrefillNote={() => setChatPrefillNote(false)}
                onViewDiscovery={(id) => {
                  setFilePhase("open");
                  beginEdit(id);
                }}
                onAddAnother={openNewDiscovery}
                onReturnToEstate={closeVaultPanel}
              />
            </div>
          ) : null}
          <EvidenceVaultWorkspaceModal
            open={showVaultBrowse}
            onClose={closeVaultPanel}
            title="Browse Archive"
            testId="evidence-vault-browse-modal"
          >
            <div className="discovery-file-browse">
              <EstateWorkspace className="estate-collection-panel" variant="vault">
                <section
                  className="estate-workspace__section estate-collection-panel__collection estate-collection-panel__flow-item"
                  aria-label={room.collectionTitle}
                >
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
                      <ul className="estate-collection-panel__items estate-collection-panel__items--vault">
                        {visible.map((item) => (
                          <li key={item.id}>
                            <EstateCollectionItemCard
                              item={item}
                              displayStyle={display.style}
                              card={display.card}
                              removeLabel={removeLabel}
                              onEdit={() => beginEdit(item.id)}
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
                              visibleCount:
                                current.visibleCount + browse.pageSize,
                            }))
                          }
                        >
                          {browse.loadMoreLabel}
                        </button>
                      ) : null}
                    </>
                  )}
                </section>
              </EstateWorkspace>
            </div>
          </EvidenceVaultWorkspaceModal>
          <EvidenceVaultWorkspaceModal
            open={showVaultInsights}
            onClose={closeVaultPanel}
            title="View Insights"
            testId="evidence-vault-insights-modal"
          >
            <div className="evidence-vault-insights-panel">{vaultInsightsCopy}</div>
          </EvidenceVaultWorkspaceModal>
          <EvidenceVaultWorkspaceModal
            open={showVaultSearch}
            onClose={closeVaultPanel}
            title="Search Discoveries"
            testId="evidence-vault-search-modal"
          >
            <div className="evidence-vault-insights-panel">{vaultSearchCopy}</div>
            <button
              type="button"
              className="evidence-vault-workspace-modal__return"
              style={{ marginTop: "1rem" }}
              onClick={() => {
                setVaultMode("browse");
                setVaultPanel("browse");
              }}
            >
              Open Browse Archive
            </button>
          </EvidenceVaultWorkspaceModal>
        </>
      ) : (
      <div
        className="estate-collection-panel-root"
        data-collection-style={display.style}
        data-collection-room={roomId}
        data-collection-has-entries={items.length > 0 ? "true" : "false"}
      >
        <EstateWorkspace
          className="estate-collection-panel"
          variant="ivory"
        >
          <GrowthPanelBackButton onBack={onBack} label={backLabel} />

          <header className="estate-collection-panel__header estate-collection-panel__flow-item">
            <EstateCollectionRoomScene room={room} />
            <p className="estate-workspace__kicker">{room.kicker}</p>
            <h1 className="estate-workspace__title">{room.roomName}</h1>
            <p className="estate-workspace__lead">{room.description}</p>
          </header>

          <section
            className="estate-collection-panel__spark estate-collection-panel__flow-item"
            aria-label="Spark opening"
          >
            <p className="estate-collection-panel__spark-line">{sparkLine}</p>
          </section>

          {showCaptureForm ? (
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
          ) : null}

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

          {showBrowse ? (
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
                        onEdit={() => beginEdit(item.id)}
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
          ) : null}

          {showCaptureForm && room.followUpQuestions.length > 0 ? (
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
      )}
    </EstateCollectionRoomShell>
  );
}
