"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ChatLayoutMode } from "@/lib/workspaceNav";

// Workspace Mode shell — Chat + working area together. Presentational only, so
// page.tsx can adopt it incrementally: pass the chat node and (optionally) an
// active workspace node. When a workspace is open:
//   • Desktop: two columns — chat left (~40%), workspace right (~60%).
//   • Mobile: a top tab switch; chat never disappears, one tap to flip back.
// When no workspace is open it simply renders chat full-width (no behavior change).

const layoutBtn =
  "rounded-lg px-2 py-1 text-xs font-semibold text-[#1e4f4f] transition-colors hover:bg-[#1e4f4f]/10";

const layoutBtnActive =
  "rounded-lg bg-[#1e4f4f]/15 px-2 py-1 text-xs font-semibold text-[#1e4f4f]";

export function WorkspaceLayout({
  chat,
  workspace,
  workspaceActive = Boolean(workspace),
  workspaceTitle = "Workspace",
  chatLayoutMode = "split",
  onChatLayoutModeChange,
  onClose,
  revealKey = 0,
}: {
  chat: ReactNode;
  workspace?: ReactNode | null;
  /** Stable flag — do not use the workspace node in effect deps (it changes every render). */
  workspaceActive?: boolean;
  workspaceTitle?: string;
  chatLayoutMode?: ChatLayoutMode;
  onChatLayoutModeChange?: (mode: ChatLayoutMode) => void;
  onClose?: () => void;
  /** Increment to scroll/focus workspace into view after open. */
  revealKey?: number;
}) {
  const [mobileView, setMobileView] = useState<"chat" | "work">("chat");
  const workspacePaneRef = useRef<HTMLDivElement>(null);
  const prevActiveRef = useRef(false);
  const lastRevealKeyRef = useRef(0);
  const chatHidden = chatLayoutMode === "workspace-focus";

  useEffect(() => {
    if (workspaceActive && !prevActiveRef.current) {
      setMobileView("work");
    }
    prevActiveRef.current = workspaceActive;
  }, [workspaceActive]);

  useEffect(() => {
    if (chatLayoutMode === "workspace-focus") {
      setMobileView("work");
    }
  }, [chatLayoutMode]);

  useEffect(() => {
    if (!workspaceActive || revealKey === 0 || revealKey === lastRevealKeyRef.current) {
      return;
    }
    lastRevealKeyRef.current = revealKey;
    const el = workspacePaneRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      el.focus({ preventScroll: false });
    });
  }, [workspaceActive, revealKey]);

  function setLayout(mode: ChatLayoutMode) {
    onChatLayoutModeChange?.(mode);
    if (mode === "workspace-focus") setMobileView("work");
    if (mode === "split") setMobileView("chat");
  }

  if (!workspaceActive || !workspace) {
    return <div className="h-full w-full">{chat}</div>;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {/* Mobile tab switch — chat is always one tap away */}
      <div className="flex shrink-0 gap-1 border-b border-[#1e4f4f]/10 bg-white/70 p-1 md:hidden">
        <button
          type="button"
          onClick={() => {
            setMobileView("chat");
            onChatLayoutModeChange?.("split");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
            mobileView === "chat" && !chatHidden
              ? "bg-[#1e4f4f] text-white"
              : "text-[#1e4f4f]"
          }`}
        >
          💬 Chat
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileView("work");
            onChatLayoutModeChange?.("workspace-focus");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
            mobileView === "work" || chatHidden
              ? "bg-[#1e4f4f] text-white"
              : "text-[#1e4f4f]"
          }`}
        >
          🛠 {workspaceTitle}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row md:items-stretch">
        {/* Chat pane — kept mounted when hidden so state is preserved */}
        <div
          className={`h-full min-h-0 flex-col overflow-hidden border-[#1e4f4f]/10 md:max-h-full md:border-r ${
            chatHidden
              ? "hidden"
              : mobileView === "chat"
                ? "flex w-full"
                : "hidden md:flex md:w-2/5"
          }`}
        >
          {chat}
        </div>

        {/* Workspace pane — sticky on desktop so Create stays visible while chat scrolls */}
        <div
          ref={workspacePaneRef}
          tabIndex={-1}
          className={`min-h-0 flex-1 flex-col outline-none ring-2 ring-transparent focus:ring-[#1e4f4f]/30 md:sticky md:top-0 md:max-h-full md:self-start ${
            chatHidden
              ? "flex w-full"
              : mobileView === "work"
                ? "flex w-full"
                : "hidden md:flex md:h-full"
          }`}
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#1e4f4f]/10 bg-white/60 px-3 py-2">
            <span className="text-sm font-semibold text-[#2d2926]">
              {workspaceTitle}
            </span>
            <div className="flex flex-wrap items-center justify-end gap-1">
              {chatHidden ? (
                <>
                  <button
                    type="button"
                    onClick={() => setLayout("split")}
                    className={layoutBtn}
                  >
                    Show Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout("split")}
                    className={layoutBtnActive}
                  >
                    Chat + Workspace
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setLayout("workspace-focus")}
                    className={layoutBtn}
                  >
                    Hide Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout("workspace-focus")}
                    className={layoutBtnActive}
                  >
                    Focus on Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout("split")}
                    className={layoutBtn}
                  >
                    Chat + Workspace
                  </button>
                </>
              )}
              {onClose && (
                <button type="button" onClick={onClose} className={layoutBtn}>
                  ✕ Close
                </button>
              )}
            </div>
          </div>
          {/* Solid canvas — content never sits over the blurred wallpaper. */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#faf7f2] shadow-inner">
            {workspace}
          </div>
        </div>
      </div>
    </div>
  );
}
