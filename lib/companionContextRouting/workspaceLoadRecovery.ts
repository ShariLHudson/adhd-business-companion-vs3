/**
 * Lightweight workspace load recovery copy — no conversation-engine imports.
 * CompanionPageLoader must import this instead of routeCompanionFailure so
 * /companion SSR does not pull the full chat stack at module init.
 */

export const ESTATE_WORKSPACE_LOAD_RECOVERY =
  "Something got tangled for a second, but I'm still here. Give this one more moment, then we can continue.";
