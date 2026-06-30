"use client";

type WorkspaceIconBarProps = {
  onCloseNotebook: () => void;
  focusMode: boolean;
  onToggleFocus: () => void;
};

const ICONS = [
  { id: "search", label: "Search" },
  { id: "voice", label: "Voice" },
  { id: "history", label: "History" },
  { id: "environment", label: "Environment" },
  { id: "focus", label: "Focus Mode" },
  { id: "share", label: "Share" },
  { id: "publish", label: "Publish" },
] as const;

export function WorkspaceIconBar({
  onCloseNotebook,
  focusMode,
  onToggleFocus,
}: WorkspaceIconBarProps) {
  return (
    <div className="cw-icon-bar" role="toolbar" aria-label="Workspace tools">
      {ICONS.map((icon) => (
        <button
          key={icon.id}
          type="button"
          className={`cw-icon-bar__btn cw-icon-bar__btn--${icon.id}${icon.id === "focus" && focusMode ? " cw-icon-bar__btn--active" : ""}`}
          aria-label={icon.label}
          onClick={icon.id === "focus" ? onToggleFocus : undefined}
        />
      ))}
      <button
        type="button"
        className="cw-icon-bar__close"
        onClick={onCloseNotebook}
        aria-label="Close notebook"
      />
    </div>
  );
}
