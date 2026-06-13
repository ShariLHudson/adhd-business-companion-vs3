"use client";

import { useEffect, useState } from "react";
import { getPrefs, savePrefs } from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";

// --- Support + billing config ---------------------------------------------
const SUPPORT_EMAIL = "info@visualsparkstudios.com";
const SUPPORT_PHONE_DISPLAY = "515-954-9177";
const SUPPORT_PHONE_TEL = "+15159549177";
// Paste your GoHighLevel customer billing portal link to enable "Manage billing".
const GHL_BILLING_URL = "";

// Profile is a CONTROL PANEL — account, access, settings entry, and real
// support escalation. No app teaching or coaching (that lives in Chat).
type SectionId = "account" | "subscription" | "help" | "contact";

const SECTIONS: { id: SectionId; label: string; emoji: string }[] = [
  { id: "account", label: "Account", emoji: "🧍" },
  { id: "subscription", label: "Subscription", emoji: "💳" },
  { id: "help", label: "Help", emoji: "🆘" },
  { id: "contact", label: "Contact Support", emoji: "📞" },
];

export function ProfilePanel({
  onOpen,
  onSignIn,
}: {
  onOpen?: (section: AppSection) => void;
  onSignIn?: () => void;
}) {
  const { configured, user, signOut } = useCompanionAuth();
  const [open, setOpen] = useState<SectionId | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [ticketType, setTicketType] = useState<"bug" | "broken" | null>(null);
  const [ticketText, setTicketText] = useState("");

  useEffect(() => {
    const p = getPrefs();
    setName(p.name);
    setEmail(p.email);
  }, []);

  function sendTicket() {
    if (!ticketText.trim()) return;
    const subject =
      ticketType === "broken"
        ? "Something's broken — Spark Studio Companions"
        : "Bug report — Spark Studio Companions";
    const sig = name || email ? `\n\n— ${name || "User"}${email ? ` (${email})` : ""}` : "";
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(ticketText + sig)}`;
    if (typeof window !== "undefined") window.location.href = href;
    setTicketText("");
    setTicketType(null);
  }

  const issueBtn =
    "rounded-xl border border-[#c9bfb0] bg-white px-4 py-2.5 text-left text-sm font-semibold text-[#3d3630] hover:bg-[#f0f5f5]";

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8">
      <p className="text-2xl font-semibold text-[#1f1c19]">Profile</p>

      {/* Business profile — the context that makes Shari specific to you. */}
      <button
        type="button"
        onClick={() => onOpen?.("business-profile")}
        className="mt-4 flex items-center gap-3 rounded-xl border border-[#1e4f4f]/30 bg-[#1e4f4f]/[0.06] px-4 py-3 text-left hover:bg-[#1e4f4f]/[0.1]"
      >
        <span aria-hidden="true" className="text-2xl">
          🧠
        </span>
        <span>
          <span className="block text-base font-semibold text-[#1f1c19]">
            Business profile
          </span>
          <span className="block text-sm text-[#6b635a]">
            Tell Shari about your business so everything fits you (2 min).
          </span>
        </span>
      </button>

      {/* Client Avatars — the "audience brain" everything else draws from. */}
      <button
        type="button"
        onClick={() => onOpen?.("client-avatars")}
        className="mt-3 flex items-center gap-3 rounded-xl border border-[#1e4f4f]/30 bg-[#1e4f4f]/[0.06] px-4 py-3 text-left hover:bg-[#1e4f4f]/[0.1]"
      >
        <span aria-hidden="true" className="text-2xl">
          👤
        </span>
        <span>
          <span className="block text-base font-semibold text-[#1f1c19]">
            Client Avatars
          </span>
          <span className="block text-sm text-[#6b635a]">
            Who you help. Build, switch, and the whole app writes for them.
          </span>
        </span>
      </button>

      <ul className="mt-5 flex flex-col gap-2">
        {SECTIONS.map((s) => (
          <li
            key={s.id}
            className="overflow-hidden rounded-xl border border-[#d4cdc3] bg-white/85"
          >
            <button
              type="button"
              onClick={() => setOpen(open === s.id ? null : s.id)}
              aria-expanded={open === s.id}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-base font-semibold text-[#1f1c19]"
            >
              <span aria-hidden="true" className="w-6 text-center">
                {s.emoji}
              </span>
              {s.label}
              <span aria-hidden="true" className="ml-auto text-sm text-[#6b635a]">
                {open === s.id ? "▾" : "▸"}
              </span>
            </button>

            {open === s.id && (
              <div className="companion-fade-in border-t border-[#e7dfd4] px-4 py-4">
                {s.id === "account" && (
                  <div className="flex flex-col gap-3">
                    {configured ? (
                      <div className="rounded-lg border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2.5 text-sm text-[#4b463f]">
                        {user ? (
                          <>
                            Signed in as{" "}
                            <strong>{user.email ?? "your account"}</strong>
                          </>
                        ) : (
                          <>You are not signed in on this device.</>
                        )}
                      </div>
                    ) : null}
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name — what should Shari call you?"
                      className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      type="email"
                      className="rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          savePrefs({ name: name.trim(), email: email.trim() });
                          setSavedAt(Date.now());
                        }}
                        className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
                      >
                        Save
                      </button>
                      {configured && onSignIn ? (
                        <button
                          type="button"
                          onClick={onSignIn}
                          className="rounded-xl border border-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
                        >
                          {user ? "Account & sign-in" : "Sign in"}
                        </button>
                      ) : null}
                      {user ? (
                        <button
                          type="button"
                          onClick={() => void signOut()}
                          className="rounded-xl border border-[#c9bfb0] px-5 py-2.5 text-sm font-semibold text-[#3d3630] hover:bg-[#f0f5f5]"
                        >
                          Log out
                        </button>
                      ) : null}
                      {savedAt && (
                        <span className="text-sm text-[#1e4f4f]">Saved ✓</span>
                      )}
                    </div>
                  </div>
                )}

                {s.id === "subscription" && (
                  <div>
                    <p className="text-base text-[#1f1c19]">
                      Plan: <strong>Free</strong> · Status: Active
                    </p>
                    {GHL_BILLING_URL ? (
                      <a
                        href={GHL_BILLING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
                      >
                        Manage billing
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-[#6b635a]">
                        Billing portal connects soon — manage payment, receipts,
                        and cancellation there. (Needs the GoHighLevel
                        customer-portal link.)
                      </p>
                    )}
                  </div>
                )}

                {s.id === "help" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
                      How-to guides
                    </p>

                    <details className="rounded-xl border border-[#d4cdc3] bg-white/85 p-3">
                      <summary className="cursor-pointer text-base font-semibold text-[#1f1c19]">
                        📝 Send content to Google Docs
                      </summary>
                      <div className="mt-2 text-sm leading-relaxed text-[#4b463f]">
                        <p>
                          1. Create any draft — in Create, Email
                          generator, or open a saved template.
                        </p>
                        <p className="mt-1">
                          2. In the export row, tap{" "}
                          <span className="font-semibold">📝 Google Docs</span>.
                          It copies your text and opens a new Google Doc.
                        </p>
                        <p className="mt-1">
                          3. In the new Doc, paste with{" "}
                          <span className="font-semibold">Ctrl+V</span> (
                          <span className="font-semibold">Cmd+V</span> on Mac).
                        </p>
                        <p className="mt-2 text-[#6b635a]">
                          Tip: make sure you&apos;re signed into Google in your
                          browser first. (True one-click auto-fill needs a
                          connected Google account — that&apos;s on the roadmap.)
                        </p>
                      </div>
                    </details>

                    <details className="rounded-xl border border-[#d4cdc3] bg-white/85 p-3">
                      <summary className="cursor-pointer text-base font-semibold text-[#1f1c19]">
                        📣 Post to Facebook, Instagram or LinkedIn
                      </summary>
                      <div className="mt-2 text-sm leading-relaxed text-[#4b463f]">
                        <p>
                          1. Add your profile links in{" "}
                          <span className="font-semibold">
                            Settings → Connections
                          </span>
                          .
                        </p>
                        <p className="mt-1">
                          2. On a social post, tap the network in the export row
                          — it copies the post and opens your page.
                        </p>
                        <p className="mt-1">3. Paste, review, and post.</p>
                      </div>
                    </details>

                    <p className="mt-2 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
                      Need a hand?
                    </p>
                    <p className="text-sm text-[#6b635a]">
                      Hit a problem? Tell us what&apos;s wrong and we&apos;ll
                      get on it.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTicketType("bug")}
                      className={issueBtn}
                    >
                      🐞 Something isn&apos;t working
                    </button>
                    <a
                      href={GHL_BILLING_URL || `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Account or billing issue")}`}
                      target={GHL_BILLING_URL ? "_blank" : undefined}
                      rel={GHL_BILLING_URL ? "noopener noreferrer" : undefined}
                      className={issueBtn}
                    >
                      💳 Account or billing issue
                    </a>
                    <button
                      type="button"
                      onClick={() => setTicketType("broken")}
                      className={issueBtn}
                    >
                      ⚠️ Something feels broken or wrong
                    </button>

                    {ticketType && (
                      <div className="companion-fade-in flex flex-col gap-2">
                        <textarea
                          value={ticketText}
                          onChange={(e) => setTicketText(e.target.value)}
                          placeholder="What happened? What were you doing when it went wrong?"
                          className="min-h-[90px] resize-none rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTicketType(null);
                              setTicketText("");
                            }}
                            className="rounded-xl border-2 border-[#1e4f4f] bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={!ticketText.trim()}
                            onClick={sendTicket}
                            className="rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white disabled:bg-[#9aaba8]"
                          >
                            Send to support
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="mt-1 border-t border-[#e7dfd4] pt-3 text-sm text-[#6b635a]">
                      Trying to learn how to use something?{" "}
                      <button
                        type="button"
                        onClick={() => onOpen?.("home")}
                        className="font-semibold text-[#1e4f4f] underline"
                      >
                        Ask in chat
                      </button>
                      .
                    </p>
                  </div>
                )}

                {s.id === "contact" && (
                  <div className="text-sm">
                    <p className="text-[#6b635a]">Reach a human directly:</p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="mt-1 block font-semibold text-[#1e4f4f]"
                    >
                      📩 {SUPPORT_EMAIL}
                    </a>
                    <a
                      href={`tel:${SUPPORT_PHONE_TEL}`}
                      className="mt-0.5 block font-semibold text-[#1e4f4f]"
                    >
                      📞 {SUPPORT_PHONE_DISPLAY}
                    </a>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
