"use client";

import { useEffect, useState } from "react";
import {
  getPrefs,
  savePrefs,
  getVoiceStatus,
  PLAN_LABEL,
  PLAN_VOICE_MINUTES,
  LANGUAGE_OPTIONS,
  REGION_OPTIONS,
  DATE_FORMAT_OPTIONS,
  languageCommunicationSummary,
  hasPendingLanguagePreferences,
  PENDING_LANGUAGE_NOTICE,
  type AiTone,
  type DateFormat,
  type HelpMode,
  type LanguageCode,
  type PatternAwareness,
  type RegionCode,
  type SupportStyle,
  type VisualMode,
  type Plan,
} from "@/lib/companionStore";
import { playChime, unlockChime } from "@/lib/chime";

const TONES: { id: AiTone; label: string; desc: string }[] = [
  { id: "calm", label: "Calm", desc: "Slow, grounding, spacious." },
  { id: "balanced", label: "Balanced", desc: "Warm but direct." },
  { id: "direct", label: "Direct", desc: "Brief and to the point." },
  { id: "minimal", label: "Minimal", desc: "Very few words — just the next step." },
  { id: "gentle", label: "Gentle", desc: "Soft, reassuring, lots of warmth." },
  {
    id: "encouraging",
    label: "Encouraging",
    desc: "Affirming, celebrates small wins.",
  },
  { id: "playful", label: "Playful", desc: "Light, a little humor." },
];

const HELP_MODES: { id: HelpMode; label: string; desc: string }[] = [
  {
    id: "step-by-step",
    label: "Step-by-step guidance",
    desc: "One small step at a time.",
  },
  {
    id: "ask-first",
    label: "Ask me questions first",
    desc: "Clarify before suggesting.",
  },
  { id: "direct", label: "Direct answers", desc: "Lead with the answer." },
  {
    id: "navigate",
    label: "Take me to the right place",
    desc: "Point me to the tool that fits.",
  },
];

const SUPPORT_STYLES: { id: SupportStyle; label: string; desc: string }[] = [
  { id: "solutions", label: "Solutions first", desc: "Just tell me what to do." },
  {
    id: "understand",
    label: "Understand me first",
    desc: "Help me feel understood before fixing it.",
  },
  { id: "balanced", label: "Balanced", desc: "A mix of empathy and action." },
  {
    id: "sos",
    label: "SOS mode",
    desc: "When overwhelmed, help me stabilize before problem-solving.",
  },
];

const PATTERNS: { id: PatternAwareness; label: string; desc: string }[] = [
  { id: "off", label: "Off", desc: "No weekly reflection." },
  { id: "light", label: "Light", desc: "A gentle weekly recap on Momentum." },
  {
    id: "guided",
    label: "Guided",
    desc: "Weekly recap plus a soft suggestion.",
  },
  {
    id: "active",
    label: "Active",
    desc: "More frequent, hands-on insights.",
  },
];

const VISUALS: { id: VisualMode; label: string; desc: string }[] = [
  { id: "off", label: "None", desc: "Clean and minimal — no colors." },
  {
    id: "meaning",
    label: "Meaning-based",
    desc: "Color shows the type of thing.",
  },
  {
    id: "decorative",
    label: "Decorative",
    desc: "Meaning colors + soft tinted surfaces.",
  },
];

type Section =
  | "tone"
  | "help"
  | "support"
  | "language"
  | "notifications"
  | "appearance"
  | "pattern"
  | "plan"
  | "advanced"
  | "connections"
  | "account";

const PLANS: { id: Plan; label: string; desc: string }[] = [
  {
    id: "essential",
    label: "Essential",
    desc: "Everything except voice. Type or talk by text.",
  },
  {
    id: "voice-lite",
    label: "Voice Lite",
    desc: `Talk back & forth with Shari — ${PLAN_VOICE_MINUTES["voice-lite"]} min/month.`,
  },
  {
    id: "voice-pro",
    label: "Voice Pro",
    desc: `More voice conversation — ${PLAN_VOICE_MINUTES["voice-pro"]} min/month.`,
  },
];

type NotifPerm = "granted" | "denied" | "default" | "unsupported";
function readPerm(): NotifPerm {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission as NotifPerm;
}

const CARD =
  "w-full rounded-2xl border bg-white/90 p-4 text-left transition-colors";
const LABEL = "text-sm font-bold uppercase tracking-wide text-[#6b635a]";

export function SettingsPanel({
  registerBack,
}: {
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [open, setOpen] = useState<Section | null>(null);
  const [aiTone, setAiTone] = useState<AiTone>("balanced");
  const [helpMode, setHelpMode] = useState<HelpMode>("ask-first");
  const [supportStyle, setSupportStyle] = useState<SupportStyle>("balanced");
  const [visualMode, setVisualMode] = useState<VisualMode>("off");
  const [pattern, setPattern] = useState<PatternAwareness>("light");
  const [plan, setPlan] = useState<Plan>("essential");
  const [advanced, setAdvanced] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [desktop, setDesktop] = useState(true);
  const [perm, setPerm] = useState<NotifPerm>("default");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fb, setFb] = useState("");
  const [ig, setIg] = useState("");
  const [li, setLi] = useState("");
  const [interfaceLanguage, setInterfaceLanguage] = useState<LanguageCode>("en");
  const [responseLanguage, setResponseLanguage] = useState<LanguageCode>("en");
  const [contentLanguage, setContentLanguage] = useState<LanguageCode>("en");
  const [voiceLanguage, setVoiceLanguage] = useState<LanguageCode>("en");
  const [region, setRegion] = useState<RegionCode>("US");
  const [dateFormat, setDateFormat] = useState<DateFormat>("MM/DD/YYYY");
  const [g, setG] = useState<{
    configured: boolean;
    connected: boolean;
    email: string | null;
  }>({ configured: false, connected: false, email: null });

  function refreshGoogle() {
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((d) => setG(d))
      .catch(() => {});
  }
  useEffect(() => {
    refreshGoogle();
  }, []);

  useEffect(() => {
    const p = getPrefs();
    setAiTone(p.aiTone);
    setHelpMode(p.helpMode);
    setSupportStyle(p.supportStyle);
    setVisualMode(p.visualMode);
    setPattern(p.patternAwareness);
    setPlan(p.plan);
    setAdvanced(p.advancedAiTools);
    setAlerts(p.timeBlockAlerts);
    setDesktop(p.desktopNotifications);
    setName(p.name);
    setEmail(p.email);
    setFb(p.facebookUrl);
    setIg(p.instagramUrl);
    setLi(p.linkedinUrl);
    setInterfaceLanguage(p.interfaceLanguage);
    setResponseLanguage(p.responseLanguage);
    setContentLanguage(p.contentLanguage);
    setVoiceLanguage(p.voiceLanguage);
    setRegion(p.region);
    setDateFormat(p.dateFormat);
    setPerm(readPerm());
  }, []);

  // Global Back closes an open sub-panel first, then exits Settings.
  useEffect(() => {
    registerBack?.(() => {
      if (open !== null) {
        setOpen(null);
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [open, registerBack]);

  function chooseDesktop(wantOn: boolean) {
    if (wantOn && perm === "default" && typeof Notification !== "undefined") {
      Notification.requestPermission()
        .then((p) => {
          setPerm(p as NotifPerm);
          const on = p === "granted";
          setDesktop(on);
          savePrefs({ desktopNotifications: on });
        })
        .catch(() => {});
      return;
    }
    setDesktop(wantOn);
    savePrefs({ desktopNotifications: wantOn });
  }

  const desktopOn = desktop && perm === "granted";

  const ROWS: { id: Section; label: string; value: string }[] = [
    { id: "tone", label: "AI Tone", value: TONES.find((t) => t.id === aiTone)?.label ?? "" },
    { id: "help", label: "Help Mode", value: HELP_MODES.find((h) => h.id === helpMode)?.label ?? "" },
    { id: "support", label: "Support Style", value: SUPPORT_STYLES.find((s) => s.id === supportStyle)?.label ?? "" },
    {
      id: "language",
      label: "Language & Communication",
      value: languageCommunicationSummary({
        interfaceLanguage,
        responseLanguage,
        contentLanguage,
        voiceLanguage,
        region,
        dateFormat,
      }),
    },
    { id: "notifications", label: "Notifications", value: alerts ? "On" : "Off" },
    { id: "appearance", label: "Appearance", value: VISUALS.find((v) => v.id === visualMode)?.label ?? "" },
    { id: "pattern", label: "Pattern awareness", value: PATTERNS.find((p) => p.id === pattern)?.label ?? "" },
    { id: "plan", label: "Plan & voice", value: PLAN_LABEL[plan] },
    { id: "advanced", label: "Advanced AI tools", value: advanced ? "On" : "Off" },
    {
      id: "connections",
      label: "Connections",
      value:
        [fb, ig, li].filter(Boolean).length > 0
          ? `${[fb, ig, li].filter(Boolean).length} linked`
          : "Not set",
    },
    { id: "account", label: "Account", value: name || email || "Not set" },
  ];

  // Reusable selectable list (radio-style cards).
  function Options<T extends string>({
    items,
    current,
    onPick,
  }: {
    items: { id: T; label: string; desc: string }[];
    current: T;
    onPick: (id: T) => void;
  }) {
    return (
      <div className="mt-4 flex flex-col gap-2.5">
        {items.map((it) => {
          const active = it.id === current;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onPick(it.id)}
              className={`${CARD} ${active ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06]" : "border-[#d4cdc3] hover:border-[#1e4f4f]/45"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-[#1f1c19]">
                  {it.label}
                </span>
                {active && <span className="text-[#1e4f4f]">✓</span>}
              </span>
              <span className="mt-0.5 block text-sm text-[#6b635a]">
                {it.desc}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  const header = (title: string) => (
    <>
      <button
        type="button"
        onClick={() => setOpen(null)}
        className="self-start text-sm font-semibold text-[#1e4f4f]"
      >
        ‹ Settings
      </button>
      <p className="mt-2 text-2xl font-semibold text-[#1f1c19]">{title}</p>
    </>
  );

  const wrap = "companion-fade-in mx-auto flex h-full max-w-xl flex-col px-6 py-8";
  const selectCls =
    "mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

  function LanguageField({
    id,
    label,
    hint,
    value,
    onChange,
    options,
    disableUnavailable = false,
  }: {
    id: string;
    label: string;
    hint?: string;
    value: string;
    onChange: (v: string) => void;
    options: readonly { code: string; label: string; available?: boolean }[];
    disableUnavailable?: boolean;
  }) {
    return (
      <div>
        <label className={LABEL} htmlFor={id}>
          {label}
        </label>
        {hint ? <p className="mt-1 text-sm text-[#6b635a]">{hint}</p> : null}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectCls}
        >
          {options.map((o) => {
            const unavailable = o.available === false;
            return (
              <option
                key={o.code}
                value={o.code}
                disabled={disableUnavailable && unavailable}
              >
                {unavailable ? `${o.label} — coming soon` : o.label}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  // ---- Sub-panels ---------------------------------------------------------
  if (open === "tone") {
    return (
      <div className={wrap}>
        {header("AI Tone")}
        <p className="mt-1 text-sm text-[#6b635a]">How Shari sounds.</p>
        <Options
          items={TONES}
          current={aiTone}
          onPick={(v) => {
            setAiTone(v);
            savePrefs({ aiTone: v });
          }}
        />
      </div>
    );
  }
  if (open === "language") {
    function saveLang(patch: Parameters<typeof savePrefs>[0]) {
      const next = savePrefs(patch);
      setInterfaceLanguage(next.interfaceLanguage);
      setResponseLanguage(next.responseLanguage);
      setContentLanguage(next.contentLanguage);
      setVoiceLanguage(next.voiceLanguage);
      setRegion(next.region);
      setDateFormat(next.dateFormat);
    }
    const pendingLang = hasPendingLanguagePreferences({
      interfaceLanguage,
      responseLanguage,
      contentLanguage,
      voiceLanguage,
      region,
      dateFormat,
    });
    return (
      <div className={wrap}>
        {header("Language & Communication")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Choose how your Companion speaks, writes, and formats information.
          More language options will be added over time.
        </p>
        {pendingLang ? (
          <p className="mt-4 rounded-xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.06] px-4 py-3 text-sm leading-snug text-[#1f1c19]">
            {PENDING_LANGUAGE_NOTICE}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-5">
          <LanguageField
            id="lang-interface"
            label="Interface Language"
            hint="App menus and labels. English only until interface translation ships."
            value={interfaceLanguage}
            options={LANGUAGE_OPTIONS}
            disableUnavailable
            onChange={(v) => saveLang({ interfaceLanguage: v as LanguageCode })}
          />
          <LanguageField
            id="lang-response"
            label="Companion Response Language"
            hint="Language Shari will use in chat when available."
            value={responseLanguage}
            options={LANGUAGE_OPTIONS}
            onChange={(v) => saveLang({ responseLanguage: v as LanguageCode })}
          />
          <LanguageField
            id="lang-content"
            label="Content Creation Language"
            hint="Default language for drafts in Create when available."
            value={contentLanguage}
            options={LANGUAGE_OPTIONS}
            onChange={(v) => saveLang({ contentLanguage: v as LanguageCode })}
          />
          <LanguageField
            id="lang-voice"
            label="Voice Language"
            hint="Spoken conversation language when voice support expands."
            value={voiceLanguage}
            options={LANGUAGE_OPTIONS}
            onChange={(v) => saveLang({ voiceLanguage: v as LanguageCode })}
          />
          <LanguageField
            id="lang-region"
            label="Region / Date Format"
            hint="Region for dates and formatting preferences."
            value={region}
            options={REGION_OPTIONS}
            onChange={(v) => saveLang({ region: v as RegionCode })}
          />
          <LanguageField
            id="lang-date"
            label="Date format"
            value={dateFormat}
            options={DATE_FORMAT_OPTIONS}
            onChange={(v) => saveLang({ dateFormat: v as DateFormat })}
          />
        </div>
      </div>
    );
  }
  if (open === "help") {
    return (
      <div className={wrap}>
        {header("Help Mode")}
        <p className="mt-1 text-sm text-[#6b635a]">What Shari does.</p>
        <Options
          items={HELP_MODES}
          current={helpMode}
          onPick={(v) => {
            setHelpMode(v);
            savePrefs({ helpMode: v });
          }}
        />
      </div>
    );
  }
  if (open === "support") {
    return (
      <div className={wrap}>
        {header("Support Style")}
        <p className="mt-1 text-sm text-[#6b635a]">How support feels.</p>
        <Options
          items={SUPPORT_STYLES}
          current={supportStyle}
          onPick={(v) => {
            setSupportStyle(v);
            savePrefs({ supportStyle: v });
          }}
        />
      </div>
    );
  }
  if (open === "appearance") {
    return (
      <div className={wrap}>
        {header("Appearance")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Colors always pair with a label.
        </p>
        <Options
          items={VISUALS}
          current={visualMode}
          onPick={(v) => {
            setVisualMode(v);
            savePrefs({ visualMode: v });
          }}
        />
      </div>
    );
  }
  if (open === "pattern") {
    return (
      <div className={wrap}>
        {header("Pattern awareness")}
        <p className="mt-1 text-sm text-[#6b635a]">
          A gentle weekly reflection on what moved you forward. No scores, no
          judgment — and you can turn it off anytime.
        </p>
        <Options
          items={PATTERNS}
          current={pattern}
          onPick={(v) => {
            setPattern(v);
            savePrefs({ patternAwareness: v });
          }}
        />
      </div>
    );
  }
  if (open === "plan") {
    const vs = getVoiceStatus();
    return (
      <div className={wrap}>
        {header("Plan & voice")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Voice lets you talk back and forth with Shari out loud. It&apos;s part
          of the paid tiers — upgrading from Essential is an add-on.
        </p>
        <Options
          items={PLANS}
          current={plan}
          onPick={(v) => {
            setPlan(v);
            savePrefs({ plan: v });
          }}
        />
        {vs.hasVoice && (
          <p className="mt-3 text-sm text-[#6b635a]">
            Voice this month:{" "}
            <span className="font-semibold text-[#1f1c19]">
              {Math.round(vs.usedMin)} / {vs.capMin} min used
            </span>{" "}
            · {Math.ceil(vs.leftMin)} min left
          </p>
        )}
        <p className="mt-3 rounded-lg bg-[#f3efe8] px-3 py-2 text-xs text-[#9a8f82]">
          Billing &amp; real upgrades are handled separately — this switch is for
          setting up and trying each tier.
        </p>
      </div>
    );
  }
  if (open === "advanced") {
    return (
      <div className={wrap}>
        {header("Advanced AI tools")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Power features for campaigns and testing. Your everyday experience
          stays simple — one active avatar at a time.
        </p>
        <button
          type="button"
          onClick={() => {
            const on = !advanced;
            setAdvanced(on);
            savePrefs({ advancedAiTools: on });
          }}
          className={`${CARD} mt-4 ${advanced ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06]" : "border-[#d4cdc3]"}`}
        >
          <span className="flex items-center justify-between">
            <span className="text-base font-semibold text-[#1f1c19]">
              🧪 Multi-Avatar output mode
            </span>
            <span className="text-[#1e4f4f]">{advanced ? "On ✓" : "Off"}</span>
          </span>
          <span className="mt-0.5 block text-sm text-[#6b635a]">
            Adds a “Generate for all audiences” button to the content generator —
            one tailored version per avatar. For campaigns and A/B testing, not
            daily use.
          </span>
        </button>
      </div>
    );
  }
  if (open === "notifications") {
    return (
      <div className={wrap}>
        {header("Notifications")}
        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              const on = !alerts;
              setAlerts(on);
              savePrefs({ timeBlockAlerts: on });
            }}
            className={`${CARD} ${alerts ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06]" : "border-[#d4cdc3]"}`}
          >
            <span className="flex items-center justify-between">
              <span className="text-base font-semibold text-[#1f1c19]">
                Time block alerts
              </span>
              <span className="text-[#1e4f4f]">{alerts ? "On ✓" : "Off"}</span>
            </span>
            <span className="mt-0.5 block text-sm text-[#6b635a]">
              Popup + chime at start, and 15 min before.
            </span>
          </button>

          <button
            type="button"
            disabled={perm === "denied" || perm === "unsupported"}
            onClick={() => chooseDesktop(!desktopOn)}
            className={`${CARD} disabled:opacity-50 ${desktopOn ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06]" : "border-[#d4cdc3]"}`}
          >
            <span className="flex items-center justify-between">
              <span className="text-base font-semibold text-[#1f1c19]">
                Desktop notifications
              </span>
              <span className="text-[#1e4f4f]">
                {desktopOn ? "On ✓" : "Off"}
              </span>
            </span>
            <span className="mt-0.5 block text-sm text-[#6b635a]">
              System banners in the background.
            </span>
          </button>

          {perm === "denied" && (
            <p className="text-sm text-[#a85c4a]">
              Blocked by your browser — allow Notifications for this page in site
              settings. In-app alerts + chime still work.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              unlockChime();
              playChime();
            }}
            className="mt-2 self-start rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          >
            🔔 Test sound
          </button>
        </div>
      </div>
    );
  }
  if (open === "connections") {
    const field = (
      id: string,
      lbl: string,
      val: string,
      set: (v: string) => void,
      save: (v: string) => void,
      ph: string,
    ) => (
      <div>
        <label className={LABEL} htmlFor={id}>
          {lbl}
        </label>
        <input
          id={id}
          value={val}
          onChange={(e) => {
            set(e.target.value);
            save(e.target.value);
          }}
          placeholder={ph}
          className="mt-1.5 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
      </div>
    );
    return (
      <div className={wrap}>
        {header("Connections")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Connect Google for one-click Docs, and paste your social profile
          links so the export buttons open the right place.
        </p>

        <details className="mt-3 rounded-xl border border-[#d4cdc3] bg-white/85 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-[#1e4f4f]">
            How connecting works
          </summary>
          <div className="mt-2 text-sm leading-relaxed text-[#4b463f]">
            <p>
              <span className="font-semibold">Google:</span> tap{" "}
              <span className="font-semibold">Connect Google</span> below and
              approve access — one connection powers both{" "}
              <span className="font-semibold">📝 Google Docs</span> and{" "}
              <span className="font-semibold">📊 Google Sheets</span>. After
              connecting, those buttons create the file and open it
              automatically.{" "}
              <span className="font-semibold">📅 Calendar</span> opens a
              pre-filled event — no connection needed.
            </p>
            <p className="mt-1.5">
              If you see a &ldquo;Google hasn&apos;t verified this app&rdquo;
              notice, that&apos;s normal while the app is in testing — tap{" "}
              <span className="font-semibold">Advanced → continue</span>. It only
              touches Docs it creates for you.
            </p>
            <p className="mt-1.5">
              <span className="font-semibold">Social:</span> paste your Facebook,
              Instagram, and LinkedIn links below. On a social post, the network
              buttons copy your post and open your page so you can paste it.
            </p>
          </div>
        </details>

        {/* Google account */}
        <div className="mt-4 rounded-xl border border-[#d4cdc3] bg-white/85 p-4">
          <p className="text-base font-semibold text-[#1f1c19]">
            Google account
          </p>
          {!g.configured ? (
            <p className="mt-1 text-sm text-[#6b635a]">
              Not set up yet — add Google OAuth keys (see GOOGLE_SETUP.md) to
              turn on one-click Google Docs. Until then, the Google Docs export
              copies and opens a blank doc to paste into.
            </p>
          ) : g.connected ? (
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#1e4f4f]">
                ✓ Connected{g.email ? ` · ${g.email}` : ""}
              </span>
              <button
                type="button"
                onClick={() =>
                  fetch("/api/google/disconnect", { method: "POST" })
                    .then(() => refreshGoogle())
                    .catch(() => {})
                }
                className="rounded-md px-2.5 py-1 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <a
              href="/api/google/auth"
              className="mt-2 inline-block rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              Connect Google
            </a>
          )}
          <p className="mt-2 text-xs text-[#9a8f82]">
            When connected, the &ldquo;Google Docs&rdquo; export creates the doc
            for you automatically.
          </p>

          {/* Quick links to open your Google apps anytime */}
          <div className="mt-3 border-t border-[#e7dfd4] pt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              Open your Google apps
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: "📅 Calendar", url: "https://calendar.google.com" },
                { label: "📝 Docs", url: "https://docs.google.com" },
                { label: "📊 Sheets", url: "https://sheets.google.com" },
                { label: "📁 Drive", url: "https://drive.google.com" },
              ].map((g) => (
                <a
                  key={g.label}
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[#1e4f4f]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
                >
                  {g.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Social profile links
        </p>
        <div className="mt-2 flex flex-col gap-4">
          {field(
            "conn-fb",
            "Facebook URL",
            fb,
            setFb,
            (v) => savePrefs({ facebookUrl: v }),
            "https://facebook.com/yourpage",
          )}
          {field(
            "conn-ig",
            "Instagram URL",
            ig,
            setIg,
            (v) => savePrefs({ instagramUrl: v }),
            "https://instagram.com/yourhandle",
          )}
          {field(
            "conn-li",
            "LinkedIn URL",
            li,
            setLi,
            (v) => savePrefs({ linkedinUrl: v }),
            "https://linkedin.com/in/you",
          )}
        </div>
        <p className="mt-4 text-sm text-[#9a8f82]">
          Note: posting and Google Docs still work by copy-and-paste for now.
          One-click posting needs connected accounts, which we can add later.
        </p>
      </div>
    );
  }
  if (open === "account") {
    return (
      <div className={wrap}>
        {header("Account")}
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className={LABEL} htmlFor="acct-name">
              Name
            </label>
            <input
              id="acct-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                savePrefs({ name: e.target.value });
              }}
              className="mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              placeholder="What should Shari call you?"
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="acct-email">
              Email
            </label>
            <input
              id="acct-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                savePrefs({ email: e.target.value });
              }}
              className="mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              placeholder="you@example.com"
            />
          </div>
        </div>
      </div>
    );
  }

  // ---- List ---------------------------------------------------------------
  return (
    <div className={wrap}>
      <p className="text-2xl font-semibold text-[#1f1c19]">Settings</p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Tap any item to change it — everything saves automatically.
      </p>
      <div className="mt-6 flex flex-col gap-2.5">
        {ROWS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setOpen(r.id)}
            className={`${CARD} flex items-center justify-between border-[#d4cdc3] hover:border-[#1e4f4f]/45 hover:bg-white`}
          >
            <span className="text-base font-semibold text-[#1f1c19]">
              {r.label}
            </span>
            <span className="flex items-center gap-2 text-sm text-[#6b635a]">
              {r.value}
              <span className="text-[#9a8f82]">›</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
