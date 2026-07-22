"use client";

import { useEffect, useMemo, useState } from "react";
import {
  isCanvaConnected,
  isOutlookCalendarConnected,
  writeDigitalWorkspacePreferences,
} from "@/lib/connections";
import {
  preferencePatchForDestination,
  rememberCrystalActionDestination,
  resolveCrystalActions,
  type CrystalActionDestinationId,
  type CrystalActionId,
  type CrystalActionItemKind,
  type CrystalActionsPanelModel,
  type ResolvedCrystalAction,
} from "@/lib/crystalActions";
import type { CrystalConnectionSnapshot } from "@/lib/destinationGallery/crystalConnectionMapping";

type Props = {
  itemKind: CrystalActionItemKind;
  connections?: Partial<CrystalConnectionSnapshot>;
  open?: boolean;
  onClose?: () => void;
  onAction?: (input: {
    actionId: CrystalActionId;
    destinationId: CrystalActionDestinationId;
    crystalRoute?: ResolvedCrystalAction["crystalRoute"];
  }) => void;
  hasSocialLinks?: boolean;
  /** Precomputed model — optional; resolved from props when omitted */
  model?: CrystalActionsPanelModel;
};

/**
 * Compact Crystal Actions overlay — contextual next steps after create/update.
 * Keeps crystal visual identity without the Destination Gallery room.
 */
export function CrystalActionsPanel({
  itemKind,
  connections: connectionsProp,
  open = true,
  onClose,
  onAction,
  hasSocialLinks,
  model: modelProp,
}: Props) {
  const [google, setGoogle] = useState({
    configured: connectionsProp?.google?.configured ?? true,
    connected: connectionsProp?.google?.connected ?? false,
    email: connectionsProp?.google?.email ?? null,
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((d: { configured?: boolean; connected?: boolean; email?: string | null }) => {
        if (cancelled) return;
        setGoogle({
          configured: Boolean(d.configured),
          connected: Boolean(d.connected),
          email: d.email ?? null,
        });
      })
      .catch(() => {
        /* keep prior snapshot */
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const connections: CrystalConnectionSnapshot = useMemo(
    () => ({
      google,
      outlookConnected:
        connectionsProp?.outlookConnected ?? isOutlookCalendarConnected(),
      canvaConnected: connectionsProp?.canvaConnected ?? isCanvaConnected(),
    }),
    [google, connectionsProp?.outlookConnected, connectionsProp?.canvaConnected],
  );

  const model = useMemo(
    () =>
      modelProp ??
      resolveCrystalActions({
        itemKind,
        connections,
        hasSocialLinks,
      }),
    [modelProp, itemKind, connections, hasSocialLinks],
  );

  const [choosingFor, setChoosingFor] = useState<CrystalActionId | null>(null);

  if (!open) return null;

  function commit(
    action: ResolvedCrystalAction,
    destinationId: CrystalActionDestinationId,
  ) {
    rememberCrystalActionDestination({
      itemKind,
      actionId: action.id,
      destinationId,
    });
    const patch = preferencePatchForDestination(action.id, destinationId);
    if (patch) writeDigitalWorkspacePreferences(patch);
    setChoosingFor(null);
    onAction?.({
      actionId: action.id,
      destinationId,
      crystalRoute: action.crystalRoute,
    });
  }

  function handleActionClick(action: ResolvedCrystalAction) {
    if (action.needsProviderChoice) {
      setChoosingFor((current) =>
        current === action.id ? null : action.id,
      );
      return;
    }
    const destinationId =
      action.autoDestinationId ?? action.providers[0]?.id ?? "spark-estate";
    commit(action, destinationId);
  }

  return (
    <div
      className="crystal-actions-panel"
      data-testid="crystal-actions-panel"
      role="dialog"
      aria-labelledby="crystal-actions-title"
    >
      <div className="crystal-actions-panel__sheet">
        <div className="crystal-actions-panel__header">
          <span className="crystal-actions-panel__gem" aria-hidden="true" />
          <h2 id="crystal-actions-title" className="crystal-actions-panel__title">
            {model.title}
          </h2>
          {onClose ? (
            <button
              type="button"
              className="crystal-actions-panel__close"
              onClick={onClose}
              aria-label="Close"
              data-testid="crystal-actions-close"
            >
              Close
            </button>
          ) : null}
        </div>

        <ul className="crystal-actions-panel__list">
          {model.actions.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                className="crystal-actions-panel__action"
                onClick={() => handleActionClick(action)}
                data-testid={`crystal-action-${action.id}`}
                data-crystal-route={action.crystalRoute ?? ""}
              >
                <span
                  className="crystal-actions-panel__facet"
                  aria-hidden="true"
                />
                <span>{action.label}</span>
              </button>
              {choosingFor === action.id ? (
                <div
                  className="crystal-actions-panel__providers"
                  data-testid={`crystal-action-providers-${action.id}`}
                >
                  <p className="crystal-actions-panel__providers-label">
                    Which one should I use?
                  </p>
                  {action.providers.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      className="crystal-actions-panel__provider"
                      onClick={() => commit(action, provider.id)}
                      data-testid={`crystal-action-provider-${provider.id}`}
                    >
                      {provider.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
