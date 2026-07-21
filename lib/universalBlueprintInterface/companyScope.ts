/**
 * Company Blueprint save — scope / authorization gate for the interface.
 */

export type CompanyBlueprintAuth = {
  hasCompanyScope: boolean;
  canSaveCompanyBlueprints: boolean;
  reasonIfDenied?: string;
};

/**
 * Default: company Blueprints require an active company scope.
 * Hosts may pass a richer auth context later without changing UWE.
 */
export function resolveCompanyBlueprintAuth(input?: {
  companyId?: string | null;
  role?: string | null;
}): CompanyBlueprintAuth {
  const companyId = input?.companyId?.trim();
  if (!companyId) {
    return {
      hasCompanyScope: false,
      canSaveCompanyBlueprints: false,
      reasonIfDenied:
        "Company Blueprints need an active company space. You can still save a Personal Blueprint.",
    };
  }

  const role = (input?.role ?? "member").toLowerCase();
  const allowed = ["owner", "admin", "editor", "member"].includes(role);
  if (!allowed) {
    return {
      hasCompanyScope: true,
      canSaveCompanyBlueprints: false,
      reasonIfDenied:
        "You don’t have permission to save Company Blueprints in this space.",
    };
  }

  return {
    hasCompanyScope: true,
    canSaveCompanyBlueprints: true,
  };
}
