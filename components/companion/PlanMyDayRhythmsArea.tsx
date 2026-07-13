"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RHYTHM_CADENCE_OPTIONS,
  RHYTHM_PROFILES,
  activateRhythmProfile,
  acceptRhythmSuggestion,
  createMemberRhythm,
  dismissRhythmSuggestion,
  getRhythmPrefs,
  listMemberRhythms,
  listRhythmSuggestions,
  neverSuggestAgain,
  pauseRhythm,
  previewProfileRhythms,
  resumeRhythm,
  saveRhythmPrefs,
  setDayCondition,
  type DayCondition,
  type MemberRhythm,
  type RhythmCadence,
  type RhythmProfileId,
  type RhythmSuggestion,
} from "@/lib/rhythms";
import { getUpcomingReminders, type Reminder } from "@/lib/reminderStore";
import { PLANNING_CENTER_AREA_META } from "@/lib/planMyDay/planningCenter";

const FIELD =
  "mt-1 w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

type RhythmsTab =
  | "today"
  | "all"
  | "reminders"
  | "suggested"
  | "templates"
  | "profiles"
  | "settings";

const TABS: { id: RhythmsTab; label: string }[] = [
  { id: "today", label: "Today's Rhythms" },
  { id: "all", label: "All Rhythms" },
  { id: "reminders", label: "Reminders" },
  { id: "suggested", label: "Suggested" },
  { id: "templates", label: "Templates" },
  { id: "profiles", label: "Profiles" },
  { id: "settings", label: "Settings" },
];

function isDueToday(r: MemberRhythm, now = new Date()): boolean {
  if (r.status !== "active" || !r.nextDueAt) return false;
  const due = new Date(r.nextDueAt);
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  );
}

/**
 * Rhythms home — Adaptive Rhythms surface inside Plan My Day.
 */
export function PlanMyDayRhythmsArea({
  initialTab,
}: {
  initialTab?: RhythmsTab;
} = {}) {
  const [tab, setTab] = useState<RhythmsTab>(initialTab ?? "today");
  const [rhythms, setRhythms] = useState<MemberRhythm[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [suggestions, setSuggestions] = useState<RhythmSuggestion[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [cadence, setCadence] = useState<RhythmCadence>("weekly");
  const [details, setDetails] = useState("");
  const [profileId, setProfileId] = useState<RhythmProfileId>("gentle_companion");
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [includeHealth, setIncludeHealth] = useState(false);
  const [prefsTick, setPrefsTick] = useState(0);

  function refresh() {
    setRhythms(listMemberRhythms());
    setReminders(getUpcomingReminders());
    setSuggestions(listRhythmSuggestions("pending"));
    setPrefsTick((n) => n + 1);
  }

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("companion-rhythms-updated", onUpdate);
    window.addEventListener("companion-reminders-updated", onUpdate);
    window.addEventListener("companion-rhythm-suggestions-updated", onUpdate);
    window.addEventListener("companion-rhythm-prefs-updated", onUpdate);
    return () => {
      window.removeEventListener("companion-rhythms-updated", onUpdate);
      window.removeEventListener("companion-reminders-updated", onUpdate);
      window.removeEventListener("companion-rhythm-suggestions-updated", onUpdate);
      window.removeEventListener("companion-rhythm-prefs-updated", onUpdate);
    };
  }, []);

  const todays = useMemo(
    () => rhythms.filter((r) => isDueToday(r) || (r.status === "active" && !r.nextDueAt)),
    [rhythms],
  );

  const grouped = useMemo(() => {
    return RHYTHM_CADENCE_OPTIONS.map((opt) => ({
      ...opt,
      items: rhythms.filter((r) => r.cadence === opt.id && r.status !== "archived"),
    }));
  }, [rhythms]);

  const preview = useMemo(
    () => previewProfileRhythms(profileId, { includeHealth }),
    [profileId, includeHealth],
  );

  useEffect(() => {
    setSelectedTitles(preview.map((t) => t.title));
  }, [preview]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createMemberRhythm({
      title: trimmed,
      cadence,
      details: details.trim() || undefined,
      source: "user",
    });
    setTitle("");
    setDetails("");
    setCadence("weekly");
    setAdding(false);
    refresh();
  }

  const prefs = getRhythmPrefs();
  void prefsTick;

  return (
    <div className="mt-4 flex flex-col gap-5" data-testid="plan-area-rhythms-panel">
      <div>
        <h2 className="text-xl font-semibold text-[#1f1c19]">
          {PLANNING_CENTER_AREA_META.rhythms.label}
        </h2>
        <p className="mt-1 text-base text-[#6b635a]">
          Remember, begin, and return — without pressure.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Rhythms sections"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              tab === t.id
                ? "bg-[#1e4f4f] text-white"
                : "bg-[#f0ebe3] text-[#3d3832] hover:bg-[#e7dfd4]"
            }`}
            data-testid={`rhythms-tab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "today" ? (
        <section>
          {todays.length === 0 ? (
            <p className="text-base text-[#6b635a]">
              Nothing due today. When a rhythm is ready, it will show up here gently.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {todays.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2] p-4"
                >
                  <p className="text-lg font-semibold text-[#1f1c19]">{r.title}</p>
                  <p className="mt-1 text-sm text-[#6b635a]">
                    {r.category} · {r.window}
                    {r.nextDueAt
                      ? ` · ${new Date(r.nextDueAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                      : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.status === "active" ? (
                      <button
                        type="button"
                        className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-sm"
                        onClick={() => {
                          pauseRhythm(r.id);
                          refresh();
                        }}
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-sm"
                        onClick={() => {
                          resumeRhythm(r.id);
                          refresh();
                        }}
                      >
                        Resume
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "all" ? (
        <section>
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="companion-btn-primary self-start rounded-xl px-4 py-2.5 text-sm font-semibold"
              data-testid="plan-rhythms-add"
            >
              Add a rhythm
            </button>
          ) : (
            <form
              onSubmit={handleAdd}
              className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2] p-4"
            >
              <label className="block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                What repeats?
                <input
                  className={FIELD}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Client check-in, invoices, weekly review…"
                  autoFocus
                  data-testid="plan-rhythms-title"
                />
              </label>
              <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                Cadence
                <select
                  className={FIELD}
                  value={cadence}
                  onChange={(e) => setCadence(e.target.value as RhythmCadence)}
                  data-testid="plan-rhythms-cadence"
                >
                  {RHYTHM_CADENCE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
                Notes
                <textarea
                  className={FIELD}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={2}
                />
              </label>
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  className="companion-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="rounded-xl px-4 py-2 text-sm"
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 flex flex-col gap-4">
            {grouped.map((g) =>
              g.items.length ? (
                <div key={g.id}>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
                    {g.label}
                  </h3>
                  <ul className="mt-2 flex flex-col gap-2">
                    {g.items.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-lg border border-[#e7dfd4] bg-white px-3 py-2"
                      >
                        <span className="font-medium text-[#1f1c19]">{r.title}</span>
                        <span className="ml-2 text-sm text-[#6b635a]">
                          {r.status === "paused" ? "(paused)" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      {tab === "reminders" ? (
        <section>
          {reminders.length === 0 ? (
            <p className="text-base text-[#6b635a]">No upcoming reminders.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-[#e7dfd4] bg-white px-3 py-2"
                >
                  <p className="font-medium text-[#1f1c19]">{r.title}</p>
                  <p className="text-sm text-[#6b635a]">
                    {r.scheduledAt
                      ? new Date(r.scheduledAt).toLocaleString()
                      : "Unscheduled"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "suggested" ? (
        <section>
          {suggestions.length === 0 ? (
            <p className="text-base text-[#6b635a]">
              No suggestions right now. When a pattern shows up, I&apos;ll ask before adding anything.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2] p-4"
                >
                  <p className="text-lg font-semibold text-[#1f1c19]">{s.title}</p>
                  <p className="mt-1 text-base text-[#6b635a]">{s.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="companion-btn-primary rounded-lg px-3 py-1.5 text-sm font-semibold"
                      onClick={() => {
                        acceptRhythmSuggestion(s.id);
                        refresh();
                      }}
                    >
                      Add it
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#d4cdc3] px-3 py-1.5 text-sm"
                      onClick={() => {
                        dismissRhythmSuggestion(s.id);
                        refresh();
                      }}
                    >
                      Not now
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-sm text-[#6b635a]"
                      onClick={() => {
                        neverSuggestAgain(s.id);
                        refresh();
                      }}
                    >
                      Don&apos;t suggest this again
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "templates" || tab === "profiles" ? (
        <section className="flex flex-col gap-4">
          <p className="text-base text-[#6b635a]">
            Choose a profile, review what would be added, then activate only what you want.
          </p>
          <div className="flex flex-wrap gap-2">
            {RHYTHM_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProfileId(p.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  profileId === p.id
                    ? "bg-[#1e4f4f] text-white"
                    : "bg-[#f0ebe3] text-[#3d3832]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-base text-[#6b635a]">
            {RHYTHM_PROFILES.find((p) => p.id === profileId)?.description}
          </p>
          {profileId === "health_wellness" ? (
            <label className="flex items-center gap-2 text-base text-[#1f1c19]">
              <input
                type="checkbox"
                checked={includeHealth}
                onChange={(e) => setIncludeHealth(e.target.checked)}
              />
              Include wellness supports (organizational only — not medical advice)
            </label>
          ) : null}
          <ul className="flex flex-col gap-2">
            {preview.map((t) => (
              <li key={t.title}>
                <label className="flex items-center gap-2 text-base">
                  <input
                    type="checkbox"
                    checked={selectedTitles.includes(t.title)}
                    onChange={(e) => {
                      setSelectedTitles((prev) =>
                        e.target.checked
                          ? [...prev, t.title]
                          : prev.filter((x) => x !== t.title),
                      );
                    }}
                  />
                  {t.title}
                </label>
              </li>
            ))}
          </ul>
          {preview.length > 0 ? (
            <button
              type="button"
              className="companion-btn-primary self-start rounded-xl px-4 py-2.5 text-sm font-semibold"
              onClick={() => {
                activateRhythmProfile(profileId, selectedTitles, {
                  includeHealth,
                });
                setTab("all");
                refresh();
              }}
            >
              Activate selected
            </button>
          ) : (
            <p className="text-base text-[#6b635a]">
              {profileId === "minimal"
                ? "Minimal keeps only critical and user-created items. Adjust Settings for quiet delivery."
                : "Add rhythms individually, or pick another profile."}
            </p>
          )}
        </section>
      ) : null}

      {tab === "settings" ? (
        <section className="flex flex-col gap-4">
          <label className="block text-sm font-bold text-[#6b635a]">
            Notification level
            <select
              className={FIELD}
              value={prefs.notificationLevel}
              onChange={(e) => {
                saveRhythmPrefs({
                  notificationLevel: e.target.value as typeof prefs.notificationLevel,
                });
                refresh();
              }}
            >
              <option value="quiet">Quiet</option>
              <option value="gentle">Gentle</option>
              <option value="supportive">Supportive</option>
              <option value="active">Active</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="block text-sm font-bold text-[#6b635a]">
            Quiet hours start
            <input
              className={FIELD}
              type="time"
              value={prefs.quietHoursStart}
              onChange={(e) => {
                saveRhythmPrefs({ quietHoursStart: e.target.value });
                refresh();
              }}
            />
          </label>
          <label className="block text-sm font-bold text-[#6b635a]">
            Quiet hours end
            <input
              className={FIELD}
              type="time"
              value={prefs.quietHoursEnd}
              onChange={(e) => {
                saveRhythmPrefs({ quietHoursEnd: e.target.value });
                refresh();
              }}
            />
          </label>
          <label className="block text-sm font-bold text-[#6b635a]">
            How is today feeling?
            <select
              className={FIELD}
              value={prefs.dayCondition ?? "normal"}
              onChange={(e) => {
                setDayCondition(e.target.value as DayCondition);
                refresh();
              }}
            >
              <option value="normal">Normal day</option>
              <option value="low_energy">Low energy</option>
              <option value="overwhelmed">Overwhelmed</option>
              <option value="meeting_heavy">Meeting-heavy</option>
              <option value="focus">Focus day</option>
              <option value="quiet">I need a quiet day</option>
              <option value="unexpected">Unexpected change</option>
              <option value="personal">Personal-responsibility day</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-base">
            <input
              type="checkbox"
              checked={prefs.deliveryBrowser}
              onChange={(e) => {
                saveRhythmPrefs({ deliveryBrowser: e.target.checked });
                refresh();
              }}
            />
            Browser notifications
          </label>
          <label className="flex items-center gap-2 text-base">
            <input
              type="checkbox"
              checked={prefs.deliveryInApp}
              onChange={(e) => {
                saveRhythmPrefs({ deliveryInApp: e.target.checked });
                refresh();
              }}
            />
            In-app gentle prompts
          </label>
        </section>
      ) : null}
    </div>
  );
}
