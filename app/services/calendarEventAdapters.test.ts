import { describe, expect, it } from "vitest";
import {
  calendarEventToGoogleEvent,
  calendarEventToSchedule,
  createCalendarEventFromFormInput,
  googleEventToCalendarEvent,
  recurrenceToRepeat,
  repeatToRecurrence,
} from "./calendarEventAdapters";

describe("calendarEventAdapters", () => {
  it("converts RepeatType to Google RRULE", () => {
    expect(repeatToRecurrence("none")).toBeUndefined();
    expect(repeatToRecurrence("weekly")).toEqual(["RRULE:FREQ=WEEKLY"]);
    expect(recurrenceToRepeat(["RRULE:FREQ=MONTHLY"])).toBe("monthly");
  });

  it("creates an app calendar event in dirty state", () => {
    const event = createCalendarEventFromFormInput({
      summary: "打ち合わせ",
      startDateTime: new Date("2026-04-25T10:00:00+09:00"),
      endDateTime: new Date("2026-04-25T11:00:00+09:00"),
      repeat: "weekly",
      location: "会議室",
      description: "メモ",
    });

    expect(event.summary).toBe("打ち合わせ");
    expect(event.syncState).toBe("dirty");
    expect(event.recurrence).toEqual(["RRULE:FREQ=WEEKLY"]);
  });

  it("keeps the local id in Google extended properties", () => {
    const event = {
      ...createCalendarEventFromFormInput({
        summary: "予定",
        startDateTime: new Date("2026-04-25T10:00:00+09:00"),
        endDateTime: new Date("2026-04-25T11:00:00+09:00"),
        repeat: "none",
      }),
      id: "local-event-id",
    };

    const googleEvent = calendarEventToGoogleEvent(event);
    expect(googleEvent.extendedProperties?.private?.todolistcalendar2EventId)
      .toBe("local-event-id");
  });

  it("converts a Google event to display schedule", () => {
    const event = googleEventToCalendarEvent(
      {
        id: "google-id",
        etag: "etag",
        summary: "Google予定",
        start: { dateTime: "2026-04-25T01:00:00.000Z" },
        end: { dateTime: "2026-04-25T02:00:00.000Z" },
        recurrence: ["RRULE:FREQ=YEARLY"],
        updated: "2026-04-24T00:00:00.000Z",
      },
      "primary",
      "local-id",
    );

    const schedule = calendarEventToSchedule(event);
    expect(schedule?.id).toBe("local-id");
    expect(schedule?.name).toBe("Google予定");
    expect(schedule?.repeat).toBe("yearly");
  });
});
