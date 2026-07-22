"use client";

import {
  connectionStatusLabel,
  normalizeConnectionStatus,
  type SettingsConnectionCardState,
} from "@/lib/connections";

type Props = {
  card: SettingsConnectionCardState;
  onConnect?: () => void;
  onManage?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
};

function StatusIcon({
  status,
}: {
  status: ReturnType<typeof normalizeConnectionStatus>;
}) {
  if (status === "connected") {
    return (
      <span className="text-[#1e4f4f]" aria-hidden="true">
        ✓
      </span>
    );
  }
  if (status === "needs_attention") {
    return (
      <span className="text-[#a85c4a]" aria-hidden="true">
        !
      </span>
    );
  }
  if (status === "connecting") {
    return (
      <span className="text-[#6b635a]" aria-hidden="true">
        …
      </span>
    );
  }
  return (
    <span className="text-[#9a8f82]" aria-hidden="true">
      ○
    </span>
  );
}

/**
 * Settings → Connected Services — one calm card per external service.
 */
export function ServiceConnectionCard({
  card,
  onConnect,
  onManage,
  onDisconnect,
  onReconnect,
}: Props) {
  const status = normalizeConnectionStatus(card.status);
  const label = connectionStatusLabel(card.status);

  return (
    <div
      className="flex min-h-[9.5rem] flex-col rounded-xl border border-[#d4cdc3] bg-white/85 p-4"
      data-testid={`settings-connection-${card.id}`}
      data-connection-status={status}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusIcon status={status} />
        <p className="text-lg font-semibold text-[#1f1c19]">{card.title}</p>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
        {card.description}
      </p>

      <p
        className="mt-3 text-sm font-semibold text-[#1f1c19]"
        aria-label={`Status: ${label}`}
      >
        <StatusIcon status={status} />{" "}
        <span
          className={
            status === "connected"
              ? "text-[#1e4f4f]"
              : status === "needs_attention"
                ? "text-[#a85c4a]"
                : "text-[#6b635a]"
          }
        >
          {label}
        </span>
      </p>

      {status === "needs_attention" && card.kind === "google" ? (
        <p className="mt-2 text-sm text-[#6b635a]">
          Google saving isn&apos;t turned on for this site yet. Your work still
          stays safe here in Spark.
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {status === "connected" ? (
          <>
            <button
              type="button"
              onClick={onManage}
              className="rounded-lg bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
              data-testid={`settings-connection-manage-${card.id}`}
            >
              Manage
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a85c4a]"
              data-testid={`settings-connection-disconnect-${card.id}`}
            >
              Disconnect
            </button>
          </>
        ) : null}

        {status === "needs_attention" &&
        (card.connectHref || onReconnect || onConnect) &&
        !(card.kind === "google" && !card.connectHref) ? (
          <button
            type="button"
            onClick={onReconnect ?? onConnect}
            className="rounded-lg bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
            data-testid={`settings-connection-reconnect-${card.id}`}
          >
            Reconnect
          </button>
        ) : null}

        {status === "disconnected" || status === "connecting" ? (
          card.connectHref ? (
            <a
              href={card.connectHref}
              className="inline-block rounded-lg bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
              data-testid={`settings-connection-connect-${card.id}`}
            >
              {status === "connecting" ? "Connecting…" : "Connect"}
            </a>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={status === "connecting"}
              className="rounded-lg bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f] disabled:opacity-70"
              data-testid={`settings-connection-connect-${card.id}`}
            >
              {status === "connecting" ? "Connecting…" : "Connect"}
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
