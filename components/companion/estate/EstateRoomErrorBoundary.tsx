"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { EstateRouteRecovery } from "@/components/companion/estate/EstateRouteRecovery";
import "@/app/companion/estate-route-recovery.css";

type Props = {
  children: ReactNode;
  roomLabel?: string;
  onReturnToEstate?: () => void;
};

type State = {
  error: Error | null;
};

/** Per-room error boundary — prevents blank gray screens after navigation. */
export class EstateRoomErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[EstateRoomErrorBoundary${this.props.roomLabel ? `: ${this.props.roomLabel}` : ""}]`,
      error,
      info.componentStack,
    );
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <EstateRouteRecovery
          title={
            this.props.roomLabel
              ? `${this.props.roomLabel} could not open`
              : undefined
          }
          onRetry={this.handleRetry}
          onReturnToEstate={this.props.onReturnToEstate}
          error={this.state.error}
        />
      );
    }
    return this.props.children;
  }
}
