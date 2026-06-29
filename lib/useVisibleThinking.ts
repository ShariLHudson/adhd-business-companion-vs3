"use client";

import { useEffect, useRef, useState } from "react";
import {
  evaluateVisibleThinking,
  type VisibleThinkingContext,
} from "./visibleThinking";

const TICK_MS = 300;

/**
 * Visible Thinking — adaptive, intelligence-aware wait copy.
 * Returns null until reveal threshold so fast replies never flash loading text.
 */
export function useVisibleThinking(
  isActive: boolean,
  context: VisibleThinkingContext | null,
): string | null {
  const [message, setMessage] = useState<string | null>(null);
  const startRef = useRef<number | null>(null);
  const usedRef = useRef<Set<string>>(new Set());
  const contextRef = useRef(context);
  contextRef.current = context;

  useEffect(() => {
    if (!isActive || !context) {
      startRef.current = null;
      usedRef.current = new Set();
      setMessage(null);
      return;
    }

    startRef.current = performance.now();
    usedRef.current = new Set();

    const tick = () => {
      if (!startRef.current || !contextRef.current) return;
      const elapsed = performance.now() - startRef.current;
      const next = evaluateVisibleThinking({
        context: contextRef.current,
        elapsedMs: elapsed,
        usedMessages: usedRef.current,
      });
      if (next) {
        usedRef.current.add(next);
        setMessage(next);
      }
    };

    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [isActive, context]);

  return message;
}
