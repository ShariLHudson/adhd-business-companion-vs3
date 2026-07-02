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
  onChange: (attachments: GrowthAttachment[]) => void;
  label?: string;
  allowLink?: boolean;
  className?: string;
};

/** Photo/file attachments for Growth collection rooms — Asset Library refs. */
export function GrowthAttachmentsField({
  attachments,
  onChange,
  label = "Photos or files (optional)",
  allowLink = true,
  className = "",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
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
    onChange(next);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addLink() {
    const url = linkDraft.trim();
    if (!url) return;
    try {
      const att = linkAttachment(url);
      onChange([...attachments, att]);
      setLinkDraft("");
      setFileError(null);
    } catch {
      setFileError("That link did not look quite right.");
    }
  }

  function remove(id: string) {
    onChange(attachments.filter((att) => att.id !== id));
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
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <button
          type="button"
          className="estate-collection-panel__attach-btn"
          onClick={() => fileRef.current?.click()}
        >
          Add photo or file
        </button>
        {allowLink ? (
          <div className="estate-collection-panel__link-row">
            <input
              type="url"
              className="estate-collection-panel__link-input"
              placeholder="Or paste a link"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
            />
            <button
              type="button"
              className="estate-collection-panel__link-add"
              disabled={!linkDraft.trim()}
              onClick={addLink}
            >
              Add link
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
