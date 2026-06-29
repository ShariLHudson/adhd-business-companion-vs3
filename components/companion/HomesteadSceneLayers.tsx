/**
 * Homestead scene lighting layers — same markup as the welcome living room.
 */
export function HomesteadSceneLayers() {
  return (
    <div
      className="companion-welcome-scene__life companion-welcome-scene__life--homestead"
      aria-hidden="true"
    >
      <div className="companion-welcome-scene__sunlight" />
      <div className="companion-welcome-scene__exterior-dusk" />
      <div className="companion-welcome-scene__interior-lamp" />
      <div className="companion-welcome-scene__lamplight" />
      <div className="companion-welcome-scene__porch-glow" />
      <div className="companion-welcome-scene__foliage" />
      <div className="companion-welcome-scene__rain" />
      <div className="companion-welcome-scene__snow" />
      <div className="companion-welcome-scene__holiday-lights" />
    </div>
  );
}
