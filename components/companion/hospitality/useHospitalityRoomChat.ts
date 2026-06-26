"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPrefs } from "@/lib/companionStore";

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
      setInput(prefix + separator + transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
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
      recognition.stop();
      return;
    }
    baseInputRef.current = input;
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
    setInput(value);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    recognitionRef.current?.stop();
    setIsListening(false);

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
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
        throw new Error(data.error ?? "Request failed");
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message ?? "I'm here — try asking again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting — try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      void handleSend();
    },
    [handleSend],
  );

  return {
    input,
    messages,
    isLoading,
    isListening,
    speechSupported,
    inputRef,
    handleInputChange,
    handleKeyDown,
    handleSend,
    toggleListening,
  };
}
