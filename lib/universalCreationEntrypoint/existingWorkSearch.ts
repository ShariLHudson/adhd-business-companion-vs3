/**
 * 055 — Search for existing Creation work before creating anything.
 */

import { resolveLargerCreation } from "@/lib/creationEcosystem";
import {
  getActiveEventRecord,
  getEventRecord,
  listEventRecords,
} from "@/lib/eventsIntelligence/eventRecordStore";
import {
  listEventAssetInstances,
  resolveEventAssetDefinition,
} from "@/lib/eventsIntelligence/eventAssetRegistry";
import type { ExistingWorkMatch } from "./types";

/**
 * Locate existing Creation Record / workspace / asset before spawning new work.
 */
export function searchExistingCreationWork(hints: {
  userText?: string;
  creationId?: string | null;
  eventRecordId?: string | null;
  assetTypeId?: string | null;
}): ExistingWorkMatch | null {
  if (hints.eventRecordId) {
    const event = getEventRecord(hints.eventRecordId);
    if (event) {
      return {
        creationRecordId: event.canonicalWorkId || event.id,
        workspaceId: event.id,
        eventRecordId: event.id,
        projectHomeId: event.projectHomeId,
        title: event.title,
        matchKind: "active_event",
      };
    }
  }

  if (hints.creationId) {
    const creation = resolveLargerCreation({
      creationId: hints.creationId,
      preferActiveEvent: false,
    });
    if (creation) {
      return {
        creationRecordId: creation.creationId,
        workspaceId: creation.eventRecord?.id ?? creation.creationId,
        eventRecordId: creation.eventRecord?.id ?? null,
        projectHomeId: creation.projectHomeId,
        title: creation.title,
        matchKind: "creation_ecosystem",
      };
    }
  }

  const active = getActiveEventRecord();
  if (active) {
    return {
      creationRecordId: active.canonicalWorkId || active.id,
      workspaceId: active.id,
      eventRecordId: active.id,
      projectHomeId: active.projectHomeId,
      title: active.title,
      matchKind: "active_event",
    };
  }

  const creation = resolveLargerCreation({ preferActiveEvent: true });
  if (creation?.eventRecord || creation?.canonicalWork) {
    return {
      creationRecordId: creation.creationId,
      workspaceId: creation.eventRecord?.id ?? creation.creationId,
      eventRecordId: creation.eventRecord?.id ?? null,
      projectHomeId: creation.projectHomeId,
      title: creation.title,
      matchKind: creation.eventRecord
        ? "active_event"
        : "canonical_work",
    };
  }

  // Text match against open events (purpose/audience/title)
  const text = (hints.userText ?? "").toLowerCase();
  if (text) {
    const listed = listEventRecords().filter(
      (r) =>
        r.runtimeState !== "COMPLETED" &&
        r.runtimeState !== "CANCELED",
    );
    const byKeyword = listed.find((r) => {
      const blob =
        `${r.title} ${r.purpose} ${r.audience} ${r.eventTypeLabel}`.toLowerCase();
      if (/\badhd\b/.test(text) && /\badhd\b/.test(blob)) return true;
      if (/\bworkshop\b/.test(text) && r.eventType === "workshop") return true;
      if (/\bretreat\b/.test(text) && r.eventType === "retreat") return true;
      if (/\bconference\b/.test(text) && r.eventType === "conference")
        return true;
      return false;
    });
    if (byKeyword) {
      return {
        creationRecordId: byKeyword.canonicalWorkId || byKeyword.id,
        workspaceId: byKeyword.id,
        eventRecordId: byKeyword.id,
        projectHomeId: byKeyword.projectHomeId,
        title: byKeyword.title,
        matchKind: "alias",
      };
    }

    if (hints.assetTypeId) {
      for (const r of listed) {
        const inst = listEventAssetInstances(r.id).find(
          (i) =>
            i.assetTypeId === hints.assetTypeId && i.status !== "archived",
        );
        if (inst) {
          return {
            creationRecordId: r.canonicalWorkId || r.id,
            workspaceId: r.id,
            eventRecordId: r.id,
            projectHomeId: r.projectHomeId,
            title: r.title,
            matchKind: "asset_instance",
          };
        }
      }
    }
  }

  return null;
}

/** Detect asset-first requests: "create my workshop workbook / landing page" */
export function detectAssetEntryHint(userText: string): {
  assetTypeId: string | null;
  sectionHint: string | null;
} {
  const t = userText.trim().toLowerCase();
  if (!t) return { assetTypeId: null, sectionHint: null };

  const candidates: Array<{ re: RegExp; id: string; section: string }> = [
    { re: /\blanding page\b/, id: "landing_page", section: "marketing" },
    { re: /\bworkbook\b/, id: "attendee_workbook", section: "agenda" },
    { re: /\bagenda\b/, id: "agenda", section: "agenda" },
    { re: /\bbudget\b/, id: "event_budget", section: "budget" },
    {
      re: /\bconfirmation email\b|\bregistration confirmation\b/,
      id: "registration_confirmation_email",
      section: "registration",
    },
    { re: /\bspeaker packet\b/, id: "speaker_packet", section: "speakers" },
    { re: /\brun of show\b/, id: "run_of_show", section: "run_of_show" },
    { re: /\bfeedback survey\b|\bsurvey\b/, id: "feedback_survey", section: "measurement" },
  ];

  for (const c of candidates) {
    if (c.re.test(t)) {
      const def = resolveEventAssetDefinition(c.id);
      if (def) return { assetTypeId: def.assetTypeId, sectionHint: c.section };
      return { assetTypeId: c.id, sectionHint: c.section };
    }
  }

  return { assetTypeId: null, sectionHint: null };
}
