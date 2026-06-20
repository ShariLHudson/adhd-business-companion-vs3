"use client";

import { useMemo, useRef, useState } from "react";
import {
  deleteProjectAssetFile,
  deleteProjectAssetNote,
  formatProjectAssetFileSize,
  isAcceptedProjectAssetFile,
  listProjectAssetFiles,
  listProjectAssetNotes,
  projectAssetFileKindLabel,
  projectAssetNoteKindLabel,
  PROJECT_ASSET_MAX_BYTES,
  PROJECT_ASSETS_UPDATED,
  saveProjectAssetFile,
  saveProjectAssetNote,
  type ProjectAssetNoteKind,
} from "@/lib/projectAssets";
import {
  groupUnifiedProjectFiles,
  listUnifiedProjectFiles,
  projectFileCategoryLabel,
  type ProjectFileCategory,
  type UnifiedProjectFile,
} from "@/lib/projectFiles";
import {
  deleteProjectLink,
  listProjectLinks,
  projectLinkKindLabel,
  saveProjectLink,
  type ProjectLink,
} from "@/lib/projectLinks";

const FILE_ACCEPT =
  ".pdf,.docx,.xlsx,.pptx,.txt,.csv,image/jpeg,image/png,image/gif,image/webp,image/svg+xml";

const FILE_CATEGORIES: ProjectFileCategory[] = [
  "documents",
  "spreadsheets",
  "forms",
  "images",
  "pdfs",
  "exports",
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function FileRow({
  file,
  onDelete,
}: {
  file: UnifiedProjectFile;
  onDelete?: () => void;
}) {
  const isUpload = file.id.startsWith("upload:");
  return (
    <li className="rounded-lg border border-[#e4ddd2] bg-white px-3 py-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="mr-1">{file.icon}</span>
          <span className="font-semibold text-[#1f1c19]">{file.title}</span>
          <p className="mt-0.5 text-xs text-[#6b635a]">
            {file.source} · {formatDate(file.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {file.url ? (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              download={isUpload ? file.title : undefined}
              className="rounded-lg border border-[#1e4f4f]/30 px-2.5 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
            >
              {isUpload ? "Download" : "Open"}
            </a>
          ) : null}
          {isUpload && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-[#e8c4c4] px-2 py-1 text-xs font-semibold text-[#8b4545] hover:bg-[#fdf5f5]"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function LinkRow({ link, onDelete }: { link: ProjectLink; onDelete: () => void }) {
  return (
    <li className="rounded-lg border border-[#e4ddd2] bg-white px-3 py-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="mr-1">🔗</span>
          <span className="font-semibold text-[#1f1c19]">{link.label}</span>
          <p className="mt-0.5 truncate text-xs text-[#6b635a]">
            {projectLinkKindLabel(link.kind)} · {formatDate(link.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#1e4f4f]/30 px-2.5 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          >
            Open
          </a>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-[#e8c4c4] px-2 py-1 text-xs font-semibold text-[#8b4545] hover:bg-[#fdf5f5]"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

export function ProjectAssetsPanel({
  projectId,
  refreshKey = 0,
  onChanged,
}: {
  projectId: string;
  refreshKey?: number;
  onChanged?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [panelMode, setPanelMode] = useState<"idle" | "link" | "note">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteKind, setNoteKind] = useState<ProjectAssetNoteKind>("quick");

  const uploadedFiles = useMemo(() => {
    void refreshKey;
    return listProjectAssetFiles(projectId);
  }, [projectId, refreshKey]);

  const notes = useMemo(() => {
    void refreshKey;
    return listProjectAssetNotes(projectId);
  }, [projectId, refreshKey]);

  const links = useMemo(() => {
    void refreshKey;
    return listProjectLinks(projectId);
  }, [projectId, refreshKey]);

  const autoFiles = useMemo(() => {
    void refreshKey;
    return listUnifiedProjectFiles(projectId).filter(
      (f) => f.category !== "links" && !f.id.startsWith("upload:"),
    );
  }, [projectId, refreshKey]);

  const filesByCategory = useMemo(
    () => groupUnifiedProjectFiles(autoFiles),
    [autoFiles],
  );

  const fileCount =
    uploadedFiles.length +
    autoFiles.length;
  const totalCount = fileCount + links.length + notes.length;

  function bump() {
    onChanged?.();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(PROJECT_ASSETS_UPDATED, { detail: { projectId } }),
      );
    }
  }

  async function handleFilePick(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        if (!isAcceptedProjectAssetFile(file)) {
          setUploadError(
            file.size > PROJECT_ASSET_MAX_BYTES
              ? `"${file.name}" is too large (max 8MB).`
              : `"${file.name}" isn't a supported type.`,
          );
          continue;
        }
        const result = await saveProjectAssetFile(projectId, file);
        if (!result.ok) setUploadError(result.error);
      }
      bump();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[#6b635a]">
        Everything for this project in one place — files, links, and notes.
        Exports from Create and Decision Compass still appear under Files
        automatically.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border border-[#1e4f4f]/30 bg-[#f0f5f5] px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#e4eded] disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload File"}
        </button>
        <button
          type="button"
          onClick={() => setPanelMode(panelMode === "link" ? "idle" : "link")}
          className="rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 text-sm font-semibold text-[#1f1c19] hover:bg-[#faf7f2]"
        >
          Add Link
        </button>
        <button
          type="button"
          onClick={() => setPanelMode(panelMode === "note" ? "idle" : "note")}
          className="rounded-xl border border-[#d4cdc3] bg-white px-3 py-2 text-sm font-semibold text-[#1f1c19] hover:bg-[#faf7f2]"
        >
          Create Note
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={FILE_ACCEPT}
          className="hidden"
          onChange={(e) => void handleFilePick(e.target.files)}
        />
      </div>

      {uploadError ? (
        <p className="text-sm text-[#8b4545]">{uploadError}</p>
      ) : null}

      {panelMode === "link" ? (
        <div className="space-y-2 rounded-xl border border-[#d4cdc3] bg-[#faf7f2]/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
            Add link
          </p>
          <input
            type="text"
            value={newLinkLabel}
            onChange={(e) => setNewLinkLabel(e.target.value)}
            placeholder="Label (optional — e.g. Figma board)"
            className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
          />
          <input
            type="url"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="https://… (Google Docs, YouTube, Loom, Drive…)"
            className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!newLinkUrl.trim()}
              onClick={() => {
                saveProjectLink({
                  projectId,
                  label: newLinkLabel,
                  url: newLinkUrl,
                });
                setNewLinkLabel("");
                setNewLinkUrl("");
                setPanelMode("idle");
                bump();
              }}
              className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save link
            </button>
            <button
              type="button"
              onClick={() => setPanelMode("idle")}
              className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#6b635a]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {panelMode === "note" ? (
        <div className="space-y-2 rounded-xl border border-[#d4cdc3] bg-[#faf7f2]/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
            Create note
          </p>
          <select
            value={noteKind}
            onChange={(e) => setNoteKind(e.target.value as ProjectAssetNoteKind)}
            className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
          >
            <option value="quick">Quick note</option>
            <option value="meeting">Meeting notes</option>
            <option value="brain-dump">Brain dump</option>
          </select>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1e4f4f]"
          />
          <textarea
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Write anything — ideas, meeting notes, brain dump…"
            rows={4}
            className="w-full resize-y rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#1e4f4f]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!noteBody.trim()}
              onClick={() => {
                saveProjectAssetNote({
                  projectId,
                  title: noteTitle,
                  body: noteBody,
                  kind: noteKind,
                });
                setNoteTitle("");
                setNoteBody("");
                setNoteKind("quick");
                setPanelMode("idle");
                bump();
              }}
              className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save note
            </button>
            <button
              type="button"
              onClick={() => setPanelMode("idle")}
              className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-sm font-semibold text-[#6b635a]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {totalCount === 0 ? (
        <p className="text-sm text-[#9a8f82]">
          No assets yet — upload a file, save a link, or jot a note.
        </p>
      ) : null}

      {fileCount > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Files ({fileCount})
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {uploadedFiles.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {uploadedFiles.map((file) => (
                  <li
                    key={file.id}
                    className="rounded-lg border border-[#e4ddd2] bg-white px-3 py-2 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-[#1f1c19]">
                          {file.name}
                        </span>
                        <p className="mt-0.5 text-xs text-[#6b635a]">
                          {projectAssetFileKindLabel(file.kind)} ·{" "}
                          {formatProjectAssetFileSize(file.sizeBytes)} ·{" "}
                          {formatDate(file.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <a
                          href={file.dataUrl}
                          download={file.name}
                          className="rounded-lg border border-[#1e4f4f]/30 px-2.5 py-1 text-xs font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            deleteProjectAssetFile(file.id);
                            bump();
                          }}
                          className="rounded-lg border border-[#e8c4c4] px-2 py-1 text-xs font-semibold text-[#8b4545] hover:bg-[#fdf5f5]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            {FILE_CATEGORIES.map((category) => {
              const files = filesByCategory[category].filter(
                (f) => !f.id.startsWith("upload:"),
              );
              if (!files.length) return null;
              return (
                <div key={category}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9a8f82]">
                    {projectFileCategoryLabel(category)}
                  </p>
                  <ul className="mt-1 flex flex-col gap-2">
                    {files.map((file) => (
                      <FileRow key={file.id} file={file} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {links.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Links ({links.length})
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {links.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                onDelete={() => {
                  deleteProjectLink(link.id);
                  bump();
                }}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {notes.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            Notes ({notes.length})
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-[#e4ddd2] bg-white px-3 py-2 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1f1c19]">{note.title}</p>
                    <p className="text-xs text-[#9a8f82]">
                      {projectAssetNoteKindLabel(note.kind)} ·{" "}
                      {formatDate(note.updatedAt)}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-[#4a443c]">
                      {note.body}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteProjectAssetNote(note.id);
                      bump();
                    }}
                    className="shrink-0 rounded-lg border border-[#e8c4c4] px-2 py-1 text-xs font-semibold text-[#8b4545] hover:bg-[#fdf5f5]"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
