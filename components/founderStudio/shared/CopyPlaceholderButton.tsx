"use client";

import { useCallback, useState } from "react";

type CopyFeedbackProps = {
  label: string;
  text: string;
  className?: string;
};

export function CopyPlaceholderButton({ label, text, className }: CopyFeedbackProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback("Copied");
      window.setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback("Copy unavailable");
    }
  }, [text]);

  return (
    <button type="button" className={className} onClick={() => void copy()}>
      {feedback ?? label}
    </button>
  );
}
