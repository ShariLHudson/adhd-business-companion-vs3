"use client";

import { useState, type ReactNode } from "react";
import {
  buildSettingsConnectionCards,
  connectCanvaLocal,
  connectOutlookCalendarLocal,
  disconnectCanvaLocal,
  disconnectOutlookCalendarLocal,
  type SettingsConnectionId,
  updateCanvaDestinationUrl,
  verifyCanvaConnection,
} from "@/lib/connections";
import { ServiceConnectionCard } from "./ServiceConnectionCard";
import { ServiceManagePanel } from "./ServiceManagePanel";

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

export function ConnectedServicesPage({
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
  const [managingConnectionId, setManagingConnectionId] =
    useState<SettingsConnectionId | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const connectionCards = buildSettingsConnectionCards({
    google,
    outlookConnected,
    canvaConnected,
    canvaDestinationUrl,
    googleAuthHref: `/api/google/auth?returnTo=${encodeURIComponent(returnToQuery)}`,
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
    setManagingConnectionId("canva");
  }

  function disconnectGoogle() {
    fetch("/api/google/disconnect", { method: "POST" })
      .then(() => {
        refreshGoogle();
        setManagingConnectionId(null);
        flashMsg("Google account disconnected.");
      })
      .catch(() => {
        onCanvaFeedback(null);
        flashMsg("We could not complete the connection.");
      });
  }

  return (
    <div className={wrapClassName} data-testid="settings-connections">
      {header("Connected Services")}
      <p className="mt-1 text-sm text-[#6b635a]">
        Connect the services you want Spark Estate to use. You can manage or
        disconnect them at any time.
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

      <p className="mt-3 text-sm text-[#6b635a]">
        You do not need to connect everything. Choose only the services you
        already use.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {connectionCards.map((card) => (
          <div key={card.id}>
            <ServiceConnectionCard
              card={card}
              onConnect={() => {
                if (card.kind === "outlook-calendar") {
                  connectOutlookCalendarLocal();
                  refreshOutlook();
                  flashMsg("Outlook Calendar connected.");
                  setManagingConnectionId(null);
                } else if (card.kind === "canva") {
                  onCanvaFeedback(null);
                  setManagingConnectionId("canva");
                }
              }}
              onManage={() =>
                setManagingConnectionId((current) =>
                  current === card.id ? null : card.id,
                )
              }
              onDisconnect={() => {
                if (card.kind === "google") disconnectGoogle();
                else if (card.kind === "outlook-calendar") {
                  disconnectOutlookCalendarLocal();
                  refreshOutlook();
                  setManagingConnectionId(null);
                  flashMsg("Outlook Calendar disconnected.");
                } else if (card.kind === "canva") {
                  disconnectCanvaLocal();
                  onCanvaDraftChange("");
                  onCanvaFeedback(null);
                  refreshCanva();
                  setManagingConnectionId(null);
                  flashMsg("Canva disconnected.");
                }
              }}
              onReconnect={() => {
                if (card.connectHref && typeof window !== "undefined") {
                  window.location.href = card.connectHref;
                } else if (card.kind === "canva") {
                  setManagingConnectionId("canva");
                }
              }}
            />
            {managingConnectionId === card.id ? (
              <ServiceManagePanel
                card={card}
                canvaDraftUrl={canvaDraftUrl}
                canvaFeedback={canvaFeedback}
                onCanvaDraftChange={onCanvaDraftChange}
                onCanvaSave={() => applyCanvaUrl(canvaDraftUrl)}
                onCanvaVerify={() => {
                  const result = verifyCanvaConnection();
                  onCanvaFeedback(
                    result.ok ? "Canva link looks good." : result.reason,
                  );
                  refreshCanva();
                }}
                onDisconnect={() => {
                  if (card.kind === "google") disconnectGoogle();
                  else if (card.kind === "outlook-calendar") {
                    disconnectOutlookCalendarLocal();
                    refreshOutlook();
                    setManagingConnectionId(null);
                    flashMsg("Outlook Calendar disconnected.");
                  } else {
                    disconnectCanvaLocal();
                    onCanvaDraftChange("");
                    onCanvaFeedback("Canva disconnected.");
                    refreshCanva();
                    setManagingConnectionId(null);
                    flashMsg("Canva disconnected.");
                  }
                }}
                onReconnect={
                  card.kind === "google"
                    ? () => {
                        if (typeof window !== "undefined") {
                          window.location.href = `/api/google/auth?returnTo=${encodeURIComponent(returnToQuery)}`;
                        }
                      }
                    : undefined
                }
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
