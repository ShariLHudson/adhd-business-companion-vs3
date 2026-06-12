"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MIN_LEFT = 240;
const MIN_RIGHT = 320;
const DEFAULT_LEFT = 360;

export function ResizableSplit({
  left,
  right,
  storageKey = "founder-workspace-split",
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  storageKey?: string;
}) {
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT);
  const leftWidthRef = useRef(DEFAULT_LEFT);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const n = Number(saved);
      if (!Number.isNaN(n) && n >= MIN_LEFT) setLeftWidth(n);
    }
  }, [storageKey]);

  const onMove = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = Math.min(
        rect.width - MIN_RIGHT,
        Math.max(MIN_LEFT, clientX - rect.left),
      );
      leftWidthRef.current = next;
      setLeftWidth(next);
    },
    [],
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      onMove(e.clientX);
    }
    function onMouseUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, String(leftWidthRef.current));
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMove, storageKey]);

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">
      <div
        className="flex min-h-0 shrink-0 flex-col border-r border-[#d4cdc3] bg-white/80"
        style={{ width: leftWidth }}
      >
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panes"
        onMouseDown={() => {
          dragging.current = true;
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
        }}
        className="w-1.5 shrink-0 cursor-col-resize bg-[#d4cdc3]/60 hover:bg-[#1e4f4f]/30 active:bg-[#1e4f4f]/50"
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f5f0e8]">{right}</div>
    </div>
  );
}
