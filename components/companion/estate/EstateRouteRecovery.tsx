"use client";

import "@/app/companion/estate-route-recovery.css";

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onReturnToEstate?: () => void;
  error?: Error | null;
};

const DEFAULT_TITLE = "This room needs a moment";
const DEFAULT_MESSAGE =
  "Something did not finish loading, but you are still in Spark Estate. You can try again or return home.";

/**
 * Never leave a blank gray viewport — show recovery when a route fails to render.
 */
export function EstateRouteRecovery({
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
  onRetry,
  onReturnToEstate,
  error = null,
}: Props) {
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <main
      className="estate-route-recovery"
      data-testid="estate-route-recovery"
      role="alert"
    >
      <div className="estate-route-recovery__card">
        <h1 className="estate-route-recovery__title">{title}</h1>
        <p className="estate-route-recovery__message">{message}</p>
        <div className="estate-route-recovery__actions">
          {onRetry ? (
            <button
              type="button"
              className="estate-route-recovery__btn estate-route-recovery__btn--primary"
              onClick={onRetry}
            >
              Retry
            </button>
          ) : null}
          {onReturnToEstate ? (
            <button
              type="button"
              className="estate-route-recovery__btn"
              onClick={onReturnToEstate}
            >
              Return to Estate
            </button>
          ) : null}
        </div>
        {isDev && error ? (
          <details className="estate-route-recovery__details">
            <summary>Report Error (development)</summary>
            <pre className="estate-route-recovery__error">
              {error.stack ?? error.message}
            </pre>
          </details>
        ) : null}
      </div>
    </main>
  );
}
