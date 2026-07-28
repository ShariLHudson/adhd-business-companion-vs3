/**
 * Estate Navigation Intelligence.
 *
 * ROUTING ROLE (EC-002.1/EC-002.3): `helper`. This package resolves member
 * intent into navigation *decisions* (`EstateNavigationDecision`), adapts them
 * to *place resolutions* (`EstatePlaceResolution`), validates target liveness,
 * and formats prompts. It returns data objects — it never opens a destination,
 * finalizes a route, bypasses `resolveFrictionlessAction`, or overrides an
 * Estate Brain decision. The primary path
 * (`resolveFrictionlessAction` → Estate Brain → shared shell execution) owns and
 * executes navigation downstream; `routeValidation` uses `goToPlace` only as a
 * read-only resolvability check ("build navigation metadata without mutating chat").
 * @see lib/estateBrain/routingOwnershipContract.ts
 */

export * from "./types";
export * from "./routeValidation";
export * from "./ambiguousLocations";
export * from "./formatNavigationResponse";
export * from "./resolveEstateNavigationIntent";
export * from "./bridge";
