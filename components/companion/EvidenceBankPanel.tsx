"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import "@/app/companion/evidence-bank-vault.css";

import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { EvidenceVaultRoomShell } from "@/components/companion/EvidenceVaultRoomShell";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import {
  consumeEvidencePrefill,
  createEvidenceEntry,
  deleteEvidenceEntry,
  downloadAllEvidence,
  EMPTY_EVIDENCE_DRAFT,
  EVIDENCE_BANK_UPDATED_EVENT,
  EVIDENCE_CATEGORIES,
  getEvidenceEntries,
  pickRandomEvidenceEntries,
  printAllEvidence,
  updateEvidenceEntry,
  type EvidenceCategory,
  type EvidenceEntry,
  type EvidenceEntryInput,
} from "@/lib/evidenceBankStore";
import {
  isInGrowthArchivePeriod,
  GROWTH_ARCHIVE_PERIODS,
  type GrowthArchivePeriod,
} from "@/lib/growthArchive";
import type { GrowthAttachment } from "@/lib/growthAttachments";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

const DEEP_FIELDS = [
  { key: "whatImproved" as const, label: "What improved?" },
  { key: "whatMovedForward" as const, label: "What moved forward?" },
  {
    key: "whatProblemSolved" as const,
    label: "What problem was solved or prevented?",
  },
  { key: "whoBenefited" as const, label: "Who benefited?" },
  { key: "whyItMattered" as const, label: "Why did it matter?" },
  { key: "whatThisProves" as const, label: "What does this prove?" },
];

function formatEvidenceDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function firstImageAttachment(
  attachments: GrowthAttachment[],
): GrowthAttachment | null {
  return (
    attachments.find((a) => a.kind === "image" && a.url) ??
    attachments.find((a) => a.url) ??
    null
  );
}

function entryToDraft(entry: EvidenceEntry): EvidenceEntryInput {
  return {
    category: entry.category,
    whatHappened: entry.whatHappened,
    whatImproved: entry.whatImproved,
    whatMovedForward: entry.whatMovedForward,
    whatProblemSolved: entry.whatProblemSolved,
    whoBenefited: entry.whoBenefited,
    whyItMattered: entry.whyItMattered,
    whatThisProves: entry.whatThisProves,
    attachments: [...entry.attachments],
    sourceWinId: entry.sourceWinId,
  };
}

function EvidenceVaultCard({
  entry,
  onExpand,
}: {
  entry: EvidenceEntry;
  onExpand: () => void;
}) {
  const thumb = firstImageAttachment(entry.attachments);

  return (
    <article
      className="evidence-vault__card"
      data-category={entry.category}
    >
      <div className="evidence-vault__card-top">
        <div>
          <p className="evidence-vault__card-date">
            {formatEvidenceDate(entry.createdAt)}
          </p>
          <p className="evidence-vault__card-category">{entry.category}</p>
        </div>
      </div>
      <p className="evidence-vault__card-body">{entry.whatHappened}</p>
      <div className="evidence-vault__card-footer">
        {thumb?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb.url}
            alt=""
            className="evidence-vault__thumb"
          />
        ) : entry.attachments.length > 0 ? (
          <span className="evidence-vault__thumb-placeholder" aria-hidden>
            File
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="evidence-vault__btn evidence-vault__btn--gold"
          onClick={onExpand}
        >
          Expand
        </button>
      </div>
    </article>
  );
}

function EvidenceDeepDrawer({
  open,
  draft,
  isNew,
  onClose,
  onChange,
  onSave,
  onDelete,
}: {
  open: boolean;
  draft: EvidenceEntryInput;
  isNew: boolean;
  onClose: () => void;
  onChange: (draft: EvidenceEntryInput) => void;
  onSave: () => void;
  onDelete?: () => void;
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <button
        type="button"
        className="evidence-vault__backdrop"
        aria-label="Close details"
        onClick={onClose}
      />
      <aside
        className="evidence-vault__drawer"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? "Add evidence details" : "Evidence details"}
      >
        <div className="evidence-vault__drawer-scroll">
          <div className="flex items-center justify-between gap-2">
            <h3 className="evidence-vault__drawer-title">
              {isNew ? "Add details" : "Evidence details"}
            </h3>
            <button
              type="button"
              className="evidence-vault__btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <p className="mt-3 text-sm text-[var(--ev-cream-muted)]">
            Everything below is optional — save whenever you&apos;re ready.
          </p>

          <div className="evidence-vault__field">
            <label className="evidence-vault__field-label" htmlFor="deep-what">
              What happened?
            </label>
            <textarea
              id="deep-what"
              rows={3}
              className="evidence-vault__field-input"
              value={draft.whatHappened}
              onChange={(e) =>
                onChange({ ...draft, whatHappened: e.target.value })
              }
            />
          </div>

          <div className="evidence-vault__field">
            <span className="evidence-vault__field-label">Category</span>
            <div className="evidence-vault__chips">
              {EVIDENCE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`evidence-vault__chip ${
                    draft.category === cat ? "evidence-vault__chip--active" : ""
                  }`}
                  onClick={() => onChange({ ...draft, category: cat })}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {DEEP_FIELDS.map(({ key, label }) => (
            <div key={key} className="evidence-vault__field">
              <label className="evidence-vault__field-label" htmlFor={key}>
                {label}
              </label>
              <textarea
                id={key}
                rows={2}
                className="evidence-vault__field-input"
                value={draft[key]}
                onChange={(e) =>
                  onChange({ ...draft, [key]: e.target.value })
                }
              />
            </div>
          ))}

          <div className="evidence-vault__field">
            <span className="evidence-vault__field-label">
              Supporting files & images
            </span>
            <GrowthAttachmentsField
              attachments={draft.attachments}
              onAttachmentsChange={(attachments) =>
                onChange({ ...draft, attachments })
              }
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className="evidence-vault__btn evidence-vault__btn--save"
              disabled={!draft.whatHappened.trim()}
              onClick={onSave}
            >
              Save to Evidence Bank
            </button>
            {onDelete ? (
              <button
                type="button"
                className="evidence-vault__btn"
                onClick={onDelete}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}

function RemindMeOverlay({
  entries,
  onClose,
}: {
  entries: EvidenceEntry[];
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="evidence-vault__remind" role="dialog" aria-modal="true">
      <h2 className="evidence-vault__remind-title">You&apos;ve done more than you think.</h2>
      <p className="evidence-vault__remind-sub">
        A few pieces of proof from your vault — real moments that moved things forward.
      </p>
      <div className="evidence-vault__remind-cards">
        {entries.map((entry) => (
          <div key={entry.id} className="evidence-vault__remind-card">
            <p className="evidence-vault__card-date">
              {formatEvidenceDate(entry.createdAt)} · {entry.category}
            </p>
            <p className="evidence-vault__card-body mt-2">{entry.whatHappened}</p>
            {entry.whatThisProves.trim() ? (
              <p className="mt-2 text-sm text-[var(--ev-gold-soft)]">
                Proves: {entry.whatThisProves}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="evidence-vault__btn evidence-vault__btn--gold evidence-vault__remind-close"
        onClick={onClose}
      >
        Close
      </button>
    </div>,
    document.body,
  );
}

export function EvidenceBankPanel({
  refreshKey = 0,
  nav,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
}) {
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [archivePeriod, setArchivePeriod] = useState<GrowthArchivePeriod>("all");
  const [quickText, setQuickText] = useState("");
  const [quickCategory, setQuickCategory] =
    useState<EvidenceCategory>("Business Growth");
  const [saveGlow, setSaveGlow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEntryId, setDrawerEntryId] = useState<string | null>(null);
  const [drawerDraft, setDrawerDraft] =
    useState<EvidenceEntryInput>(EMPTY_EVIDENCE_DRAFT);
  const [remindEntries, setRemindEntries] = useState<EvidenceEntry[] | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(() => {
    setEntries(getEvidenceEntries());
  }, []);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(EVIDENCE_BANK_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(EVIDENCE_BANK_UPDATED_EVENT, onUpdate);
  }, [reload]);

  useEffect(() => {
    const prefill = consumeEvidencePrefill();
    if (!prefill) return;
    setQuickText(prefill.whatHappened ?? "");
    if (prefill.whatHappened) {
      setDrawerDraft((d) => ({
        ...d,
        whatHappened: prefill.whatHappened ?? "",
        sourceWinId: prefill.sourceWinId,
      }));
    }
  }, [refreshKey]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  const visibleEntries = useMemo(
    () =>
      entries.filter((e) =>
        isInGrowthArchivePeriod(e.createdAt, archivePeriod),
      ),
    [entries, archivePeriod],
  );

  function flashSaveGlow() {
    setSaveGlow(true);
    window.setTimeout(() => setSaveGlow(false), 900);
  }

  function handleQuickSave() {
    const text = quickText.trim();
    if (!text) return;
    createEvidenceEntry({
      ...EMPTY_EVIDENCE_DRAFT,
      category: quickCategory,
      whatHappened: text,
    });
    setQuickText("");
    setQuickCategory("Business Growth");
    flashSaveGlow();
    reload();
  }

  function openNewDetails() {
    setDrawerEntryId(null);
    setDrawerDraft({
      ...EMPTY_EVIDENCE_DRAFT,
      category: quickCategory,
      whatHappened: quickText.trim(),
    });
    setDrawerOpen(true);
  }

  function openEntryDetails(entry: EvidenceEntry) {
    setDrawerEntryId(entry.id);
    setDrawerDraft(entryToDraft(entry));
    setDrawerOpen(true);
  }

  function saveDrawer() {
    if (!drawerDraft.whatHappened.trim()) return;
    if (drawerEntryId) {
      updateEvidenceEntry(drawerEntryId, {
        ...drawerDraft,
        whatHappened: drawerDraft.whatHappened.trim(),
      });
    } else {
      createEvidenceEntry({
        ...drawerDraft,
        whatHappened: drawerDraft.whatHappened.trim(),
      });
      setQuickText("");
    }
    setDrawerOpen(false);
    setDrawerEntryId(null);
    setDrawerDraft(EMPTY_EVIDENCE_DRAFT);
    flashSaveGlow();
    reload();
  }

  function deleteDrawerEntry() {
    if (!drawerEntryId) return;
    deleteEvidenceEntry(drawerEntryId);
    setDrawerOpen(false);
    setDrawerEntryId(null);
    reload();
  }

  function handleRemindMe() {
    const picks = pickRandomEvidenceEntries(3, visibleEntries);
    if (picks.length === 0) return;
    setRemindEntries(picks);
  }

  return (
    <EvidenceVaultRoomShell>
      <EstateWorkspace variant="vault">
        <div className="evidence-vault" data-companion-object="evidence-bank">
          <div className="evidence-vault__inner">
        <header className="evidence-vault__header">
          <GrowthPanelBackButton
            onBack={nav.onBack}
            label={nav.backLabel ?? "The Gallery"}
          />
          <div className="evidence-vault__header-row mt-4">
            <div>
              <p className="estate-workspace__kicker">Evidence Vault</p>
              <h1 className="estate-workspace__title">Evidence Vault</h1>
              <p className="estate-workspace__lead">
                Your proof that things are moving forward.
              </p>
            </div>
            <div className="evidence-vault__header-actions">
              <button
                type="button"
                className="evidence-vault__btn evidence-vault__btn--gold"
                onClick={handleRemindMe}
                disabled={visibleEntries.length === 0}
              >
                Remind Me
              </button>
              <div className="evidence-vault__menu-wrap" ref={menuRef}>
                <button
                  type="button"
                  className="evidence-vault__btn"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  ⋯
                </button>
                {menuOpen ? (
                  <div className="evidence-vault__menu" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      className="evidence-vault__menu-item"
                      onClick={() => {
                        printAllEvidence(visibleEntries);
                        setMenuOpen(false);
                      }}
                    >
                      Print
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="evidence-vault__menu-item"
                      onClick={() => {
                        downloadAllEvidence(visibleEntries);
                        setMenuOpen(false);
                      }}
                    >
                      Export
                    </button>
                    <p className="evidence-vault__menu-label">Archive</p>
                    {GROWTH_ARCHIVE_PERIODS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        role="menuitem"
                        className="evidence-vault__menu-item"
                        onClick={() => {
                          setArchivePeriod(p.id);
                          setMenuOpen(false);
                        }}
                      >
                        {archivePeriod === p.id ? "✓ " : ""}
                        {p.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="evidence-vault__capture">
          <textarea
            className="evidence-vault__textarea"
            placeholder="What happened that you want to remember?"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            aria-label="What happened?"
          />
          <div className="evidence-vault__chips" role="group" aria-label="Category">
            {EVIDENCE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`evidence-vault__chip ${
                  quickCategory === cat ? "evidence-vault__chip--active" : ""
                }`}
                onClick={() => setQuickCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`evidence-vault__btn evidence-vault__btn--save ${
              saveGlow ? "evidence-vault__btn--glow" : ""
            }`}
            disabled={!quickText.trim()}
            onClick={handleQuickSave}
          >
            Save to Evidence Bank
          </button>
          {quickText.trim() ? (
            <button
              type="button"
              className="evidence-vault__btn mt-2 w-full text-center text-[var(--ev-cream-muted)]"
              onClick={openNewDetails}
            >
              Add more details…
            </button>
          ) : null}
        </div>

        <div>
          <h2 className="evidence-vault__wall-title">Evidence Wall</h2>
          {visibleEntries.length === 0 ? (
            <div className="evidence-vault__empty">
              <p className="evidence-vault__empty-title">
                Your proof vault is ready.
              </p>
              <p className="evidence-vault__empty-body">
                Add your first piece of evidence — even something small counts.
              </p>
            </div>
          ) : (
            <div className="evidence-vault__cards">
              {visibleEntries.map((entry) => (
                <EvidenceVaultCard
                  key={entry.id}
                  entry={entry}
                  onExpand={() => openEntryDetails(entry)}
                />
              ))}
            </div>
          )}
        </div>
          </div>
        </div>
      </EstateWorkspace>

      <EvidenceDeepDrawer
        open={drawerOpen}
        draft={drawerDraft}
        isNew={!drawerEntryId}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerEntryId(null);
        }}
        onChange={setDrawerDraft}
        onSave={saveDrawer}
        onDelete={drawerEntryId ? deleteDrawerEntry : undefined}
      />

      {remindEntries ? (
        <RemindMeOverlay
          entries={remindEntries}
          onClose={() => setRemindEntries(null)}
        />
      ) : null}
    </EvidenceVaultRoomShell>
  );
}
