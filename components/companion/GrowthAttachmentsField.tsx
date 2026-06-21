"use client";

import { useState } from "react";
import {
  linkAttachment,
  readFileAsAttachment,
  type GrowthAttachment,
} from "@/lib/growthAttachments";

const LABEL_CLASS = "text-xs font-bold uppercase tracking-wide text-[#9a8f82]";
const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";

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
          Screenshots, certificates, PDFs, links, or video URLs
        </p>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
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
        <ul className="space-y-1.5">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#efe8de] bg-[#faf7f2]/60 px-3 py-2 text-xs text-[#4b463f]"
            >
              <span className="min-w-0 truncate">
                {att.kind === "image" ? "🖼 " : att.kind === "pdf" ? "📄 " : att.kind === "video" ? "🎥 " : "📎 "}
                {att.name}
              </span>
              <div className="flex shrink-0 gap-2">
                {att.url.startsWith("http") ? (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#b45309] hover:underline"
                  >
                    Open
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    onAttachmentsChange(
                      attachments.filter((a) => a.id !== att.id),
                    )
                  }
                  className="font-semibold text-[#9a6b6b] hover:text-[#7f4f4f]"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function GrowthAttachmentsList({
  attachments,
  link,
}: {
  attachments: GrowthAttachment[];
  link?: string;
}) {
  const items = [...attachments];
  if (link?.trim() && !items.some((a) => a.url === link.trim())) {
    items.push(linkAttachment(link.trim()));
  }
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-xs text-[#4b463f]">
      {items.map((att) => (
        <li key={att.id}>
          {att.url.startsWith("http") ? (
            <a
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#b45309] hover:underline"
            >
              {att.name}
            </a>
          ) : (
            <span>{att.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
