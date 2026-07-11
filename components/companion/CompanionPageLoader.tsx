"use client";

import {
  Component,
  useLayoutEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import { CompanionAuthGate } from "@/components/companion/CompanionAuthGate";
import { EstateRouteRecovery } from "@/components/companion/estate/EstateRouteRecovery";
import { ESTATE_WORKSPACE_LOAD_RECOVERY } from "@/lib/companionContextRouting/workspaceLoadRecovery";
import "@/app/companion/estate-route-recovery.css";

const LOADING = (
  <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
    Loading your workspace…
  </main>
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

type EstateErrorBoundaryState = { hasError: boolean };

/**
 * In-app recovery — avoids a separate `app/companion/error` chunk that can
 * ChunkLoadError when the dev bundle is stale.
 */
class EstateErrorBoundary extends Component<
  { children: ReactNode; onReturnToEstate?: () => void },
  EstateErrorBoundaryState
> {
  state: EstateErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): EstateErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    logWorkspaceLoadFailure(error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
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
          error={new Error("Companion workspace failed to render")}
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
        if (!cancelled) setPage(() => mod.default);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          routeWorkspaceLoadFailure(err);
          setLoadFailed(true);
        }
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
  return (
    <CompanionAuthGate>
      <AuthenticatedCompanionShell />
    </CompanionAuthGate>
  );
}
