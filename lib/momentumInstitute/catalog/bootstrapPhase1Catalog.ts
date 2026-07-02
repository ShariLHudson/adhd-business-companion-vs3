/**
 * Phase 1 — register drawer-wall catalog until CMS/API provider ships.
 */

import { PHASE1_INSTITUTE_CATALOG } from "../drawerWall/phase1Catalog";
import { setInstituteCatalogProvider } from "./provider";

let bootstrapped = false;

export function bootstrapPhase1InstituteCatalog(): void {
  if (bootstrapped) return;
  setInstituteCatalogProvider({
    load: () => PHASE1_INSTITUTE_CATALOG,
  });
  bootstrapped = true;
}

bootstrapPhase1InstituteCatalog();
