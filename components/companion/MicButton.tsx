"use client";

import { useEffect, useRef, useState } from "react";

import { speechLocaleForLanguage } from "@/lib/companionLanguage";
import { getPrefs } from "@/lib/companionStore";

// Global voice-input standard: "if I can type there, I can talk there."
// Drop <MicButton onText={t => setValue(v => v ? v + " " + t : t)} /> next to any
// text field. Speech converts to text in place — no modal, no extra screen.
// Silently renders nothing if the browser has no speech recognition.

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
  title = "Speak instead of typing",
  className,
  lang,
}: {
  onText: (text: string) => void;
  title?: string;
  className?: string;
  lang?: string;
}) {
  const recRef = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;
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
    rec.continuous = false;
    rec.interimResults = false;
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
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => {
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
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        /* already started / blocked */
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
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-lg transition-colors ${
        listening
          ? "animate-pulse border-[#1e4f4f] bg-[#1e4f4f] text-white"
          : "border-[#c9bfb0] bg-white text-[#1e4f4f] hover:border-[#1e4f4f]"
      } ${className ?? ""}`}
    >
      <span aria-hidden="true">🎤</span>
    </button>
  );
}
