"use client";

import { useState, type ReactNode } from "react";
import {
  buildServiceCategories,
  buildSettingsConnectionCards,
  connectCanvaLocal,
  connectOutlookCalendarLocal,
  disconnectCanvaLocal,
  disconnectOutlookCalendarLocal,
  updateCanvaDestinationUrl,
  verifyCanvaConnection,
  writeDigitalWorkspacePreferences,
  type CalendarProviderPreference,
  type DocumentsProviderPreference,
  type ServiceCategoryId,
  type ServiceItemId,
  type SettingsConnectionId,
  type StorageProviderPreference,
} from "@/lib/connections";
import { OnlinePresenceSection } from "@/components/companion/settings/profile/OnlinePresenceSection";
import { ServiceManagePanel } from "@/components/companion/settings/connected-services/ServiceManagePanel";

type GoogleSnap = {
  configured: boolean;
  connected: boolean;
  email: string | null;
};

type Props = {
  google: GoogleSnap;
  outlookConnected: boolean;
  canvaConnected: boolean;
  canvaDestinationUrl: string | null;
  canvaDraftUrl: string;
  canvaFeedback: string | null;
  onCanvaDraftChange: (value: string) => void;
  onCanvaFeedback: (value: string | null) => void;
  refreshGoogle: () => void;
  refreshOutlook: () => void;
  refreshCanva: () => void;
  header: (title: string) => ReactNode;
  wrapClassName: string;
  returnToQuery?: string;
};

/**
 * Settings → Connections — Services (expandable categories) + Social Media.
 * Single source of truth; no Preferred Destinations / browser shortcuts.
 */
export function ConnectionsPage({
  google,
  outlookConnected,
  canvaConnected,
  canvaDestinationUrl,
  canvaDraftUrl,
  canvaFeedback,
  onCanvaDraftChange,
  onCanvaFeedback,
  refreshGoogle,
  refreshOutlook,
  refreshCanva,
  header,
  wrapClassName,
  returnToQuery = "/companion?settings=connections",
}: Props) {
  const [expanded, setExpanded] = useState<ServiceCategoryId | null>("calendar");
  const [managingId, setManagingId] = useState<SettingsConnectionId | null>(
    null,
  );
  const [flash, setFlash] = useState<string | null>(null);

  const googleAuthHref = `/api/google/auth?returnTo=${encodeURIComponent(returnToQuery)}`;
  const categories = buildServiceCategories({
    google,
    outlookConnected,
    canvaConnected,
    googleAuthHref,
  });

  const manageCards = buildSettingsConnectionCards({
    google,
    outlookConnected,
    canvaConnected,
    canvaDestinationUrl,
    googleAuthHref,
  });

  function flashMsg(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 2200);
  }

  function applyCanvaUrl(raw: string) {
    const result = canvaConnected
      ? updateCanvaDestinationUrl(raw)
      : connectCanvaLocal(raw);
    if (!result.ok) {
      onCanvaFeedback(result.reason);
      return;
    }
    onCanvaFeedback("Canva connected.");
    flashMsg("Canva connected.");
    refreshCanva();
    setManagingId("canva");
  }

  function disconnectGoogle() {
    fetch("/api/google/disconnect", { method: "POST" })
      .then(() => {
        refreshGoogle();
        setManagingId(null);
        flashMsg("Google account disconnected.");
      })
      .catch(() => {
        flashMsg("We could not complete the connection.");
      });
  }

  function selectService(itemId: ServiceItemId) {
    const category = categories.find((c) =>
      c.items.some((i) => i.id === itemId),
    );
    const item = category?.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.kind === "google-oauth") {
      if (item.showConnectedCheck) {
        const manageMap: Partial<Record<ServiceItemId, SettingsConnectionId>> = {
          "google-calendar": "google-calendar",
          "google-docs": "google-docs",
          "google-drive": "google-drive",
        };
        setManagingId(manageMap[itemId] ?? "google-docs");
        if (item.preferenceKey && item.preferenceValue) {
          writeDigitalWorkspacePreferences({
            [item.preferenceKey]: item.preferenceValue,
          } as Parameters<typeof writeDigitalWorkspacePreferences>[0]);
        }
        flashMsg(`${item.label} — Connected ✓`);
        return;
      }
      if (item.connectHref && typeof window !== "undefined") {
        window.location.href = item.connectHref;
      }
      return;
    }

    if (item.kind === "outlook-local") {
      if (!item.showConnectedCheck) {
        connectOutlookCalendarLocal();
        refreshOutlook();
        writeDigitalWorkspacePreferences({ calendar: "outlook" });
        flashMsg("Outlook Calendar connected.");
      } else {
        setManagingId("outlook-calendar");
        writeDigitalWorkspacePreferences({ calendar: "outlook" });
        flashMsg("Outlook Calendar — Connected ✓");
      }
      return;
    }

    if (item.kind === "canva-local") {
      onCanvaFeedback(null);
      setManagingId("canva");
      if (item.showConnectedCheck) {
        flashMsg("Canva — Connected ✓");
      }
      return;
    }

    if (
      (item.kind === "built-in" || item.kind === "preference-only") &&
      item.preferenceKey &&
      item.preferenceValue
    ) {
      writeDigitalWorkspacePreferences({
        [item.preferenceKey]: item.preferenceValue as
          | DocumentsProviderPreference
          | StorageProviderPreference
          | CalendarProviderPreference,
      });
      flashMsg(`${item.label} — Connected ✓`);
    }
  }

  function manageCardFor(id: SettingsConnectionId) {
    return manageCards.find((c) => c.id === id) ?? null;
  }

  function isManagingItem(itemId: ServiceItemId): boolean {
    if (!managingId) return false;
    if (itemId === "google-calendar") return managingId === "google-calendar";
    if (itemId === "google-docs") return managingId === "google-docs";
    if (itemId === "google-drive") return managingId === "google-drive";
    if (itemId === "outlook-calendar") return managingId === "outlook-calendar";
    if (itemId === "canva") return managingId === "canva";
    return false;
  }

  return (
    <div className={wrapClassName} data-testid="settings-connections">
      {header("Connections")}
      <p className="mt-1 text-sm text-[#6b635a]">
        Tell Spark Estate which services you use. Configure once — then use them
        everywhere.
      </p>

      {flash ? (
        <p
          className="mt-3 text-sm font-semibold text-[#1e4f4f]"
          role="status"
          aria-live="polite"
          data-testid="settings-connections-flash"
        >
          {flash}
        </p>
      ) : null}

      <section className="mt-5" data-testid="connections-services">
        <h3 className="text-lg font-semibold text-[#1f1c19]">Services</h3>
        <p className="mt-1 text-sm text-[#6b635a]">
          You do not need to connect everything. Choose only the services you
          already use.
        </p>

        <div className="mt-3 flex flex-col gap-2">
          {categories.map((category) => {
            const isOpen = expanded === category.id;
            return (
              <div
                key={category.id}
                className="rounded-xl border border-[#d4cdc3] bg-white/85"
                data-testid={`connections-category-${category.id}`}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setExpanded((current) =>
                      current === category.id ? null : category.id,
                    )
                  }
                  data-testid={`connections-category-toggle-${category.id}`}
                >
                  <span className="text-base font-semibold text-[#1f1c19]">
                    {category.label}
                  </span>
                  <span className="text-sm text-[#6b635a]">
                    {category.connectedCount > 0
                      ? `${category.connectedCount} ready`
                      : "Add"}
                    <span className="ml-2" aria-hidden>
                      {isOpen ? "▾" : "▸"}
                    </span>
                  </span>
                </button>

                {isOpen ? (
                  <ul className="border-t border-[#e7dfd4] px-2 py-2">
                    {category.items.map((item) => (
                      <li key={item.id} className="py-1">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#1e4f4f]/[0.05]"
                          onClick={() => selectService(item.id)}
                          data-testid={`connections-service-${item.id}`}
                          data-connection-status={
                            item.showConnectedCheck
                              ? "connected"
                              : "disconnected"
                          }
                        >
                          <span className="text-sm font-semibold text-[#1f1c19]">
                            {item.label}
                          </span>
                          <span className="text-sm font-semibold text-[#1e4f4f]">
                            {item.showConnectedCheck
                              ? "Connected ✓"
                              : item.status === "needs_attention"
                                ? "Needs attention"
                                : "Connect"}
                          </span>
                        </button>
                        {isManagingItem(item.id) && managingId ? (
                          <div className="px-2 pb-2">
                            {(() => {
                              const card = manageCardFor(managingId);
                              if (!card) return null;
                              return (
                                <ServiceManagePanel
                                  card={card}
                                  canvaDraftUrl={canvaDraftUrl}
                                  canvaFeedback={canvaFeedback}
                                  onCanvaDraftChange={onCanvaDraftChange}
                                  onCanvaSave={() =>
                                    applyCanvaUrl(canvaDraftUrl)
                                  }
                                  onCanvaVerify={() => {
                                    const result = verifyCanvaConnection();
                                    onCanvaFeedback(
                                      result.ok
                                        ? "Canva link looks good."
                                        : result.reason,
                                    );
                                    refreshCanva();
                                  }}
                                  onDisconnect={() => {
                                    if (card.kind === "google") {
                                      disconnectGoogle();
                                    } else if (
                                      card.kind === "outlook-calendar"
                                    ) {
                                      disconnectOutlookCalendarLocal();
                                      refreshOutlook();
                                      setManagingId(null);
                                      flashMsg(
                                        "Outlook Calendar disconnected.",
                                      );
                                    } else {
                                      disconnectCanvaLocal();
                                      onCanvaDraftChange("");
                                      onCanvaFeedback(null);
                                      refreshCanva();
                                      setManagingId(null);
                                      flashMsg("Canva disconnected.");
                                    }
                                  }}
                                  onReconnect={
                                    card.kind === "google"
                                      ? () => {
                                          if (typeof window !== "undefined") {
                                            window.location.href =
                                              googleAuthHref;
                                          }
                                        }
                                      : undefined
                                  }
                                />
                              );
                            })()}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8" data-testid="connections-social-media">
        <h3 className="text-lg font-semibold text-[#1f1c19]">Social Media</h3>
        <p className="mt-1 text-sm text-[#6b635a]">
          Optional website and social profile links.
        </p>
        <div className="mt-3">
          <OnlinePresenceSection showHeading={false} />
        </div>
      </section>
    </div>
  );
}
