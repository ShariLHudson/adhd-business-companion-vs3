"use client";

import { useRef, useState } from "react";
import type { GrowthAttachment } from "@/lib/growthAttachments";
import {
  attachmentTypeLabel,
  linkAttachment,
  openGrowthAttachment,
  readFileAsAttachment,
  resolveGrowthAttachment,
} from "@/lib/growthAttachments";

type Props = {
  attachments: GrowthAttachment[];
  onChange?: (attachments: GrowthAttachment[]) => void;
  /** Alias for older growth panels. */
  onAttachmentsChange?: (attachments: GrowthAttachment[]) => void;
  /** Legacy single-link field (Confidence Vault). */
  link?: string;
  onLinkChange?: (link: string) => void;
  label?: string;
  allowLink?: boolean;
  className?: string;
};

type ListProps = {
  attachments?: GrowthAttachment[];
  /** Legacy single-link field on older entries. */
  link?: string;
  className?: string;
};

/** Read-only attachment list for saved Growth entries. */
export function GrowthAttachmentsList({
  attachments = [],
  link,
  className = "",
}: ListProps) {
  const resolved = attachments.map(resolveGrowthAttachment);
  const hasLink = Boolean(link?.trim());
  if (!resolved.length && !hasLink) return null;

  return (
    <ul
      className={["estate-collection-panel__attachment-list", "mt-3", className].join(
        " ",
      )}
    >
      {resolved.map((att) => {
        const isImage = att.kind === "image";
        return (
          <li key={att.id} className="estate-collection-panel__attachment">
            {isImage && att.url ? (
              <button
                type="button"
                className="estate-collection-panel__attachment-thumb"
                onClick={() => openGrowthAttachment(att)}
                aria-label={`Open ${att.name}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={att.url} alt="" />
              </button>
            ) : null}
            <div className="estate-collection-panel__attachment-meta">
              <button
                type="button"
                className="estate-collection-panel__attachment-name"
                onClick={() => openGrowthAttachment(att)}
              >
                {att.name || attachmentTypeLabel(att.kind)}
              </button>
              <span className="estate-collection-panel__attachment-kind">
                {attachmentTypeLabel(att.kind)}
              </span>
            </div>
          </li>
        );
      })}
      {hasLink ? (
        <li className="estate-collection-panel__attachment">
          <div className="estate-collection-panel__attachment-meta">
            <a
              href={link!.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="estate-collection-panel__attachment-name"
            >
              {link!.trim()}
            </a>
            <span className="estate-collection-panel__attachment-kind">Link</span>
          </div>
        </li>
      ) : null}
    </ul>
  );
}

/** Photo/file attachments for Growth collection rooms — Asset Library refs. */
export function GrowthAttachmentsField({
  attachments,
  onChange,
  onAttachmentsChange,
  link,
  onLinkChange,
  label = "Photos or files (optional)",
  allowLink = true,
  className = "",
}: Props) {
  const commitAttachments = onChange ?? onAttachmentsChange;
  const readOnly = !commitAttachments;
  const legacyLinkMode = onLinkChange != null;
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length || !commitAttachments) return;
    setFileError(null);
    const next = [...attachments];
    for (const file of Array.from(files)) {
      const att = await readFileAsAttachment(file);
      if (!att) {
        setFileError("That file is a little large — max 2 MB per attachment.");
        continue;
      }
      next.push(att);
    }
    commitAttachments(next);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addLink() {
    const url = (legacyLinkMode ? link ?? "" : linkDraft).trim();
    if (!url) return;
    if (legacyLinkMode) {
      onLinkChange(url);
      setFileError(null);
      return;
    }
    if (!commitAttachments) return;
    try {
      const att = linkAttachment(url);
      commitAttachments([...attachments, att]);
      setLinkDraft("");
      setFileError(null);
    } catch {
      setFileError("That link did not look quite right.");
    }
  }

  function remove(id: string) {
    if (!commitAttachments) return;
    commitAttachments(attachments.filter((att) => att.id !== id));
  }

  return (
    <div
      className={["estate-collection-panel__attachments", className].join(" ")}
    >
      <span className="estate-collection-panel__capture-label">{label}</span>

      {attachments.length > 0 ? (
        <ul className="estate-collection-panel__attachment-list">
          {attachments.map((att) => {
            const resolved = resolveGrowthAttachment(att);
            const isImage = resolved.kind === "image";
            return (
              <li key={att.id} className="estate-collection-panel__attachment">
                {isImage && resolved.url ? (
                  <button
                    type="button"
                    className="estate-collection-panel__attachment-thumb"
                    onClick={() => openGrowthAttachment(resolved)}
                    aria-label={`Open ${resolved.name}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolved.url} alt="" />
                  </button>
                ) : null}
                <div className="estate-collection-panel__attachment-meta">
                  <button
                    type="button"
                    className="estate-collection-panel__attachment-name"
                    onClick={() => openGrowthAttachment(resolved)}
                  >
                    {resolved.name || attachmentTypeLabel(resolved.kind)}
                  </button>
                  <span className="estate-collection-panel__attachment-kind">
                    {attachmentTypeLabel(resolved.kind)}
                  </span>
                </div>
                <button
                  type="button"
                  className="estate-collection-panel__attachment-remove"
                  onClick={() => remove(att.id)}
                  disabled={readOnly}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {fileError ? (
        <p className="estate-collection-panel__attachment-error" role="status">
          {fileError}
        </p>
      ) : null}

      <div className="estate-collection-panel__attachment-actions">
        {!readOnly ? (
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        ) : null}
        {!readOnly ? (
          <button
            type="button"
            className="estate-collection-panel__attach-btn"
            onClick={() => fileRef.current?.click()}
          >
            Add photo or file
          </button>
        ) : null}
        {allowLink && !readOnly ? (
          <div className="estate-collection-panel__link-row">
            <input
              type="url"
              className="estate-collection-panel__link-input"
              placeholder={legacyLinkMode ? "Link (optional)" : "Or paste a link"}
              value={legacyLinkMode ? (link ?? "") : linkDraft}
              onChange={(e) => {
                if (legacyLinkMode) onLinkChange(e.target.value);
                else setLinkDraft(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !legacyLinkMode) {
                  e.preventDefault();
                  addLink();
                }
              }}
            />
            {!legacyLinkMode ? (
              <button
                type="button"
                className="estate-collection-panel__link-add"
                disabled={!linkDraft.trim()}
                onClick={addLink}
              >
                Add link
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
