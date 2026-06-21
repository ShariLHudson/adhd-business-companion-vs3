"use client";

import { useState } from "react";
import {
  attachmentTypeLabel,
  downloadGrowthAttachment,
  linkAttachment,
  openGrowthAttachment,
  readFileAsAttachment,
  type GrowthAttachment,
} from "@/lib/growthAttachments";

const LABEL_CLASS = "text-xs font-bold uppercase tracking-wide text-[#9a8f82]";
const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";

function AttachmentRow({
  att,
  onRemove,
  compact,
}: {
  att: GrowthAttachment;
  onRemove?: () => void;
  compact?: boolean;
}) {
  return (
    <li
      className={`flex gap-3 rounded-lg border border-[#efe8de] bg-[#faf7f2]/60 px-3 py-2 ${
        compact ? "text-xs" : "text-sm"
      } text-[#4b463f]`}
    >
      {att.kind === "image" && att.url ? (
        <img
          src={att.url}
          alt={att.name}
          className="h-12 w-12 shrink-0 rounded-md border border-[#e7d9c8] object-cover"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#e7d9c8] bg-white text-lg">
          {att.kind === "pdf" ? "📄" : att.kind === "video" ? "🎥" : att.kind === "link" ? "🔗" : "📎"}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#2f261f]">{att.name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8f82]">
          {attachmentTypeLabel(att.kind)}
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openGrowthAttachment(att)}
            className="text-xs font-semibold text-[#b45309] hover:underline"
          >
            {att.url.startsWith("http") ? "Open" : "Download"}
          </button>
          {att.kind === "image" ? (
            <button
              type="button"
              onClick={() => downloadGrowthAttachment(att)}
              className="text-xs font-semibold text-[#6f6259] hover:underline"
            >
              Download
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs font-semibold text-[#9a6b6b] hover:text-[#7f4f4f]"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function GrowthAttachmentsField({
  attachments,
  link,
  onAttachmentsChange,
  onLinkChange,
}: {
  attachments: GrowthAttachment[];
  link?: string;
  onAttachmentsChange: (next: GrowthAttachment[]) => void;
  onLinkChange?: (next: string) => void;
}) {
  const [linkDraft, setLinkDraft] = useState(link ?? "");
  const [fileError, setFileError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setFileError(null);
    const next = [...attachments];
    for (const file of Array.from(files)) {
      const att = await readFileAsAttachment(file);
      if (!att) {
        setFileError("File too large — max 2 MB per attachment.");
        continue;
      }
      next.push(att);
    }
    onAttachmentsChange(next);
  }

  function addLink() {
    const trimmed = linkDraft.trim();
    if (!trimmed) return;
    onAttachmentsChange([...attachments, linkAttachment(trimmed)]);
    setLinkDraft("");
    onLinkChange?.("");
  }

  return (
    <div className="space-y-3">
      <div>
        <p className={LABEL_CLASS}>Attachments</p>
        <p className="mt-0.5 text-xs text-[#9a8f82]">
          Screenshots, certificates, PDFs, documents, links, or video URLs
        </p>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="mt-2 block w-full text-xs text-[#6f6259] file:mr-3 file:rounded-full file:border-0 file:bg-[#faf7f2] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#2f261f]"
        />
        {fileError ? (
          <p className="mt-1 text-xs text-[#a85c4a]">{fileError}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="url"
          value={linkDraft}
          onChange={(e) => {
            setLinkDraft(e.target.value);
            onLinkChange?.(e.target.value);
          }}
          placeholder="Paste a link or video URL"
          className={`${INPUT_CLASS} min-w-[12rem] flex-1`}
        />
        <button
          type="button"
          onClick={addLink}
          disabled={!linkDraft.trim()}
          className="self-end rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-2 text-xs font-semibold text-[#2f261f] hover:bg-[#f3ebe0] disabled:opacity-40"
        >
          Add link
        </button>
      </div>

      {attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <AttachmentRow
              key={att.id}
              att={att}
              onRemove={() =>
                onAttachmentsChange(attachments.filter((a) => a.id !== att.id))
              }
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function GrowthAttachmentsList({
  attachments,
  link,
  onAttachmentsChange,
  compact,
}: {
  attachments: GrowthAttachment[];
  link?: string;
  onAttachmentsChange?: (next: GrowthAttachment[]) => void;
  compact?: boolean;
}) {
  const items = [...attachments];
  if (link?.trim() && !items.some((a) => a.url === link.trim())) {
    items.push(linkAttachment(link.trim()));
  }
  if (items.length === 0) return null;
  return (
    <ul className={`mt-2 space-y-2 ${compact ? "" : ""}`}>
      {items.map((att) => (
        <AttachmentRow
          key={att.id}
          att={att}
          compact={compact}
          onRemove={
            onAttachmentsChange
              ? () =>
                  onAttachmentsChange(
                    attachments.filter((a) => a.id !== att.id),
                  )
              : undefined
          }
        />
      ))}
    </ul>
  );
}
