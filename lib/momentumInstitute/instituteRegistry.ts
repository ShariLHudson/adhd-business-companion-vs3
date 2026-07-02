/**
 * Momentum Institute™ — estate and ecosystem registration.
 * The Institute is the Entrepreneur Development Center — not a single room.
 */

import type { MomentumInstituteDefinition } from "@/lib/sparkMomentumInstitute/types";
import { getInstituteDefinition, listDepartments } from "./catalog/provider";

export const MOMENTUM_INSTITUTE_OBJECT_ID = "momentum-institute" as const;

export const MOMENTUM_INSTITUTE_SECTION = "momentum-institute" as const;

export type InstituteRegistryMeta = {
  objectId: typeof MOMENTUM_INSTITUTE_OBJECT_ID;
  section: typeof MOMENTUM_INSTITUTE_SECTION;
  title: string;
  subtitle: string;
  tagline: string;
  departmentCount: number;
};

export function getInstituteRegistryMeta(): InstituteRegistryMeta {
  const institute = getInstituteDefinition();
  return {
    objectId: MOMENTUM_INSTITUTE_OBJECT_ID,
    section: MOMENTUM_INSTITUTE_SECTION,
    title: institute.title,
    subtitle: institute.subtitle,
    tagline: institute.tagline,
    departmentCount: listDepartments().length,
  };
}

export function instituteEstateInvitation(
  institute: MomentumInstituteDefinition = getInstituteDefinition(),
): string {
  return (
    `${institute.title} is where entrepreneurs grow — not just learn. ` +
    "Would you like to explore the Entrepreneur Development Center?"
  );
}
