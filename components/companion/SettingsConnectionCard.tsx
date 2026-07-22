"use client";

import type { SettingsConnectionCardState } from "@/lib/connections";

type Props = {
  card: SettingsConnectionCardState;
  onConnectOutlook?: () => void;
  onManageGoogle?: () => void;
  onManageOutlook?: () => void;
  onConnectCanva?: () => void;
  onManageCanva?: () => void;
};

/**
 * Settings → Connections card — matches existing Connections panel styling.
 */
export function SettingsConnectionCard({
  card,
  onConnectOutlook,
  onManageGoogle,
  onManageOutlook,
  onConnectCanva,
  onManageCanva,
}: Props) {
  const connected = card.status === "connected";
  const unavailable = card.status === "unavailable";

  return (
    <div
      className="rounded-xl border border-[#d4cdc3] bg-white/85 p-4"
      data-testid={`settings-connection-${card.id}`}
      data-connection-status={card.status}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          {connected ? "🟢" : "🔴"}
        </span>
        <p className="text-base font-semibold text-[#1f1c19]">{card.title}</p>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
        {card.description}
      </p>

      <p className="mt-3 text-sm font-semibold text-[#1f1c19]">
        Status:{" "}
        <span className={connected ? "text-[#1e4f4f]" : "text-[#6b635a]"}>
          {connected
            ? "Connected"
            : unavailable
              ? "Unavailable"
              : "Not Connected"}
        </span>
      </p>

      {connected && card.accountEmail ? (
        <p className="mt-1 text-sm text-[#6b635a]">
          Connected as:{" "}
          <span className="font-semibold text-[#1e4f4f]">
            {card.accountEmail}
          </span>
        </p>
      ) : null}

      {connected && card.destinationUrl ? (
        <p
          className="mt-1 break-all text-sm text-[#6b635a]"
          data-testid={`settings-connection-url-${card.id}`}
        >
          Destination:{" "}
          <span className="font-semibold text-[#1e4f4f]">
            {card.destinationUrl}
          </span>
        </p>
      ) : null}

      {unavailable ? (
        <p className="mt-3 text-sm text-[#6b635a]">
          Google saving isn&apos;t turned on for this site yet. Your work still
          stays safe here in Spark.
        </p>
      ) : connected ? (
        <button
          type="button"
          onClick={() => {
            if (card.kind === "outlook-calendar") onManageOutlook?.();
            else if (card.kind === "canva") onManageCanva?.();
            else onManageGoogle?.();
          }}
          className="mt-4 rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          data-testid={`settings-connection-manage-${card.id}`}
        >
          {card.manageLabel}
        </button>
      ) : card.kind === "outlook-calendar" ? (
        <button
          type="button"
          onClick={() => onConnectOutlook?.()}
          className="mt-4 inline-block rounded-lg bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          data-testid={`settings-connection-connect-${card.id}`}
        >
          {card.connectLabel}
        </button>
      ) : card.kind === "canva" ? (
        <button
          type="button"
          onClick={() => onConnectCanva?.()}
          className="mt-4 inline-block rounded-lg bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          data-testid={`settings-connection-connect-${card.id}`}
        >
          {card.connectLabel}
        </button>
      ) : card.connectHref ? (
        <a
          href={card.connectHref}
          className="mt-4 inline-block rounded-lg bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          data-testid={`settings-connection-connect-${card.id}`}
        >
          {card.connectLabel}
        </a>
      ) : null}
    </div>
  );
}
