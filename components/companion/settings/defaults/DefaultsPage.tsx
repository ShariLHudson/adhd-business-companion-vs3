"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  maybeAutoSelectSoleCalendar,
  readDigitalWorkspacePreferences,
  resolveCalendarDefaults,
  resolveDocumentDefaults,
  resolvePrintingDefaults,
  resolveStorageDefaults,
  writeDigitalWorkspacePreferences,
  type CalendarProviderPreference,
  type DefaultsConnectionSnapshot,
  type DocumentsProviderPreference,
  type PrintingPreference,
  type StorageProviderPreference,
} from "@/lib/connections";
import { rememberPreferredCalendarProvider } from "@/lib/calendar/memberCalendarDestination";
import { DefaultPreferenceCard } from "./DefaultPreferenceCard";
import { DefaultPreferencePicker } from "./DefaultPreferencePicker";

type Expanding = "documents" | "storage" | "calendar" | "printing" | null;

type Props = {
  connections: DefaultsConnectionSnapshot;
  onRequestConnectGoogle?: () => void;
  onRequestConnectOutlook?: () => void;
  header: (title: string) => ReactNode;
  wrapClassName: string;
};

export function DefaultsPage({
  connections,
  onRequestConnectGoogle,
  onRequestConnectOutlook,
  header,
  wrapClassName,
}: Props) {
  const [prefs, setPrefs] = useState(() => readDigitalWorkspacePreferences());
  const [expanding, setExpanding] = useState<Expanding>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setPrefs(readDigitalWorkspacePreferences());
    window.addEventListener(
      "companion-digital-workspace-preferences-updated",
      sync,
    );
    return () =>
      window.removeEventListener(
        "companion-digital-workspace-preferences-updated",
        sync,
      );
  }, []);

  useEffect(() => {
    const sole = maybeAutoSelectSoleCalendar(prefs, connections);
    if (sole) {
      const next = writeDigitalWorkspacePreferences({ calendar: sole });
      setPrefs(next);
      rememberPreferredCalendarProvider(sole);
    }
  }, [connections, prefs.calendar]);

  function confirm(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 2200);
  }

  const documents = resolveDocumentDefaults(prefs, connections);
  const storage = resolveStorageDefaults(prefs, connections);
  const calendar = resolveCalendarDefaults(prefs, connections);
  const printing = resolvePrintingDefaults(prefs);

  return (
    <div className={wrapClassName} data-testid="settings-defaults">
      {header("Defaults")}
      <p className="mt-1 text-sm text-[#6b635a]">
        Choose where Spark Estate should save, schedule, and send things
        automatically.
      </p>

      {flash ? (
        <p
          className="mt-3 text-sm font-semibold text-[#1e4f4f]"
          role="status"
          aria-live="polite"
          data-testid="settings-defaults-flash"
        >
          {flash}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        <DefaultPreferenceCard
          title={documents.title}
          currentLabel={documents.currentLabel}
          needsAttention={documents.needsAttention}
          attentionMessage={documents.attentionMessage}
          expanded={expanding === "documents"}
          onChangeClick={() =>
            setExpanding((v) => (v === "documents" ? null : "documents"))
          }
          onChooseAnother={() => setExpanding("documents")}
          testId="pref-documents"
        >
          <DefaultPreferencePicker
            options={documents.options}
            currentId={documents.currentId}
            testIdPrefix="pref-documents"
            onSelect={(id: DocumentsProviderPreference) => {
              setPrefs(writeDigitalWorkspacePreferences({ documents: id }));
              setExpanding(null);
              confirm("Default documents updated.");
            }}
            onConnectToUse={() => onRequestConnectGoogle?.()}
          />
        </DefaultPreferenceCard>

        <DefaultPreferenceCard
          title={storage.title}
          currentLabel={storage.currentLabel}
          needsAttention={storage.needsAttention}
          attentionMessage={storage.attentionMessage}
          expanded={expanding === "storage"}
          onChangeClick={() =>
            setExpanding((v) => (v === "storage" ? null : "storage"))
          }
          onChooseAnother={() => setExpanding("storage")}
          testId="pref-storage"
        >
          <DefaultPreferencePicker
            options={storage.options}
            currentId={storage.currentId}
            testIdPrefix="pref-storage"
            onSelect={(id: StorageProviderPreference) => {
              setPrefs(writeDigitalWorkspacePreferences({ storage: id }));
              setExpanding(null);
              confirm("Default file storage updated.");
            }}
            onConnectToUse={() => onRequestConnectGoogle?.()}
          />
        </DefaultPreferenceCard>

        <DefaultPreferenceCard
          title={calendar.title}
          currentLabel={calendar.currentLabel}
          needsAttention={calendar.needsAttention}
          attentionMessage={calendar.attentionMessage}
          expanded={expanding === "calendar"}
          onChangeClick={() =>
            setExpanding((v) => (v === "calendar" ? null : "calendar"))
          }
          onChooseAnother={() => setExpanding("calendar")}
          testId="pref-calendar"
        >
          <DefaultPreferencePicker
            options={calendar.options}
            currentId={calendar.currentId}
            testIdPrefix="pref-calendar"
            onSelect={(id: CalendarProviderPreference) => {
              setPrefs(writeDigitalWorkspacePreferences({ calendar: id }));
              rememberPreferredCalendarProvider(id);
              setExpanding(null);
              confirm("Default calendar updated.");
            }}
            onConnectToUse={(id) => {
              if (id === "google") onRequestConnectGoogle?.();
              else onRequestConnectOutlook?.();
            }}
          />
          {calendar.needsAttention ? (
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-[#1e4f4f] underline-offset-2 hover:underline"
              onClick={() => {
                if (prefs.calendar === "google") onRequestConnectGoogle?.();
                else onRequestConnectOutlook?.();
              }}
            >
              Reconnect
            </button>
          ) : null}
        </DefaultPreferenceCard>

        <DefaultPreferenceCard
          title={printing.title}
          currentLabel={printing.currentLabel}
          needsAttention={printing.needsAttention}
          attentionMessage={printing.attentionMessage}
          expanded={expanding === "printing"}
          onChangeClick={() =>
            setExpanding((v) => (v === "printing" ? null : "printing"))
          }
          onChooseAnother={() => setExpanding("printing")}
          testId="pref-printing"
        >
          <DefaultPreferencePicker
            options={printing.options.filter((o) => o.selectable)}
            currentId={
              printing.currentId === "preferred-provider"
                ? "save-pdf"
                : printing.currentId
            }
            testIdPrefix="pref-printing"
            onSelect={(id: PrintingPreference) => {
              setPrefs(writeDigitalWorkspacePreferences({ printing: id }));
              setExpanding(null);
              confirm("Default printing updated.");
            }}
          />
        </DefaultPreferenceCard>
      </div>
    </div>
  );
}
