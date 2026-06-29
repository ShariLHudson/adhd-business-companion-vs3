"use client";

import { SidebarVictorianLampPostSvg } from "./SidebarVictorianLampPostSvg";

/** Victorian cast-iron lamp post — matches sidebar reference art. */
export function HomesteadLampPost() {
  return (
    <div className="homestead-lamp-post" aria-hidden="true">
      <SidebarVictorianLampPostSvg idPrefix="homestead-lamp-post" />
    </div>
  );
}
