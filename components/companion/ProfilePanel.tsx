"use client";

import { useEffect, useState } from "react";
import { getPrefs, savePrefs } from "@/lib/companionStore";
import type { AppSection } from "@/lib/companionUi";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { requestWelcomeHomeReplay } from "@/lib/welcomeHome";
import { GettingToKnowYouPanel } from "@/components/companion/GettingToKnowYouPanel";
import { ActiveCompanionsPicker } from "@/components/companion/ActiveCompanionsPicker";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

function settingsHref(section: ProfileSettingsSection): string {
  return `/companion?overlay=settings&settings=${encodeURIComponent(section)}`;
}

const SUPPORT_EMAIL = "info@visualsparkstudios.com";
const SUPPORT_PHONE_DISPLAY = "515-954-9177";
const SUPPORT_PHONE_TEL = "+15159549177";
const GHL_BILLING_URL = "";

/** Settings sections Profile may deep-link into (companion prefs only — not app config). */
export type ProfileSettingsSection = "tone" | "plan";

type PrefLink =
  | {
      label: string;
      emoji: string;
      blurb: string;
      settings: ProfileSettingsSection;
    }
  | {
      label: string;
      emoji: string;
      blurb: string;
      action: "getting-to-know-you";
    };

const COMPANION_PREF_LINKS: PrefLink[] = [
  {
    label: "Communication style",
    emoji: "💬",
    settings: "tone",
    blurb: "How Shari talks with you — tone, help mode, and support style.",
  },
];

const PERSONAL_CONTEXT_LINKS: PrefLink[] = [
  {
    label: "Getting to know you",
    emoji: "🌱",
    blurb: "What Shari has learned about you — review or update anytime.",
    action: "getting-to-know-you" as const,
  },
];

export function ProfilePanel({
  onOpen,
  onSignIn,
  onOpenSettings,
  openGettingToKnowYou,
}: {
  onOpen?: (section: AppSection) => void;
  onSignIn?: () => void;
  onOpenSettings?: (section: ProfileSettingsSection) => void;
  openGettingToKnowYou?: boolean;
}) {
  const { configured, user, signOut } = useCompanionAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [showGettingToKnowYou, setShowGettingToKnowYou] = useState(openGettingToKnowYou ?? false);

  useEffect(() => {
    if (openGettingToKnowYou) setShowGettingToKnowYou(true);
  }, [openGettingToKnowYou]);
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
    const sig =
      name || email ? `\n\n— ${name || "User"}${email ? ` (${email})` : ""}` : "";
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(ticketText + sig)}`;
    if (typeof window !== "undefined") window.location.href = href;
    setTicketText("");
    setTicketType(null);
  }

  const linkBtn =
    "flex w-full items-center gap-3 rounded-xl border border-[#d4cdc3] bg-white/85 px-4 py-3 text-left transition-colors hover:border-[#1e4f4f]/40 hover:bg-white";

  if (showGettingToKnowYou) {
    return (
      <GettingToKnowYouPanel onBack={() => setShowGettingToKnowYou(false)} />
    );
  }

  return (
    <div className={workspacePanelShellClass({ width: "narrow" })}>
      <p className="text-2xl font-semibold text-[#1f1c19]">Profile</p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Who you are and what Shari should know about you and your business.
      </p>

      {/* Account — always at top */}
      <div className="mt-5 rounded-2xl border border-[#1e4f4f]/25 bg-[#1e4f4f]/[0.05] p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Account
        </p>
        {configured ? (
          <div className="mt-2 rounded-lg border border-[#e7dfd4] bg-white px-3 py-2.5 text-sm text-[#4b463f]">
            {user ? (
              <>
                Signed in as <strong>{user.email ?? "your account"}</strong>
              </>
            ) : (
              <>Not signed in on this device.</>
            )}
          </div>
        ) : null}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name — what should Shari call you?"
          className="mt-3 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base outline-none focus:border-[#1e4f4f]"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
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
              {user ? "Your account" : "Sign in"}
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
          {savedAt ? (
            <span className="text-sm text-[#1e4f4f]">Saved ✓</span>
          ) : null}
        </div>
      </div>

      {/* Business context */}
      <p className="mt-6 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Business
      </p>
      <div className="mt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onOpen?.("business-profile")}
          className={linkBtn}
        >
          <span aria-hidden="true" className="text-xl">
            🏢
          </span>
          <span>
            <span className="block text-base font-semibold text-[#1f1c19]">
              Business profile
            </span>
            <span className="block text-sm text-[#6b635a]">
              Name, industry, goals, and who you serve.
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onOpen?.("client-avatars")}
          className={linkBtn}
        >
          <span aria-hidden="true" className="text-xl">
            👤
          </span>
          <span>
            <span className="block text-base font-semibold text-[#1f1c19]">
              Audience Profile
            </span>
            <span className="block text-sm text-[#6b635a]">
              Who you help — powers Create and messaging.
            </span>
          </span>
        </button>
      </div>

      {/* Personal context */}
      <p className="mt-6 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Personal context
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {PERSONAL_CONTEXT_LINKS.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={() => setShowGettingToKnowYou(true)}
            className={linkBtn}
          >
            <span aria-hidden="true" className="text-xl">
              {link.emoji}
            </span>
            <span>
              <span className="block text-base font-semibold text-[#1f1c19]">
                {link.label}
              </span>
              <span className="block text-sm text-[#6b635a]">{link.blurb}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Companion preferences */}
      <p className="mt-6 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
        Companion preferences
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {COMPANION_PREF_LINKS.map((link) => {
          if (!("settings" in link)) return null;
          return (
            <a
              key={link.label}
              href={settingsHref(link.settings)}
              onClick={(e) => {
                e.preventDefault();
                onOpenSettings?.(link.settings);
              }}
              className={linkBtn}
            >
              <span aria-hidden="true" className="text-xl">
                {link.emoji}
              </span>
              <span>
                <span className="block text-base font-semibold text-[#1f1c19]">
                  {link.label}
                </span>
                <span className="block text-sm text-[#6b635a]">{link.blurb}</span>
              </span>
            </a>
          );
        })}
        <button
          type="button"
          onClick={() => requestWelcomeHomeReplay()}
          className={linkBtn}
        >
          <span aria-hidden="true" className="text-xl">
            🏡
          </span>
          <span>
            <span className="block text-base font-semibold text-[#1f1c19]">
              Replay Shari&apos;s Welcome
            </span>
            <span className="block text-sm text-[#6b635a]">
              Hear the Welcome Home arrival again — without resetting first login.
            </span>
          </span>
        </button>
      </div>

      <ActiveCompanionsPicker />

      {/* Subscription */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#d4cdc3] bg-white/85">
        <div className="px-4 py-3">
          <p className="text-base font-semibold text-[#1f1c19]">💳 Subscription</p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Plan: <strong>Free</strong> · Status: Active
          </p>
          {GHL_BILLING_URL ? (
            <a
              href={GHL_BILLING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-[#1e4f4f] underline"
            >
              Manage billing
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onOpenSettings?.("plan")}
              className="mt-2 text-sm font-semibold text-[#1e4f4f]"
            >
              View plan & voice →
            </button>
          )}
        </div>
      </div>

      {/* Support */}
      <button
        type="button"
        onClick={() => setSupportOpen((o) => !o)}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#d4cdc3] bg-white/85 px-4 py-3 text-left text-base font-semibold text-[#1f1c19]"
      >
        <span>🆘 Help & support</span>
        <span className="text-sm text-[#6b635a]">{supportOpen ? "▾" : "▸"}</span>
      </button>
      {supportOpen ? (
        <div className="mt-2 rounded-xl border border-[#d4cdc3] bg-white/85 p-4 text-sm">
          <button
            type="button"
            onClick={() => setTicketType("bug")}
            className="mb-2 w-full rounded-xl border border-[#c9bfb0] px-4 py-2.5 text-left font-semibold"
          >
            🐞 Report a bug
          </button>
          <button
            type="button"
            onClick={() => setTicketType("broken")}
            className="w-full rounded-xl border border-[#c9bfb0] px-4 py-2.5 text-left font-semibold"
          >
            ⚠️ Something feels broken
          </button>
          {ticketType ? (
            <div className="mt-3">
              <textarea
                value={ticketText}
                onChange={(e) => setTicketText(e.target.value)}
                placeholder="What happened?"
                className="min-h-[80px] w-full resize-none rounded-lg border border-[#c9bfb0] px-3 py-2"
              />
              <button
                type="button"
                disabled={!ticketText.trim()}
                onClick={sendTicket}
                className="mt-2 rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Send to support
              </button>
            </div>
          ) : null}
          <p className="mt-3 text-[#6b635a]">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#1e4f4f]">
              {SUPPORT_EMAIL}
            </a>
            {" · "}
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold text-[#1e4f4f]">
              {SUPPORT_PHONE_DISPLAY}
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
