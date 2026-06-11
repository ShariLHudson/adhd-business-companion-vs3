"use client";

// Route-level error boundary. If anything in the app throws during render,
// the person sees this calm recovery screen instead of a blank crash — and
// because the conversation and drafts are saved to local storage, nothing
// they wrote is lost.

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for debugging without breaking the experience.
    console.error("Companion app error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "#f4efe7",
        color: "#2d2926",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "28rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.75rem", fontWeight: 600, color: "#1f1c19" }}>
          Just a small hiccup
        </p>
        <p
          style={{
            marginTop: "0.75rem",
            fontSize: "1.125rem",
            lineHeight: 1.6,
            color: "#6b635a",
          }}
        >
          Something tripped up for a moment — but your conversation and notes
          are saved. Let&apos;s pick up right where you were.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            borderRadius: "0.75rem",
            background: "#1e4f4f",
            color: "#ffffff",
            padding: "0.875rem 2rem",
            fontSize: "1.125rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          Take me back
        </button>
      </div>
    </div>
  );
}
