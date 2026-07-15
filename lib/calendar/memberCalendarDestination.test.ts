/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  MEMBER_CALENDAR_EXTERNAL_URLS,
  rememberPreferredCalendarProvider,
  resolveMemberCalendarOpenTarget,
} from "@/lib/calendar/memberCalendarDestination";
import type { ConnectedCalendarsSnapshot } from "@/lib/connectedCalendars";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function snap(
  connections: ConnectedCalendarsSnapshot["connections"],
): ConnectedCalendarsSnapshot {
  return {
    googleOAuthConfigured: true,
    providers: [],
    connections,
  };
}

describe("resolveMemberCalendarOpenTarget", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("asks to connect when no calendars are linked", () => {
    expect(resolveMemberCalendarOpenTarget(snap([]))).toEqual({
      kind: "connect",
    });
  });

  it("opens Google when only Google is connected", () => {
    const target = resolveMemberCalendarOpenTarget(
      snap([
        {
          id: "google-primary",
          providerId: "google",
          label: "Google Calendar",
          connected: true,
        },
      ]),
    );
    expect(target).toEqual({
      kind: "external",
      provider: "google",
      label: "Google Calendar",
      url: MEMBER_CALENDAR_EXTERNAL_URLS.google,
    });
  });

  it("opens Outlook when only Outlook is connected", () => {
    const target = resolveMemberCalendarOpenTarget(
      snap([
        {
          id: "outlook-primary",
          providerId: "outlook",
          label: "Outlook Calendar",
          connected: true,
        },
      ]),
    );
    expect(target.kind).toBe("external");
    if (target.kind === "external") {
      expect(target.provider).toBe("outlook");
      expect(target.url).toBe(MEMBER_CALENDAR_EXTERNAL_URLS.outlook);
    }
  });

  it("uses remembered preference when both are connected", () => {
    rememberPreferredCalendarProvider("outlook");
    const target = resolveMemberCalendarOpenTarget(
      snap([
        {
          id: "google-primary",
          providerId: "google",
          label: "Google Calendar",
          connected: true,
        },
        {
          id: "outlook-primary",
          providerId: "outlook",
          label: "Outlook Calendar",
          connected: true,
        },
      ]),
    );
    expect(target.kind).toBe("external");
    if (target.kind === "external") {
      expect(target.provider).toBe("outlook");
    }
  });

  it("asks which calendar when both are connected and no preference", () => {
    const target = resolveMemberCalendarOpenTarget(
      snap([
        {
          id: "google-primary",
          providerId: "google",
          label: "Google Calendar",
          connected: true,
        },
        {
          id: "outlook-primary",
          providerId: "outlook",
          label: "Outlook Calendar",
          connected: true,
        },
      ]),
    );
    expect(target).toEqual({
      kind: "choose",
      providers: ["google", "outlook"],
    });
  });
});

describe("Calendar menu opens member calendar wiring", () => {
  it("openCalendarCore resolves the member's connected calendar", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("resolveMemberCalendarOpenTarget");
    expect(client).toContain("openMemberCalendarExternal");
    expect(client).toContain("fetchConnectedCalendarsSnapshot");
    const fn = client.match(
      /function openCalendarCore\(\) \{[\s\S]*?\n  \}/,
    )?.[0];
    expect(fn).toBeTruthy();
    expect(fn).toContain('openStandaloneFocusSectionCore("calendar")');
    expect(fn).toContain("openMemberCalendarExternal");
  });

  it("Calendar area exposes Open my calendar for the connected provider", () => {
    const area = readFileSync(
      resolve(process.cwd(), "components/companion/PlanMyDayCalendarArea.tsx"),
      "utf8",
    );
    expect(area).toContain('data-testid="open-my-calendar"');
    expect(area).toContain("openMemberCalendarExternal");
    expect(area).toContain("My Calendar");
  });
});
