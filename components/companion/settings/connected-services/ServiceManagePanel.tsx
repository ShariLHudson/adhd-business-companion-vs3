"use client";

import type { SettingsConnectionCardState } from "@/lib/connections";

type Props = {
  card: SettingsConnectionCardState;
  canvaDraftUrl?: string;
  canvaFeedback?: string | null;
  onCanvaDraftChange?: (value: string) => void;
  onCanvaSave?: () => void;
  onCanvaVerify?: () => void;
  onDisconnect: () => void;
  onReconnect?: () => void;
};

/**
 * Progressive disclosure for Connected Services — advanced details after Manage.
 */
export function ServiceManagePanel({
  card,
  canvaDraftUrl = "",
  canvaFeedback,
  onCanvaDraftChange,
  onCanvaSave,
  onCanvaVerify,
  onDisconnect,
  onReconnect,
}: Props) {
  const openHref =
    card.kind === "canva"
      ? card.destinationUrl || card.openUrl
      : card.openUrl;

  return (
    <div
      className="mt-2 rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-4 py-3"
      data-testid={`settings-connection-manage-panel-${card.id}`}
      role="region"
      aria-label={`${card.title} connection details`}
    >
      {card.accountEmail ? (
        <p className="text-sm text-[#6b635a]">
          Connected account:{" "}
          <span className="font-semibold text-[#1e4f4f]">
            {card.accountEmail}
          </span>
        </p>
      ) : null}

      {card.kind === "canva" ? (
        <div className="mt-2">
          <label
            className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]"
            htmlFor="canva-destination-url"
          >
            Canva destination link
          </label>
          <input
            id="canva-destination-url"
            value={canvaDraftUrl}
            onChange={(e) => onCanvaDraftChange?.(e.target.value)}
            placeholder="https://www.canva.com"
            className="mt-1.5 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            data-testid="settings-canva-url-input"
          />
          {canvaFeedback ? (
            <p
              className="mt-2 text-sm text-[#1e4f4f]"
              data-testid="settings-canva-feedback"
              aria-live="polite"
            >
              {canvaFeedback}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCanvaSave}
              className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
              data-testid="settings-canva-save"
            >
              {card.status === "connected" ||
              card.status === "needs_attention"
                ? "Update Canva link"
                : "Connect Canva"}
            </button>
            {card.status === "connected" ? (
              <button
                type="button"
                onClick={onCanvaVerify}
                className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                data-testid="settings-canva-verify"
              >
                Verify
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {card.kind === "outlook-calendar" ? (
        <p className="mt-1 text-sm text-[#6b635a]">
          Outlook Calendar is prepared in Spark. When Microsoft sync is ready,
          it will use this same connection.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {openHref ? (
          <a
            href={openHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#1e4f4f] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
            data-testid={`settings-connection-open-${card.id}`}
          >
            {card.id === "google-drive"
              ? "Open Google Drive"
              : card.id === "google-calendar"
                ? "Open Google Calendar"
                : card.id === "google-docs"
                  ? "Open Google Docs"
                  : card.id === "canva"
                    ? "Open Canva"
                    : card.id === "outlook-calendar"
                      ? "Open Outlook Calendar"
                      : `Open ${card.title}`}
          </a>
        ) : null}

        {card.kind === "google" && onReconnect ? (
          <button
            type="button"
            onClick={onReconnect}
            className="rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          >
            Reconnect
          </button>
        ) : null}

        <button
          type="button"
          onClick={onDisconnect}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
          data-testid={
            card.kind === "canva"
              ? "settings-canva-disconnect"
              : `settings-connection-disconnect-panel-${card.id}`
          }
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
