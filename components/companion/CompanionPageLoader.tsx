"use client";

import {
  Component,
  useLayoutEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import { CompanionAuthGate } from "@/components/companion/CompanionAuthGate";
import { EstateOrientationHost } from "@/components/companion/EstateOrientationHost";
import { FirstLoginWelcomeGate } from "@/components/companion/FirstLoginWelcomeOverlay";
import { EstateRouteRecovery } from "@/components/companion/estate/EstateRouteRecovery";
import { SparkLoadingState } from "@/components/companion/SparkThinkingFlame";
import { armCompanionPreviewTestHarnessFromQuery } from "@/lib/companionPreviewTestHarness";
import { ESTATE_WORKSPACE_LOAD_RECOVERY } from "@/lib/companionContextRouting/workspaceLoadRecovery";
import {
  clearCompanionChunkReloadGuard,
  isCompanionWebpackChunkFailure,
  reloadOnceForStaleCompanionChunk,
} from "@/lib/companionWebpackChunkFailure";
import { asError, safeErrorMessage } from "@/lib/safeErrorDisplay";
import "@/app/companion/estate-route-recovery.css";
import "@/app/companion/spark-thinking-flame.css";

const LOADING = (
  <SparkLoadingState
    fullPage
    message="Loading your workspace…"
    size="lg"
  />
);

function logWorkspaceLoadFailure(error: Error): void {
  void import("@/lib/companionContextRouting/routeCompanionFailure").then(
    ({ logCompanionSystemFailure }) => {
      logCompanionSystemFailure(error, { surface: "workspace-load" });
    },
  );
}

function routeWorkspaceLoadFailure(err: unknown): void {
  void import("@/lib/companionContextRouting/routeCompanionFailure").then(
    ({ routeCompanionFailure }) => {
      routeCompanionFailure(err, { surface: "workspace-load" });
    },
  );
}

type EstateErrorBoundaryState = {
  hasError: boolean;
  caught: unknown;
};

/**
 * In-app recovery — avoids a separate `app/companion/error` chunk that can
 * ChunkLoadError when the dev bundle is stale.
 * Never surfaces DOM Events as "[object Event]".
 */
class EstateErrorBoundary extends Component<
  { children: ReactNode; onReturnToEstate?: () => void },
  EstateErrorBoundaryState
> {
  state: EstateErrorBoundaryState = { hasError: false, caught: null };

  static getDerivedStateFromError(error: unknown): EstateErrorBoundaryState {
    return { hasError: true, caught: error };
  }

  componentDidCatch(error: unknown) {
    logWorkspaceLoadFailure(asError(error));
  }

  private handleRetry = () => {
    this.setState({ hasError: false, caught: null });
  };

  render() {
    if (this.state.hasError) {
      const detail = safeErrorMessage(this.state.caught);
      return (
        <EstateRouteRecovery
          message={ESTATE_WORKSPACE_LOAD_RECOVERY}
          onRetry={this.handleRetry}
          onReturnToEstate={
            this.props.onReturnToEstate ??
            (() => {
              window.location.assign("/companion?section=home");
            })
          }
          error={
            new Error(
              detail && detail !== "Unknown error"
                ? `Companion workspace failed to render: ${detail}`
                : "Companion workspace failed to render",
            )
          }
        />
      );
    }
    return this.props.children;
  }
}

function WorkspaceLoadRecovery({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <EstateRouteRecovery
      message={ESTATE_WORKSPACE_LOAD_RECOVERY}
      onRetry={onRetry}
      onReturnToEstate={() => {
        window.location.assign("/companion?section=home");
      }}
    />
  );
}

/**
 * Loads CompanionPageClient only after auth gate passes — visitors are redirected
 * to sign-in without pulling the full workspace bundle.
 */
function AuthenticatedCompanionShell() {
  const [Page, setPage] = useState<ComponentType | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;
    void import("@/app/companion/CompanionPageClient")
      .then((mod) => {
        if (!cancelled) {
          clearCompanionChunkReloadGuard();
          setPage(() => mod.default);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (
          isCompanionWebpackChunkFailure(err) &&
          reloadOnceForStaleCompanionChunk()
        ) {
          return;
        }
        routeWorkspaceLoadFailure(err);
        setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadFailed) {
    return <WorkspaceLoadRecovery onRetry={() => window.location.reload()} />;
  }

  if (!Page) return LOADING;

  return (
    <EstateErrorBoundary>
      <Page />
    </EstateErrorBoundary>
  );
}

/**
 * Loads the companion shell only in the browser. Avoids SSR/hydration of the
 * large client tree.
 */
export function CompanionPageLoader() {
  useLayoutEffect(() => {
    armCompanionPreviewTestHarnessFromQuery();
  }, []);

  return (
    <CompanionAuthGate>
      <EstateErrorBoundary>
        <FirstLoginWelcomeGate>
          <AuthenticatedCompanionShell />
          <EstateOrientationHost />
        </FirstLoginWelcomeGate>
      </EstateErrorBoundary>
    </CompanionAuthGate>
  );
}
