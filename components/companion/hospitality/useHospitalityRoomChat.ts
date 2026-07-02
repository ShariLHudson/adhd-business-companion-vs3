"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { routeCompanionFailure } from "@/lib/companionContextRouting";
import { getPrefs } from "@/lib/companionStore";
import { tryCommitMicCaptureOnEnd } from "@/lib/voiceMicCommit";

type ChatMessage = { role: "user" | "assistant"; content: string };

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionEvent = Event & {
  results: { length: number; [index: number]: { [index: number]: { transcript: string } } };
};

/** Living-room chat — same `/api/companion-chat` pipeline as production welcome. */
export function useHospitalityRoomChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseInputRef = useRef("");
  const inputSnapshotRef = useRef("");
  const micExplicitStopRef = useRef(false);
  const handleSendRef = useRef<(overrideText?: string) => Promise<void>>(
    async () => {},
  );

  useEffect(() => {
    const win = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognition =
      win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i]![0]!.transcript;
      }
      const prefix = baseInputRef.current;
      const separator = prefix && !prefix.endsWith(" ") ? " " : "";
      const nextValue = prefix + separator + transcript;
      inputSnapshotRef.current = nextValue;
      setInput(nextValue);
    };

    recognition.onend = () => {
      setIsListening(false);
      tryCommitMicCaptureOnEnd({
        explicitStopRequested: micExplicitStopRef.current,
        inputSnapshot: inputSnapshotRef.current,
        send: (text) => {
          void handleSendRef.current(text);
        },
        onConsumedExplicitStop: () => {
          micExplicitStopRef.current = false;
        },
      });
    };
    recognition.onerror = () => {
      setIsListening(false);
      micExplicitStopRef.current = false;
    };
    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      micExplicitStopRef.current = true;
      recognition.stop();
      return;
    }
    baseInputRef.current = input;
    inputSnapshotRef.current = input;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      recognition.stop();
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }, [input, isListening]);

  const handleInputChange = useCallback((value: string) => {
    inputSnapshotRef.current = value;
    setInput(value);
  }, []);

  const handleSend = useCallback(async (overrideText?: string) => {
    handleSendRef.current = handleSend;
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    micExplicitStopRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    inputSnapshotRef.current = "";
    setIsLoading(true);

    try {
      const prefs = getPrefs();
      const res = await fetch("/api/companion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          coachingMode: "today",
          inputType: "text",
          userName: prefs.name || undefined,
          aiTone: prefs.aiTone,
          helpMode: prefs.helpMode,
          supportStyle: prefs.supportStyle,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "companion-chat-unavailable");
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message ?? "I'm here — what would help most?",
        },
      ]);
    } catch (err) {
      const routed = routeCompanionFailure(err, {
        surface: "chat",
        userText: text,
      });
      if (routed.channel === "estate") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: routed.message },
        ]);
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  return {
    input,
    messages,
    isLoading,
    isListening,
    speechSupported,
    inputRef,
    handleInputChange,
    handleSend,
    toggleListening,
  };
}
