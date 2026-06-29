"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { speechLocaleForLanguage } from "@/lib/companionLanguage";
import { getPrefs } from "@/lib/companionStore";

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
};

type SpeechResultEvent = {
  resultIndex: number;
  results: { isFinal: boolean; 0: { transcript: string } }[];
};

export function appendSpeechText(current: string, spoken: string): string {
  const t = spoken.trim();
  if (!t) return current;
  const base = current.trim();
  if (!base) return t;
  const separator = /[.!?]$/.test(base) ? " " : base.endsWith(",") ? " " : ". ";
  return `${base}${separator}${t}`;
}

export function useSpeechToText(lang?: string) {
  const recRef = useRef<Recognition | null>(null);
  const listeningRef = useRef(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const onFinalRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
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
      if (t) {
        setTranscript(t);
        onFinalRef.current?.(t);
      }
    };
    rec.onend = () => {
      if (listeningRef.current) {
        try {
          rec.start();
        } catch {
          listeningRef.current = false;
          setIsListening(false);
        }
        return;
      }
      setIsListening(false);
    };
    rec.onerror = (e) => {
      listeningRef.current = false;
      setIsListening(false);
      if (e.error === "not-allowed") {
        setError("Microphone permission was denied.");
      } else {
        setError("Microphone unavailable. You can still type your message.");
      }
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

  const stopListening = useCallback(() => {
    const rec = recRef.current;
    listeningRef.current = false;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (onFinal?: (text: string) => void) => {
      const rec = recRef.current;
      if (!rec || !isSupported) return;
      setError(null);
      onFinalRef.current = onFinal ?? null;
      rec.lang = lang ?? speechLocaleForLanguage(getPrefs().voiceLanguage);
      listeningRef.current = true;
      try {
        rec.start();
        setIsListening(true);
      } catch {
        try {
          rec.stop();
          rec.start();
          setIsListening(true);
        } catch {
          listeningRef.current = false;
          setIsListening(false);
          setError("Microphone unavailable. You can still type your message.");
        }
      }
    },
    [isSupported, lang],
  );

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
  };
}
