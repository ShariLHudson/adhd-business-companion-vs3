const SESSION_KEY = "momentum-builders-recs-hidden-v1";

export function areMomentumRecommendationsHidden(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_KEY) === "1";
}

export function hideMomentumRecommendations(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, "1");
}

export function showMomentumRecommendations(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}
