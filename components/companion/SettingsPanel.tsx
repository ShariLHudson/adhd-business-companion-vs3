"use client";

import { useEffect, useState } from "react";
import {
  MEMBER_CALENDAR_EXTERNAL_URLS,
  readPreferredCalendarProvider,
} from "@/lib/calendar/memberCalendarDestination";
import { compareDropdownLabels, sortByDropdownLabel } from "@/lib/dropdownSort";
import {
  getPrefs,
  savePrefs,
  getVoiceStatus,
  PLAN_LABEL,
  PLAN_VOICE_MINUTES,
  SORTED_DATE_FORMAT_OPTIONS,
  SORTED_LANGUAGE_OPTIONS,
  SORTED_REGION_OPTIONS,
  SORTED_TIME_FORMAT_OPTIONS,
  languageCommunicationSummary,
  type LanguageCode,
  type RegionCode,
  type DateFormat,
  type TimeFormat,
  withUnifiedAppLanguage,
  type AiTone,
  type HelpMode,
  type VisualMode,
  type Plan,
} from "@/lib/companionStore";
import { SupportStylePanel } from "@/components/companion/SupportStylePanel";
import { CuriosityBeforeCommandsPanel } from "@/components/companion/CuriosityBeforeCommandsPanel";
import {
  catalogEntryForStyle,
  getSupportStylePreference,
} from "@/lib/supportStyle";
import {
  CURIOSITY_MODE_OPTIONS,
  getCuriosityBeforeCommandsPreference,
} from "@/lib/curiosityBeforeCommands";
import { useVisualMode } from "@/lib/useVisualMode";
import { useCompanionLanguage } from "@/components/companion/CompanionLanguageProvider";
import { playChime, unlockChime } from "@/lib/chime";
import { NotificationSoundPreferences } from "@/components/companion/NotificationSoundPreferences";
import {
  playNotificationSoundForEvent,
  unlockNotificationSounds,
} from "@/lib/notifications/playNotificationSound";
import { RemindersPanel } from "@/components/companion/RemindersPanel";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { EstateDropdownMenuValueRow } from "@/components/companion/estate/EstateDropdownMenuPrimitives";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import { MENU_LIST_LABEL, MENU_SECTION_HEADING } from "@/lib/menuNavStyles";
import {
  getRecognitionStore,
  saveRecognitionStoreAndNotify,
  syncBirthday,
  syncCelebrationMode,
  PERSONAL_DATE_CATEGORY_OPTIONS,
  PERSONAL_DATE_KIND_OPTIONS,
  type CelebrationMode,
  type PersonalDate,
} from "@/lib/recognition";

import { AI_TONE_GUIDES, aiToneLabel } from "@/lib/aiToneGuide";
import { SettingsConnectionCard } from "@/components/companion/SettingsConnectionCard";
import {
  buildSettingsConnectionCards,
  connectOutlookCalendarLocal,
  disconnectOutlookCalendarLocal,
  isOutlookCalendarConnected,
  type SettingsConnectionId,
} from "@/lib/connections";
import {
  SOCIAL_PROFILE_FIELDS,
  socialProfileOpenHref,
  socialProfileUrlHint,
  type SocialProfilePrefKey,
} from "@/lib/socialProfileUrls";

const HELP_MODES: { id: HelpMode; label: string; desc: string }[] = sortByDropdownLabel(
  [
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
    id: "concise",
    label: "Concise replies",
    desc: "Shorter sentences — still warm.",
  },
  {
    id: "navigate",
    label: "Take me to the right place",
    desc: "Point me to the tool that fits.",
  },
  ],
  (h) => h.label,
);

import { PatternAwarenessPanel } from "@/components/companion/PatternAwarenessPanel";
import { getPatternAwarenessControlPrefs } from "@/lib/patternAwareness";
import { visualModeLabel } from "@/lib/visualColorModes";
import { EstateAudioSettings } from "@/components/companion/estate/EstateAudioSettings";
import { getEstateAudioSettings } from "@/lib/estate/estateAudioSettings";
import { VisualColorModePicker } from "@/components/companion/VisualColorModePicker";
import {
  getDefaultPlanningView,
  PLANNING_VIEW_OPTIONS,
  planningViewLabel,
  setDefaultPlanningView,
  type PlanningViewMode,
} from "@/lib/planMyDay";

type Section =
  | "tone"
  | "help"
  | "support"
  | "curiosity"
  | "language"
  | "notifications"
  | "appearance"
  | "estate-audio"
  | "planning"
  | "celebrations"
  | "pattern"
  | "plan"
  | "advanced"
  | "connections"
  | "account"
  | "new-day";

export type SettingsSection = Section;

const CELEBRATION_MODES: { id: CelebrationMode; label: string; desc: string }[] =
  sortByDropdownLabel(
  [
  {
    id: "full",
    label: "Full celebrations",
    desc: "Warm message plus gentle confetti, candles, or banners.",
  },
  {
    id: "simple",
    label: "Simple celebrations",
    desc: "Just the message — no visual effects.",
  },
  { id: "off", label: "Off", desc: "No celebration prompts." },
  ],
  (c) => c.label,
);

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
const LABEL = MENU_SECTION_HEADING;

export function SettingsPanel({
  registerBack,
  onSignIn,
  initialSection = null,
  onBeginNewDay,
}: {
  registerBack?: (fn: (() => boolean) | null) => void;
  onSignIn?: () => void;
  initialSection?: Section | null;
  /** Shared Global Daily Companion Experience — same controller as menu New Day. */
  onBeginNewDay?: () => void;
}) {
  const { configured: authConfigured, user, signOut } = useCompanionAuth();
  const { t } = useCompanionLanguage();
  const [open, setOpen] = useState<Section | null>(initialSection);

  useEffect(() => {
    if (initialSection) setOpen(initialSection);
  }, [initialSection]);
  const [aiTone, setAiTone] = useState<AiTone>("balanced");
  const [helpMode, setHelpMode] = useState<HelpMode>("ask-first");
  const [supportStyleSummary, setSupportStyleSummary] = useState("Adaptive");
  const [curiositySummary, setCuriositySummary] = useState(
    "Ask based on the situation",
  );
  const visualMode = useVisualMode();
  const [patternSummary, setPatternSummary] = useState("On");
  const [planningView, setPlanningView] = useState<PlanningViewMode>("list");
  const [planningSavedFlash, setPlanningSavedFlash] = useState(false);
  const [plan, setPlan] = useState<Plan>("essential");
  const [advanced, setAdvanced] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [desktop, setDesktop] = useState(true);
  const [perm, setPerm] = useState<NotifPerm>("default");
  const [socialUrls, setSocialUrls] = useState<
    Record<SocialProfilePrefKey, string>
  >({
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    tiktokUrl: "",
    pinterestUrl: "",
  });
  const [interfaceLanguage, setInterfaceLanguage] = useState<LanguageCode>("en");
  const [responseLanguage, setResponseLanguage] = useState<LanguageCode>("en");
  const [contentLanguage, setContentLanguage] = useState<LanguageCode>("en");
  const [voiceLanguage, setVoiceLanguage] = useState<LanguageCode>("en");
  const [region, setRegion] = useState<RegionCode>("US");
  const [dateFormat, setDateFormat] = useState<DateFormat>("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");
  const [g, setG] = useState<{
    configured: boolean;
    connected: boolean;
    email: string | null;
  }>({ configured: false, connected: false, email: null });
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [managingConnectionId, setManagingConnectionId] =
    useState<SettingsConnectionId | null>(null);
  const [celebrationMode, setCelebrationMode] =
    useState<CelebrationMode>("full");
  const [birthdayMonth, setBirthdayMonth] = useState<number | "">("");
  const [birthdayDay, setBirthdayDay] = useState<number | "">("");
  const [birthdayYear, setBirthdayYear] = useState<number | "">("");
  const [personalDates, setPersonalDates] = useState<PersonalDate[]>([]);

  function refreshGoogle() {
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((d) => setG(d))
      .catch(() => {});
  }
  function refreshOutlook() {
    setOutlookConnected(isOutlookCalendarConnected());
  }
  useEffect(() => {
    refreshGoogle();
    refreshOutlook();
    const syncOutlook = () => refreshOutlook();
    window.addEventListener("companion-outlook-calendar-updated", syncOutlook);
    return () =>
      window.removeEventListener(
        "companion-outlook-calendar-updated",
        syncOutlook,
      );
  }, []);

  useEffect(() => {
    const p = getPrefs();
    setAiTone(p.aiTone);
    setHelpMode(p.helpMode);
    {
      const support = getSupportStylePreference();
      setSupportStyleSummary(catalogEntryForStyle(support.styleId).label);
      const curiosity = getCuriosityBeforeCommandsPreference();
      setCuriositySummary(
        CURIOSITY_MODE_OPTIONS.find((o) => o.id === curiosity.mode)?.label ??
          "Ask based on the situation",
      );
    }
    {
      const pa = getPatternAwarenessControlPrefs();
      if (!pa.noticeNewPatterns && !pa.useSavedPatterns) {
        setPatternSummary("Off");
      } else if (pa.noticeNewPatterns && pa.useSavedPatterns) {
        setPatternSummary("Noticing & using");
      } else if (pa.useSavedPatterns) {
        setPatternSummary("Using saved");
      } else {
        setPatternSummary("Noticing only");
      }
    }
    setPlanningView(getDefaultPlanningView() ?? "list");
    setPlan(p.plan);
    setAdvanced(p.advancedAiTools);
    setAlerts(p.timeBlockAlerts);
    setDesktop(p.desktopNotifications);
    setSocialUrls({
      facebookUrl: p.facebookUrl ?? "",
      instagramUrl: p.instagramUrl ?? "",
      linkedinUrl: p.linkedinUrl ?? "",
      tiktokUrl: p.tiktokUrl ?? "",
      pinterestUrl: p.pinterestUrl ?? "",
    });
    setInterfaceLanguage(p.interfaceLanguage);
    setResponseLanguage(p.responseLanguage);
    setContentLanguage(p.contentLanguage);
    setVoiceLanguage(p.voiceLanguage);
    setRegion(p.region);
    setDateFormat(p.dateFormat);
    setTimeFormat(p.timeFormat);
    setPerm(readPerm());
    const rec = getRecognitionStore();
    setCelebrationMode(rec.celebrationMode);
    setBirthdayMonth(rec.birthday?.month ?? "");
    setBirthdayDay(rec.birthday?.day ?? "");
    setBirthdayYear(rec.birthday?.year ?? "");
    setPersonalDates(rec.personalDates);
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
    { id: "tone", label: "Conversation Style", value: aiToneLabel(aiTone) },
    { id: "help", label: "Help Mode", value: HELP_MODES.find((h) => h.id === helpMode)?.label ?? "" },
    { id: "support", label: "Support Style", value: supportStyleSummary },
    {
      id: "curiosity",
      label: "Curiosity Before Commands",
      value: curiositySummary,
    },
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
        timeFormat,
      }),
    },
    { id: "notifications", label: "Notifications", value: alerts ? "On" : "Off" },
    { id: "appearance", label: "Appearance", value: visualModeLabel(visualMode) },
    {
      id: "estate-audio",
      label: "Estate sound",
      value: getEstateAudioSettings().silenced
        ? "Silenced"
        : getEstateAudioSettings().ambienceEnabled
          ? "Ambience on"
          : "Ambience off",
    },
    {
      id: "planning",
      label: "Planning",
      value: planningViewLabel(planningView),
    },
    {
      id: "celebrations",
      label: "Celebrations",
      value:
        CELEBRATION_MODES.find((c) => c.id === celebrationMode)?.label ?? "",
    },
    { id: "pattern", label: "Pattern Awareness", value: patternSummary },
    { id: "plan", label: "Plan & voice", value: PLAN_LABEL[plan] },
    { id: "advanced", label: "Advanced AI tools", value: advanced ? "On" : "Off" },
    {
      id: "connections",
      label: "Connections",
      value: (() => {
        const linked = Object.values(socialUrls).filter((v) => v.trim()).length;
        return linked > 0 ? `${linked} linked` : "Not set";
      })(),
    },
    {
      id: "account",
      label: "Sign-in & security",
      value: user?.email ?? (authConfigured ? "Not signed in" : "Not set"),
    },
    ...(onBeginNewDay
      ? [
          {
            id: "new-day" as const,
            label: "New Day",
            value: "Fresh start",
          },
        ]
      : []),
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
                <span className={MENU_LIST_LABEL}>
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
        className="settings-panel__back self-start text-sm font-semibold"
      >
        ‹ Settings
      </button>
      <p className="settings-panel__title mt-2 text-2xl font-semibold">{title}</p>
    </>
  );

  const wrap = `${workspacePanelShellClass({ width: "standard" })} settings-panel companion-fade-in mx-auto flex h-full max-w-xl flex-col`;
  const selectCls =
    "mt-2 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

  function LanguageField({
    id,
    label,
    hint,
    value,
    onChange,
    options,
  }: {
    id: string;
    label: string;
    hint?: string;
    value: string;
    onChange: (v: string) => void;
    options: readonly { code: string; label: string }[];
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
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // ---- Sub-panels ---------------------------------------------------------
  if (open === "tone") {
    return (
      <div className={wrap}>
        {header("Conversation Style")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Choose how you&apos;d generally like me to communicate with you. This
          is a long-term preference — it changes my delivery, not who I am.
        </p>
        <p className="mt-2 text-sm text-[#6b635a]">
          If today is different, simply tell me — or update Today&apos;s Reality
          — and I&apos;ll adapt to how you&apos;re doing today.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {AI_TONE_GUIDES.map((tone) => {
            const active = aiTone === tone.id;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => {
                  setAiTone(tone.id);
                  savePrefs({ aiTone: tone.id });
                }}
                className={`${CARD} ${
                  active
                    ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06]"
                    : "border-[#d4cdc3] hover:border-[#1e4f4f]/45"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={MENU_LIST_LABEL}>
                    {tone.label}
                  </span>
                  {active ? <span className="text-[#1e4f4f]">✓</span> : null}
                </span>
                <span className="mt-0.5 block text-sm text-[#6b635a]">
                  {tone.desc}
                </span>
                <span className="mt-2 block text-sm text-[#4b463f]">
                  <strong>Feels like:</strong> {tone.feelsLike}
                </span>
                <span className="mt-1 block text-sm text-[#4b463f]">
                  <strong>Best for:</strong> {tone.bestFor}
                </span>
                <span className="mt-1 block text-sm text-[#4b463f]">
                  <strong>What changes:</strong> {tone.whatChanges}
                </span>
                <span className="mt-2 block text-sm italic text-[#6b635a]">
                  {tone.example}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  if (open === "language") {
    function saveLang(patch: Parameters<typeof savePrefs>[0]) {
      const langKey = (
        [
          "interfaceLanguage",
          "responseLanguage",
          "contentLanguage",
          "voiceLanguage",
        ] as const
      ).find((key) => key in (patch ?? {}));
      const unified =
        langKey && patch && patch[langKey]
          ? withUnifiedAppLanguage(patch[langKey] as LanguageCode, patch)
          : patch;
      const next = savePrefs(unified);
      setInterfaceLanguage(next.interfaceLanguage);
      setResponseLanguage(next.responseLanguage);
      setContentLanguage(next.contentLanguage);
      setVoiceLanguage(next.voiceLanguage);
      setRegion(next.region);
      setDateFormat(next.dateFormat);
      setTimeFormat(next.timeFormat);
    }
    return (
      <div className={wrap}>
        {header(t("settings.language"))}
        <p className="mt-1 text-sm text-[#6b635a]">{t("settings.languageHint")}</p>
        <div className="mt-6 flex flex-col gap-5">
          <LanguageField
            id="lang-response"
            label={t("settings.companionResponseLanguage")}
            hint="Sets interface, chat, content, and voice together."
            value={responseLanguage}
            options={SORTED_LANGUAGE_OPTIONS}
            onChange={(v) => saveLang({ responseLanguage: v as LanguageCode })}
          />
          <LanguageField
            id="lang-interface"
            label={t("settings.interfaceLanguage")}
            value={interfaceLanguage}
            options={SORTED_LANGUAGE_OPTIONS}
            onChange={(v) => saveLang({ interfaceLanguage: v as LanguageCode })}
          />
          <LanguageField
            id="lang-content"
            label={t("settings.contentLanguage")}
            value={contentLanguage}
            options={SORTED_LANGUAGE_OPTIONS}
            onChange={(v) => saveLang({ contentLanguage: v as LanguageCode })}
          />
          <LanguageField
            id="lang-voice"
            label={t("settings.voiceLanguage")}
            value={voiceLanguage}
            options={SORTED_LANGUAGE_OPTIONS}
            onChange={(v) => saveLang({ voiceLanguage: v as LanguageCode })}
          />
          <LanguageField
            id="lang-region"
            label="Region / Date Format"
            hint="Region for dates and formatting preferences."
            value={region}
            options={SORTED_REGION_OPTIONS}
            onChange={(v) => saveLang({ region: v as RegionCode })}
          />
          <LanguageField
            id="lang-date"
            label="Date format"
            value={dateFormat}
            options={SORTED_DATE_FORMAT_OPTIONS}
            onChange={(v) => saveLang({ dateFormat: v as DateFormat })}
          />
          <LanguageField
            id="lang-time"
            label="Time format"
            hint="How times appear across Spark — 12-hour or 24-hour military time."
            value={timeFormat}
            options={SORTED_TIME_FORMAT_OPTIONS}
            onChange={(v) => saveLang({ timeFormat: v as TimeFormat })}
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
      <div className={wrap} data-testid="settings-support-style">
        {header("Support Style")}
        <div className="mt-3">
          <SupportStylePanel />
        </div>
      </div>
    );
  }
  if (open === "curiosity") {
    return (
      <div className={wrap} data-testid="settings-curiosity-before-commands">
        {header("Curiosity Before Commands")}
        <div className="mt-3">
          <CuriosityBeforeCommandsPanel />
        </div>
      </div>
    );
  }
  if (open === "appearance") {
    return (
      <div className={wrap}>
        {header("Appearance")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Choose how color appears across the app. Pick a mode, preview it, then save.
        </p>
        <VisualColorModePicker
          current={visualMode}
          onSave={(v) => {
            savePrefs({ visualMode: v });
          }}
        />
      </div>
    );
  }
  if (open === "estate-audio") {
    return (
      <div className={wrap}>
        {header("Estate sound")}
        <EstateAudioSettings className="mt-3" />
      </div>
    );
  }
  if (open === "planning") {
    return (
      <div className={wrap}>
        {header("Planning")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Choose how Plan My Day opens by default. You can switch views anytime.
        </p>
        <p className={`${LABEL} mt-4`}>Default planning view</p>
        <Options
          items={PLANNING_VIEW_OPTIONS}
          current={planningView}
          onPick={(v) => {
            setPlanningView(v);
            setDefaultPlanningView(v);
            setPlanningSavedFlash(true);
            window.setTimeout(() => setPlanningSavedFlash(false), 2200);
          }}
        />
        {planningSavedFlash ? (
          <p
            className="mt-3 text-center text-sm font-semibold text-[#1e4f4f]"
            role="status"
            aria-live="polite"
            data-testid="planning-view-saved"
          >
            Saved — Plan My Day will use {planningViewLabel(planningView)}.
          </p>
        ) : null}
      </div>
    );
  }
  if (open === "celebrations") {
    function saveBirthday(
      month: number | "",
      day: number | "",
      year: number | "" = birthdayYear,
    ) {
      const b =
        month && day
          ? {
              month: Number(month),
              day: Number(day),
              ...(year ? { year: Number(year) } : {}),
            }
          : null;
      setBirthdayMonth(month);
      setBirthdayDay(day);
      setBirthdayYear(year);
      syncBirthday(b);
    }

    function addPersonalDate() {
      const id = `pd-${Date.now()}`;
      const next: PersonalDate = {
        id,
        label: "Important date",
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        kind: "custom",
        category: "personal",
      };
      const dates = [...personalDates, next];
      setPersonalDates(dates);
      saveRecognitionStoreAndNotify({ personalDates: dates });
    }

    function updatePersonalDate(id: string, patch: Partial<PersonalDate>) {
      const dates = personalDates.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      );
      setPersonalDates(dates);
      saveRecognitionStoreAndNotify({ personalDates: dates });
    }

    function removePersonalDate(id: string) {
      const dates = personalDates.filter((d) => d.id !== id);
      setPersonalDates(dates);
      saveRecognitionStoreAndNotify({ personalDates: dates });
    }

    return (
      <div className={wrap}>
        {header("Celebrations")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Warm recognition for birthdays and milestones — never guilt, streaks, or
          pressure to return.
        </p>
        <Options
          items={CELEBRATION_MODES}
          current={celebrationMode}
          onPick={(v) => {
            setCelebrationMode(v);
            syncCelebrationMode(v);
          }}
        />

        <div className="mt-6">
          <p className={LABEL}>Your birthday</p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Optional — used for a thoughtful birthday note, not marketing.
          </p>
          <div className="mt-2 flex gap-2">
            <select
              value={birthdayMonth}
              onChange={(e) =>
                saveBirthday(
                  e.target.value ? Number(e.target.value) : "",
                  birthdayDay,
                )
              }
              className={selectCls}
              aria-label="Birthday month"
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={birthdayDay}
              onChange={(e) =>
                saveBirthday(
                  birthdayMonth,
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              className={selectCls}
              aria-label="Birthday day"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1900}
              max={2100}
              value={birthdayYear}
              onChange={(e) =>
                saveBirthday(
                  birthdayMonth,
                  birthdayDay,
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              placeholder="Year (optional)"
              className="w-28 rounded-lg border border-[#c9bfb0] bg-white px-2 py-2.5 text-sm"
              aria-label="Birthday year"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-2">
            <p className={LABEL}>Important dates</p>
            <button
              type="button"
              onClick={addPersonalDate}
              className="text-sm font-semibold text-[#1e4f4f]"
            >
              + Add
            </button>
          </div>
          <p className="mt-1 text-sm text-[#6b635a]">
            Anniversaries, vacations, or any date you want remembered.
          </p>
          {personalDates.length === 0 ? (
            <p className="mt-3 text-sm text-[#9a8f82]">None saved yet.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {personalDates.map((pd) => (
                <div
                  key={pd.id}
                  className="rounded-xl border border-[#d4cdc3] bg-white/85 p-3"
                >
                  <input
                    type="text"
                    value={pd.label}
                    onChange={(e) =>
                      updatePersonalDate(pd.id, { label: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#c9bfb0] px-3 py-2 text-sm"
                    placeholder="Label"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      value={pd.category ?? "personal"}
                      onChange={(e) =>
                        updatePersonalDate(pd.id, {
                          category: e.target.value as PersonalDate["category"],
                        })
                      }
                      className="rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm"
                    >
                      {PERSONAL_DATE_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={pd.kind}
                      onChange={(e) =>
                        updatePersonalDate(pd.id, {
                          kind: e.target.value as PersonalDate["kind"],
                        })
                      }
                      className="rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm"
                    >
                      {PERSONAL_DATE_KIND_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {pd.kind === "vacation" ||
                    pd.kind === "launch" ||
                    pd.kind === "due_date" ? (
                      <input
                        type="date"
                        value={pd.targetDate?.slice(0, 10) ?? ""}
                        onChange={(e) =>
                          updatePersonalDate(pd.id, {
                            targetDate: e.target.value,
                          })
                        }
                        className="rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm"
                      />
                    ) : (
                      <>
                        <select
                          value={pd.month}
                          onChange={(e) =>
                            updatePersonalDate(pd.id, {
                              month: Number(e.target.value),
                            })
                          }
                          className="rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm"
                        >
                          {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <select
                          value={pd.day}
                          onChange={(e) =>
                            updatePersonalDate(pd.id, {
                              day: Number(e.target.value),
                            })
                          }
                          className="rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ),
                          )}
                        </select>
                        <input
                          type="number"
                          min={1900}
                          max={2100}
                          value={pd.year ?? ""}
                          onChange={(e) =>
                            updatePersonalDate(pd.id, {
                              year: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="Year"
                          className="w-24 rounded-lg border border-[#c9bfb0] px-2 py-1.5 text-sm"
                        />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removePersonalDate(pd.id)}
                      className="text-sm font-semibold text-[#a85c4a]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (open === "pattern") {
    return (
      <div className={wrap} data-testid="settings-pattern-awareness">
        {header("Pattern Awareness")}
        <div className="mt-3">
          <PatternAwarenessPanel />
        </div>
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
            <span className={MENU_LIST_LABEL}>
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
              <span className={MENU_LIST_LABEL}>
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
              <span className={MENU_LIST_LABEL}>
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
              unlockNotificationSounds();
              unlockChime();
              const played = playNotificationSoundForEvent("test");
              if (!played) playChime();
            }}
            className="mt-2 self-start rounded-xl border-2 border-[#1e4f4f] bg-white px-5 py-2.5 text-base font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          >
            Test reminder sound
          </button>

          <div className="mt-4">
            <NotificationSoundPreferences />
          </div>

          <RemindersPanel />
          <p className="mt-3 text-sm text-[#6b635a]">
            Edit rhythms and quiet hours under Plan My Day → Rhythms. Time block
            alerts use the Reminder sound above. Desktop notifications can stay
            on even when a sound category is set to None.
          </p>
        </div>
      </div>
    );
  }
  if (open === "connections") {
    const connectionCards = buildSettingsConnectionCards({
      google: g,
      outlookConnected,
      googleAuthHref: "/api/google/auth?returnTo=/companion?settings=connections",
    });

    return (
      <div className={wrap} data-testid="settings-connections">
        {header("Connections")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Connect the calendars and Google services Spark uses today — and
          prepare Outlook Calendar for when you&apos;re ready.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {connectionCards.map((card) => (
            <div key={card.id}>
              <SettingsConnectionCard
                card={card}
                onConnectOutlook={() => {
                  connectOutlookCalendarLocal();
                  refreshOutlook();
                  setManagingConnectionId(null);
                }}
                onManageGoogle={() =>
                  setManagingConnectionId((current) =>
                    current === card.id ? null : card.id,
                  )
                }
                onManageOutlook={() =>
                  setManagingConnectionId((current) =>
                    current === card.id ? null : card.id,
                  )
                }
              />
              {managingConnectionId === card.id && card.status === "connected" ? (
                <div
                  className="mt-2 rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-4 py-3"
                  data-testid={`settings-connection-manage-panel-${card.id}`}
                >
                  {card.kind === "google" ? (
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="/api/google/auth?returnTo=/companion?settings=connections"
                        className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                      >
                        Reconnect
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          fetch("/api/google/disconnect", { method: "POST" })
                            .then(() => {
                              refreshGoogle();
                              setManagingConnectionId(null);
                            })
                            .catch(() => {})
                        }
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-[#6b635a]">
                        Outlook Calendar is prepared in Spark. Microsoft Graph
                        sync will plug into this same connection when it&apos;s
                        ready — no second calendar system.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          disconnectOutlookCalendarLocal();
                          refreshOutlook();
                          setManagingConnectionId(null);
                        }}
                        className="self-start rounded-lg px-4 py-2 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/70 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Shortcuts — open in your browser
          </p>
          <p className="mt-1 text-xs text-[#9a8f82]">
            These open the service; they don&apos;t change your Spark connection.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              {
                label: "My Calendar",
                url:
                  readPreferredCalendarProvider() === "outlook"
                    ? MEMBER_CALENDAR_EXTERNAL_URLS.outlook
                    : MEMBER_CALENDAR_EXTERNAL_URLS.google,
              },
              { label: "Docs", url: "https://docs.google.com" },
              { label: "Drive", url: "https://drive.google.com" },
              {
                label: "Outlook Calendar",
                url: MEMBER_CALENDAR_EXTERNAL_URLS.outlook,
              },
              {
                label: "Google Calendar",
                url: MEMBER_CALENDAR_EXTERNAL_URLS.google,
              },
            ].map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#1e4f4f]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-5 text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Social profile links
        </p>
        <div className="mt-2 flex flex-col gap-4">
          {SOCIAL_PROFILE_FIELDS.map((platform) => {
            const value = socialUrls[platform.prefKey] ?? "";
            const openHref = socialProfileOpenHref(value);
            const hint = socialProfileUrlHint(platform.id, value);
            return (
              <div key={platform.id} data-testid={`social-profile-${platform.id}`}>
                <label className={LABEL} htmlFor={`conn-${platform.id}`}>
                  {platform.label}
                </label>
                <input
                  id={`conn-${platform.id}`}
                  value={value}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSocialUrls((prev) => ({
                      ...prev,
                      [platform.prefKey]: next,
                    }));
                    savePrefs({ [platform.prefKey]: next });
                  }}
                  placeholder={platform.placeholder}
                  className="mt-1.5 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                  data-testid={`social-profile-input-${platform.id}`}
                />
                {hint ? (
                  <p
                    className="mt-1 text-xs text-[#6b635a]"
                    data-testid={`social-profile-hint-${platform.id}`}
                  >
                    {hint}
                  </p>
                ) : null}
                {value.trim() ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {openHref ? (
                      <a
                        href={openHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-[#1e4f4f]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
                        data-testid={`social-profile-open-${platform.id}`}
                      >
                        {platform.openLabel}
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setSocialUrls((prev) => ({
                          ...prev,
                          [platform.prefKey]: "",
                        }));
                        savePrefs({ [platform.prefKey]: "" });
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
                      data-testid={`social-profile-clear-${platform.id}`}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-[#9a8f82]">
          Social posts use copy-and-paste: the app copies your text and opens
          your profile page so you can paste it there.
        </p>
      </div>
    );
  }
  if (open === "account") {
    return (
      <div className={wrap}>
        {header("Sign-in & security")}
        <p className="mt-1 text-sm text-[#6b635a]">
          Sign in, sign out, and manage access. Name and email live in Profile.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {authConfigured ? (
            <div className="rounded-lg border border-[#e7dfd4] bg-[#faf7f2] px-3 py-2.5 text-sm text-[#4b463f]">
              {user ? (
                <>
                  Signed in as <strong>{user.email ?? "your account"}</strong>
                </>
              ) : (
                <>Sign in to save your account across devices.</>
              )}
            </div>
          ) : null}
          {authConfigured && onSignIn ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSignIn}
                className="settings-panel__btn settings-panel__btn--primary rounded-xl border border-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
              >
                {user ? "Your account" : "Sign in"}
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="settings-panel__btn settings-panel__btn--secondary rounded-xl border border-[#c9bfb0] px-5 py-2.5 text-sm font-semibold text-[#3d3630] hover:bg-[#f0f5f5]"
                >
                  Log out
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ---- List ---------------------------------------------------------------
  return (
    <div className={`${wrap} settings-panel--menu`}>
      <p className="settings-panel__heading text-2xl font-semibold">Settings</p>
      <p className="settings-panel__subheading mt-1 text-sm">
        How the app behaves — language, appearance, notifications, and more.
      </p>
      <WorkspaceAreaWorksGuide areaId="settings" />
      <div
        className="estate-room-experience-menu__panel estate-room-experience-menu__panel--backdrop settings-menu-panel mt-4"
        role="menu"
        aria-label="Settings"
      >
        <div className="settings-menu-list estate-room-experience-menu__panel-scroll">
          {[...ROWS]
            .sort((a, b) => compareDropdownLabels(a.label, b.label))
            .map((r) => (
              <EstateDropdownMenuValueRow
                key={r.id}
                label={r.label}
                value={r.value}
                testId={`settings-row-${r.id}`}
                onClick={() => {
                  if (r.id === "new-day") {
                    // Click is permission — shared daily-opening controller, no confirm.
                    onBeginNewDay?.();
                    return;
                  }
                  setOpen(r.id);
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
