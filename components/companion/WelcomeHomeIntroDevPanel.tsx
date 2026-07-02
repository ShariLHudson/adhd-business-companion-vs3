"use client";

type Props = {
  phase: string;
  screenReady: boolean;
  introActive: boolean;
  voiceState: string;
  audioUnlocked: boolean;
  walkPaused: boolean;
  cinematicProgress: number;
  scale: number;
  visitorKind: string;
};

function showWelcomeIntroDevPanel(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "development") return true;
  try {
    return localStorage.getItem("spark-welcome-intro-dev") === "1";
  } catch {
    return false;
  }
}

export function WelcomeHomeIntroDevPanel(props: Props) {
  if (!showWelcomeIntroDevPanel()) return null;

  return (
    <aside
      className="welcome-home-page__dev-panel"
      data-testid="welcome-home-intro-dev"
      aria-label="Welcome intro developer status"
    >
      <p className="welcome-home-page__dev-panel-title">Welcome intro (dev)</p>
      <dl>
        <div>
          <dt>visitor</dt>
          <dd>{props.visitorKind}</dd>
        </div>
        <div>
          <dt>phase</dt>
          <dd>{props.phase}</dd>
        </div>
        <div>
          <dt>screen ready</dt>
          <dd>{props.screenReady ? "yes" : "no"}</dd>
        </div>
        <div>
          <dt>intro active</dt>
          <dd>{props.introActive ? "yes" : "no"}</dd>
        </div>
        <div>
          <dt>voice</dt>
          <dd>{props.voiceState}</dd>
        </div>
        <div>
          <dt>audio unlocked</dt>
          <dd>{props.audioUnlocked ? "yes" : "no"}</dd>
        </div>
        <div>
          <dt>walk paused</dt>
          <dd>{props.walkPaused ? "yes" : "no"}</dd>
        </div>
        <div>
          <dt>dolly progress</dt>
          <dd>{props.cinematicProgress.toFixed(3)}</dd>
        </div>
        <div>
          <dt>image scale</dt>
          <dd>{props.scale.toFixed(3)}</dd>
        </div>
      </dl>
      <p className="welcome-home-page__dev-panel-hint">
        localStorage spark-welcome-intro-dev=1 in production
      </p>
    </aside>
  );
}
