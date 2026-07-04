"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { JOURNAL_FONT_OPTIONS, JOURNAL_INK_OPTIONS } from "@/lib/journalGazebo/catalog";
import { JOURNAL_DESIGN_PEN_OPTIONS } from "@/lib/journalGazebo/designStudioCatalog";
import { getPageScroll, savePageScroll } from "@/lib/journalGazebo/journalPageStorage";
import type {
  JournalFontId,
  JournalGazeboConfig,
  JournalInkColor,
  JournalPenStyle,
} from "@/lib/journalGazebo/types";
import type { TypingStyle } from "@/lib/journalGazebo/writingSurface";
import {
  applyFontToSelection,
  applyInkToSelection,
  applyPenToSelection,
  consolidateVerticalCharBlocks,
  ensureEditorShell,
  execWritingFormat,
  migratePageHtml,
  peelEditorOverflow,
  prepareActiveBlockForTypingStyle,
  refreshEmptyActiveBlock,
  restyleAllBlocksInEditor,
  sanitizePageHtml,
  stampActiveBlockOnInput,
  writingSurfaceChromeStyle,
  type WritingFormatCommand,
} from "@/lib/journalGazebo/writingSurface";

type Props = {
  config: JournalGazeboConfig;
  typingStyle: TypingStyle;
  html: string;
  onHtmlChange?: (next: string) => void;
  onTypingStyleChange?: (patch: Partial<TypingStyle>) => void;
  onMakeDefault?: () => void;
  editorRef?: RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
  journalId?: string;
  pageIndex?: number;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  /** Fixed page height — hide scroll; peel overflow to the next page. */
  pageBound?: boolean;
  onPageOverflow?: (overflowHtml: string) => void;
};

function mergeRefs<T>(...refs: (RefObject<T | null> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      (ref as { current: T | null }).current = node;
    }
  };
}

export function JournalGazeboWritingSurface({
  config,
  typingStyle,
  html,
  onHtmlChange,
  onTypingStyleChange,
  onMakeDefault,
  editorRef,
  readOnly = false,
  journalId,
  pageIndex = 0,
  placeholder,
  className,
  "aria-label": ariaLabel,
  pageBound = false,
  onPageOverflow,
}: Props) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const lastEmittedRef = useRef(html);
  const syncingRef = useRef(false);
  const configRef = useRef(config);
  const typingStyleRef = useRef(typingStyle);
  configRef.current = config;
  typingStyleRef.current = typingStyle;

  const [toolbar, setToolbar] = useState<{
    visible: boolean;
    top: number;
    left: number;
    hasSelection: boolean;
  }>({ visible: false, top: 0, left: 0, hasSelection: false });

  const emitChange = useCallback(() => {
    const el = localRef.current;
    if (!el || readOnly || !onHtmlChange) return;
    const next = sanitizePageHtml(el.innerHTML);
    lastEmittedRef.current = next;
    el.dataset.empty = (el.textContent ?? "").trim() ? "false" : "true";
    onHtmlChange(next);
  }, [onHtmlChange, readOnly]);

  const stampForTyping = useCallback(() => {
    const el = localRef.current;
    if (!el || readOnly) return;
    ensureEditorShell(el, configRef.current, typingStyleRef.current);
    stampActiveBlockOnInput(el, configRef.current, typingStyleRef.current);
  }, [readOnly]);

  const updateToolbarPosition = useCallback(() => {
    const el = localRef.current;
    if (!el || readOnly) {
      setToolbar((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setToolbar((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      setToolbar((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const rect = range.getBoundingClientRect();
    const anchor = sel.isCollapsed
      ? (range.getClientRects()[0] ?? rect)
      : rect;
    if (!anchor.width && !anchor.height && sel.isCollapsed) {
      setToolbar((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    setToolbar({
      visible: true,
      top: Math.max(8, anchor.top - 10),
      left: anchor.left + (anchor.width || 0) / 2,
      hasSelection: !sel.isCollapsed,
    });
    if (!sel.isCollapsed) {
      savedSelectionRef.current = range.cloneRange();
    }
  }, [readOnly]);

  const restoreSavedSelection = useCallback(() => {
    const el = localRef.current;
    const saved = savedSelectionRef.current;
    if (!el || !saved) return false;
    const sel = window.getSelection();
    if (!sel) return false;
    if (!el.contains(saved.commonAncestorContainer)) return false;
    sel.removeAllRanges();
    sel.addRange(saved);
    return true;
  }, []);

  const runFormat = useCallback(
    (command: WritingFormatCommand) => {
      if (readOnly) return;
      restoreSavedSelection();
      execWritingFormat(command);
      emitChange();
      localRef.current?.focus();
      updateToolbarPosition();
    },
    [emitChange, readOnly, restoreSavedSelection, updateToolbarPosition],
  );

  const applyPageStylePatch = useCallback(
    (patch: Partial<TypingStyle>) => {
      if (readOnly) return;
      const el = localRef.current;
      const next = { ...typingStyleRef.current, ...patch };
      typingStyleRef.current = next;
      onTypingStyleChange?.(patch);
      if (el) {
        restyleAllBlocksInEditor(el, configRef.current, next);
      }
      emitChange();
      localRef.current?.focus();
    },
    [emitChange, onTypingStyleChange, readOnly],
  );

  const applyStyleToSelectionOrPage = useCallback(
    (
      patch: Partial<TypingStyle>,
      applySelection: (config: JournalGazeboConfig, style: TypingStyle) => void,
    ) => {
      if (readOnly) return;
      const el = localRef.current;
      const next = { ...typingStyleRef.current, ...patch };
      const sel = window.getSelection();
      const hasLiveSelection =
        sel && !sel.isCollapsed && el?.contains(sel.anchorNode);
      if (!hasLiveSelection) {
        restoreSavedSelection();
      }
      const selAfterRestore = window.getSelection();
      if (
        selAfterRestore &&
        !selAfterRestore.isCollapsed &&
        el?.contains(selAfterRestore.anchorNode)
      ) {
        applySelection(configRef.current, next);
        typingStyleRef.current = next;
        onTypingStyleChange?.(patch);
        emitChange();
      } else {
        applyPageStylePatch(patch);
        return;
      }
      localRef.current?.focus();
      updateToolbarPosition();
    },
    [
      applyPageStylePatch,
      emitChange,
      onTypingStyleChange,
      readOnly,
      restoreSavedSelection,
      updateToolbarPosition,
    ],
  );

  const runFontOnSelection = useCallback(
    (fontId: JournalFontId) => {
      applyStyleToSelectionOrPage({ fontId }, (config, style) => {
        applyFontToSelection(fontId, config, style);
      });
    },
    [applyStyleToSelectionOrPage],
  );

  const runInkOnSelection = useCallback(
    (inkColor: JournalInkColor) => {
      applyStyleToSelectionOrPage({ inkColor }, (config, style) => {
        applyInkToSelection(inkColor, config, style);
      });
    },
    [applyStyleToSelectionOrPage],
  );

  const runPenOnSelection = useCallback(
    (penStyle: JournalPenStyle) => {
      applyStyleToSelectionOrPage({ penStyle }, (config, style) => {
        applyPenToSelection(penStyle, config, style);
      });
    },
    [applyStyleToSelectionOrPage],
  );

  const selectionStillInEditor = useCallback(() => {
    const el = localRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    return el.contains(range.commonAncestorContainer);
  }, []);

  useEffect(() => {
    if (readOnly) return;
    document.addEventListener("selectionchange", updateToolbarPosition);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (toolbarRef.current?.contains(target)) return;
      window.requestAnimationFrame(updateToolbarPosition);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("selectionchange", updateToolbarPosition);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [readOnly, updateToolbarPosition]);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    if (html === lastEmittedRef.current && el.innerHTML) return;
    syncingRef.current = true;
    const migrated = migratePageHtml(html, configRef.current, typingStyleRef.current);
    el.innerHTML = migrated;
    el.dataset.empty = (el.textContent ?? "").trim() ? "false" : "true";
    if (migrated !== html && !readOnly && onHtmlChange) {
      lastEmittedRef.current = migrated;
      onHtmlChange(migrated);
    } else {
      lastEmittedRef.current = html;
    }
    syncingRef.current = false;
  }, [html, pageIndex, onHtmlChange, readOnly]);

  useEffect(() => {
    const el = localRef.current;
    if (!el || readOnly) return;
    if (refreshEmptyActiveBlock(el, config, typingStyle)) {
      emitChange();
      return;
    }
    const focused =
      document.activeElement === el || el.contains(document.activeElement);
    if (!focused) return;
    prepareActiveBlockForTypingStyle(el, config, typingStyle);
    emitChange();
  }, [
    typingStyle.fontId,
    typingStyle.inkColor,
    typingStyle.writingFontSize,
    typingStyle.penStyle,
    typingStyle.nibSize,
    config,
    emitChange,
    readOnly,
    pageIndex,
  ]);

  useEffect(() => {
    if (readOnly || !journalId || pageBound) return;
    const el = localRef.current;
    if (!el) return;
    const scrollTop = getPageScroll(journalId, pageIndex);
    requestAnimationFrame(() => {
      el.scrollTop = scrollTop;
    });
  }, [journalId, pageBound, pageIndex, readOnly]);

  useEffect(() => {
    if (readOnly || !journalId || pageBound) return;
    return () => {
      const el = localRef.current;
      if (!el) return;
      savePageScroll(journalId, pageIndex, el.scrollTop);
    };
  }, [journalId, pageBound, pageIndex, readOnly]);

  const checkPageOverflow = useCallback(() => {
    if (readOnly || !pageBound || !onPageOverflow) return;
    const el = localRef.current;
    if (!el || el.clientHeight < 120 || el.clientWidth < 120) return;
    const overflow = peelEditorOverflow(el);
    if (!overflow) return;
    emitChange();
    onPageOverflow(overflow);
  }, [emitChange, onPageOverflow, pageBound, readOnly]);

  const surfaceStyle = writingSurfaceChromeStyle() as CSSProperties;
  const isEmpty = !plainHasContent(html);

  const toolbarStyle: CSSProperties = {
    position: "fixed",
    top: toolbar.top,
    left: toolbar.left,
    transform: "translate(-50%, -100%)",
    zIndex: 100005,
  };

  return (
    <>
      {!readOnly && toolbar.visible ? (
        <div
          ref={toolbarRef}
          className="jg-writing-toolbar jg-writing-toolbar--visible jg-writing-toolbar--fixed"
          style={toolbarStyle}
          role="toolbar"
          aria-label="Writing hand"
          onMouseDown={(e) => e.preventDefault()}
          onPointerDown={(e) => e.preventDefault()}
        >
          <button
            type="button"
            className="jg-writing-toolbar__btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runFormat("bold")}
            aria-label="Bold"
          >
            B
          </button>
          <button
            type="button"
            className="jg-writing-toolbar__btn jg-writing-toolbar__btn--italic"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runFormat("italic")}
            aria-label="Italic"
          >
            I
          </button>
          <button
            type="button"
            className="jg-writing-toolbar__btn jg-writing-toolbar__btn--underline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runFormat("underline")}
            aria-label="Underline"
          >
            U
          </button>
          <span className="jg-writing-toolbar__divider" aria-hidden="true" />
          <label className="jg-writing-toolbar__font">
            <select
              className="jg-writing-toolbar__select"
              aria-label="Handwriting"
              value={typingStyle.fontId}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => runFontOnSelection(e.target.value as JournalFontId)}
            >
              {JOURNAL_FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>
          <label className="jg-writing-toolbar__font">
            <select
              className="jg-writing-toolbar__select"
              aria-label="Pen"
              value={typingStyle.penStyle}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => runPenOnSelection(e.target.value as JournalPenStyle)}
            >
              {JOURNAL_DESIGN_PEN_OPTIONS.map((pen) => (
                <option key={pen.id} value={pen.id}>
                  {pen.label}
                </option>
              ))}
            </select>
          </label>
          <label className="jg-writing-toolbar__font">
            <select
              className="jg-writing-toolbar__select"
              aria-label="Ink"
              value={typingStyle.inkColor}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => runInkOnSelection(e.target.value as JournalInkColor)}
            >
              {JOURNAL_INK_OPTIONS.map((ink) => (
                <option key={ink.id} value={ink.id}>
                  {ink.label}
                </option>
              ))}
            </select>
          </label>
          {onMakeDefault ? (
            <>
              <span className="jg-writing-toolbar__divider" aria-hidden="true" />
              <button
                type="button"
                className="jg-writing-toolbar__default"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onMakeDefault}
              >
                Default for new pages
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <div
        ref={mergeRefs(localRef, editorRef)}
        data-estate-document-editor="true"
        className={[
          "jg-writing-surface",
          pageBound ? "jg-writing-surface--page-bound" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={surfaceStyle}
        contentEditable={readOnly ? false : true}
        suppressContentEditableWarning
        role={readOnly ? undefined : "textbox"}
        aria-multiline={readOnly ? undefined : true}
        aria-label={ariaLabel}
        data-placeholder={placeholder}
        data-empty={isEmpty ? "true" : "false"}
        onFocus={() => {
          if (readOnly) return;
          const el = localRef.current;
          if (el) ensureEditorShell(el, configRef.current, typingStyleRef.current);
          stampForTyping();
          updateToolbarPosition();
        }}
        onClick={() => {
          if (readOnly) return;
          window.setTimeout(updateToolbarPosition, 0);
        }}
        onKeyUp={() => {
          if (readOnly) return;
          updateToolbarPosition();
        }}
        onInput={() => {
          if (syncingRef.current || readOnly) return;
          const el = localRef.current;
          if (el) consolidateVerticalCharBlocks(el);
          stampForTyping();
          emitChange();
          updateToolbarPosition();
          if (pageBound && onPageOverflow) {
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(checkPageOverflow);
            });
          }
        }}
        onBlur={(e) => {
          if (readOnly || !journalId || pageBound) return;
          const el = localRef.current;
          if (!el) return;
          savePageScroll(journalId, pageIndex, el.scrollTop);
          const related = e.relatedTarget;
          if (related instanceof Node && toolbarRef.current?.contains(related)) return;
          window.setTimeout(() => {
            if (selectionStillInEditor()) {
              updateToolbarPosition();
              return;
            }
            if (document.activeElement instanceof Node && toolbarRef.current?.contains(document.activeElement)) {
              return;
            }
            setToolbar((t) => (t.visible ? { ...t, visible: false } : t));
          }, 120);
        }}
      />
    </>
  );
}

function plainHasContent(html: string): boolean {
  if (!html) return false;
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, "").trim().length > 0;
  const div = document.createElement("div");
  div.innerHTML = migratePageHtml(html);
  return (div.textContent ?? "").trim().length > 0;
}
