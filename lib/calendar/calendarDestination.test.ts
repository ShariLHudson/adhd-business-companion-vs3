/**
 * Welcome Home → My Workday → Calendar destination contract.
 * Connected Calendars room — never Momentum Appointments or Plan My Day shell.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CALENDAR_HOW_DO_I_COPY } from "@/components/companion/CalendarRoomPanel";

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("Calendar My Workday destination", () => {
  const client = read("app/companion/CompanionPageClient.tsx");
  const menu = read(
    "components/companion/estate/EstateRoomExperienceMenu.tsx",
  );
  const panel = read("components/companion/CalendarRoomPanel.tsx");
  const area = read("components/companion/PlanMyDayCalendarArea.tsx");
  const planPanel = read("components/companion/PlanMyDayPanel.tsx");

  it("wires My Workday Calendar to openCalendarCore — not Plan My Day or time-block", () => {
    expect(menu).toMatch(/data-testid="estate-open-calendar"/);
    // EstateTopRightChrome (Welcome Home menu) — Connected Calendars room
    expect(client).toMatch(/onOpenCalendar=\{\(\) => openCalendarCore\(\)\}/);
    expect(client).not.toMatch(
      /onOpenCalendar=\{\(\) => openPlanMyDayCore\(\{ area: "calendar" \}\)\}/,
    );
    // Welcome Home Calendar prop must call openCalendarCore only
    const calendarProp = client.match(
      /onOpenCalendar=\{\(\) => openCalendarCore\(\)\}/,
    )?.[0];
    expect(calendarProp).toBe("onOpenCalendar={() => openCalendarCore()}");
  });

  it("openCalendarCore opens dedicated calendar room — not Momentum Appointments, Plan My Day, Reminders, Rhythms, or Settings", () => {
    const fn = client.match(
      /function openCalendarCore\(\) \{[\s\S]*?\n  \}/,
    )?.[0];
    expect(fn).toBeTruthy();
    expect(fn).toContain('openStandaloneFocusSectionCore("calendar")');
    expect(fn).toContain('noteWorkspaceOpened("calendar", "standalone_room")');
    expect(fn).not.toContain("time-block");
    expect(fn).not.toContain("openPlanMyDayCore");
    expect(fn).not.toContain("openRhythmsCore");
    expect(fn).not.toContain("openRemindersCore");
    expect(fn).not.toContain("openHowDoISettings");
    expect(fn).not.toContain("TimeBlockPanel");
  });

  it("case calendar and applyMyDayAndWorkOpener calendar use openCalendarCore", () => {
    expect(client).toMatch(
      /case "calendar":\s*\n\s*openCalendarCore\(\);/,
    );
  });

  it("dedicated Calendar room title is Calendar and embeds PlanMyDayCalendarArea", () => {
    expect(panel).toMatch(/data-testid="calendar-title"/);
    expect(panel).toMatch(/>\s*Calendar\s*</);
    expect(panel).toContain("PlanMyDayCalendarArea");
    expect(panel).toContain("hideHeading");
    expect(panel).toContain('authReturnPath="/companion?section=calendar"');
    expect(panel).toContain("Previous Screen");
    expect(panel).toContain("app-back-button");
    expect(CALENDAR_HOW_DO_I_COPY).toBe(
      "Connect your calendars and see your upcoming events in one place.",
    );
  });

  it("PlanMyDayCalendarArea keeps Google and Outlook controls and supports hideHeading", () => {
    expect(area).toContain("hideHeading");
    expect(area).toContain('data-testid="connect-google-calendar"');
    expect(area).toContain('data-testid="connect-outlook-calendar"');
    expect(area).toContain('data-testid="connected-calendars"');
    expect(area).toContain("connectOutlookCalendarLocal");
    expect(area).toMatch(/hideHeading \? null : \(/);
  });

  it("Calendar room render uses CalendarRoomPanel — not TimeBlockPanel for calendar section", () => {
    expect(client).toMatch(
      /activeSection === "calendar" && \(\s*\n\s*<CalendarRoomPanel/,
    );
    expect(client).toContain("CalendarRoomPanel");
  });

  it("Plan My Day Open calendar opens Connected Calendars room — not time-block", () => {
    const planMyDayMount = client.match(
      /activeSection === "plan-my-day" && \(\s*\n\s*<PlanMyDayPanel[\s\S]*?\n\s*\/>\s*\n\s*\)\}/,
    )?.[0];
    expect(planMyDayMount).toBeTruthy();
    expect(planMyDayMount).toContain(
      "onOpenCalendar={() => openCalendarCore()}",
    );
    expect(planMyDayMount).not.toMatch(
      /onOpenCalendar=\{\(\) =>\s*openWorkspaceBesideChatCore\(\s*"time-block"/,
    );
    expect(planPanel).toContain("onOpenCalendar");
    expect(planPanel).toContain("onOpenEvent");
    expect(area).toContain("planning-calendar-event-");
    // Legacy time-block deep links redirect — never mount TimeBlockPanel live.
    expect(client).toMatch(
      /activeSection === "time-block"[\s\S]*?<LegacyMomentumAppointmentRedirect/,
    );
    expect(client).not.toContain("<TimeBlockPanel");
  });

  it("does not touch authentication or login routes in calendar room files", () => {
    expect(panel).not.toMatch(/\/companion\/login/);
    expect(panel).not.toMatch(/signOut|getUser|supabase\.auth/i);
    expect(area).not.toMatch(/\/companion\/login/);
  });
});
