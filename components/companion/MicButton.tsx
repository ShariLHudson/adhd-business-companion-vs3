"use client";

import { useEffect, useRef, useState } from "react";

import { speechLocaleForLanguage } from "@/lib/companionLanguage";
import { getPrefs } from "@/lib/companionStore";

// Global voice-input standard: use VoiceAnswerField next to any question field.
// MicButton is the low-level control; speech fills the field — no auto-submit.
// Uses continuous recognition (same as main chat) so long brain dumps are not cut off.

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SpeechResultEvent = {
  resultIndex: number;
  results: { isFinal: boolean; 0: { transcript: string } }[];
};

export function MicButton({
  onText,
  title = "Voice input",
  className,
  lang,
  prominent = false,
}: {
  onText: (text: string) => void;
  title?: string;
  className?: string;
  /** Larger mic for voice-first surfaces (e.g. Clear My Mind). */
  prominent?: boolean;
  lang?: string;
}) {
  const recRef = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;
  const listeningRef = useRef(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang ?? speechLocaleForLanguage(getPrefs().voiceLanguage);
    rec.onresult = (e) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r?.isFinal) finalText += r[0].transcript;
      }
      const t = finalText.trim();
      if (t) onTextRef.current(t);
    };
    rec.onend = () => {
      if (listeningRef.current) {
        try {
          rec.start();
        } catch {
          listeningRef.current = false;
          setListening(false);
        }
        return;
      }
      setListening(false);
    };
    rec.onerror = () => {
      listeningRef.current = false;
      setListening(false);
    };
    recRef.current = rec;
    return () => {
      listeningRef.current = false;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    };
  }, [lang]);

  if (!supported) return null;

  function toggle() {
    const rec = recRef.current;
    if (!rec) return;
    rec.lang = lang ?? speechLocaleForLanguage(getPrefs().voiceLanguage);
    if (listening) {
      listeningRef.current = false;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
    } else {
      listeningRef.current = true;
      try {
        rec.start();
        setListening(true);
      } catch {
        try {
          rec.stop();
          rec.start();
          setListening(true);
        } catch {
          listeningRef.current = false;
          setListening(false);
        }
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={title}
      aria-label={title}
      aria-pressed={listening}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border text-lg transition-colors ${
        prominent ? "h-12 w-12 text-xl" : "h-10 w-10"
      } ${
        listening
          ? "animate-pulse border-[#1e4f4f] bg-[#1e4f4f] text-white shadow-[0_4px_14px_rgba(30,79,79,0.35)]"
          : prominent
            ? "border-[#1e4f4f]/40 bg-[#f0f8f8] text-[#1e4f4f] shadow-[0_2px_10px_rgba(30,79,79,0.15)] hover:border-[#1e4f4f] hover:bg-[#e6f4f4]"
            : "border-[#c9bfb0] bg-white text-[#1e4f4f] hover:border-[#1e4f4f]"
      } ${className ?? ""}`}
    >
      <span aria-hidden="true">🎤</span>
    </button>
  );
}
