import {
  CalendarEvent,
  CalendarEventTime,
  RepeatType,
  Schedule,
} from "@/types/event";

export const DEFAULT_SYNC_WINDOW_PAST_DAYS = 30;
export const DEFAULT_SYNC_WINDOW_FUTURE_DAYS = 365;
export const GOOGLE_EVENT_APP_ID_KEY = "todolistcalendar2EventId";

export interface CalendarEventFormInput {
  summary: string;
  startDateTime: Date;
  endDateTime: Date;
  repeat: RepeatType;
  location?: string;
  description?: string;
}

export interface GoogleCalendarEventTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface GoogleCalendarEventResource {
  id?: string;
  etag?: string;
  status?: string;
  htmlLink?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: GoogleCalendarEventTime;
  end?: GoogleCalendarEventTime;
  recurrence?: string[];
  updated?: string;
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

export const getLocalTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo";
};

export const repeatToRecurrence = (repeat: RepeatType): string[] | undefined => {
  if (repeat === "none") {
    return undefined;
  }

  const freqMap: Record<Exclude<RepeatType, "none">, string> = {
    daily: "DAILY",
    weekly: "WEEKLY",
    monthly: "MONTHLY",
    yearly: "YEARLY",
  };

  return [`RRULE:FREQ=${freqMap[repeat]}`];
};

export const recurrenceToRepeat = (recurrence?: string[]): RepeatType => {
  const rule = recurrence?.find((entry) => entry.startsWith("RRULE:"));
  if (!rule) {
    return "none";
  }

  if (rule.includes("FREQ=DAILY")) return "daily";
  if (rule.includes("FREQ=WEEKLY")) return "weekly";
  if (rule.includes("FREQ=MONTHLY")) return "monthly";
  if (rule.includes("FREQ=YEARLY")) return "yearly";
  return "none";
};

export const getUnsupportedRecurrenceReason = (
  recurrence?: string[],
): string | undefined => {
  if (!recurrence || recurrence.length === 0) {
    return undefined;
  }

  const rule = recurrence.find((entry) => entry.startsWith("RRULE:"));
  if (!rule) {
    return "RRULE以外の繰り返し設定は表示のみ対応です";
  }

  const repeat = recurrenceToRepeat(recurrence);
  if (repeat === "none") {
    return "未対応の繰り返し頻度です";
  }

  const supportedTokens = ["FREQ", "UNTIL"];
  const tokenNames = rule
    .replace("RRULE:", "")
    .split(";")
    .map((part) => part.split("=")[0]);
  const hasUnsupportedToken = tokenNames.some(
    (token) => !supportedTokens.includes(token),
  );

  if (hasUnsupportedToken || recurrence.some((entry) => !entry.startsWith("RRULE:"))) {
    return "複雑なGoogle繰り返し設定は保持しますが、アプリ上の編集は基本繰り返しに丸めます";
  }

  return undefined;
};

export const createCalendarEventFromFormInput = (
  input: CalendarEventFormInput,
  now = new Date(),
): Omit<CalendarEvent, "id"> => {
  const recurrence = repeatToRecurrence(input.repeat);

  return removeUndefinedValues({
    type: "calendarEvent",
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: {
      dateTime: input.startDateTime,
      timeZone: getLocalTimeZone(),
    },
    end: {
      dateTime: input.endDateTime,
      timeZone: getLocalTimeZone(),
    },
    recurrence,
    status: "confirmed",
    syncState: "dirty",
    syncOrigin: "app",
    createdAt: now,
    updatedAt: now,
  });
};

export const mergeCalendarEventFormInput = (
  event: CalendarEvent,
  input: CalendarEventFormInput,
  now = new Date(),
): CalendarEvent => {
  const recurrence = repeatToRecurrence(input.repeat);

  return removeUndefinedValues({
    ...event,
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: {
      dateTime: input.startDateTime,
      timeZone: event.start.timeZone || getLocalTimeZone(),
    },
    end: {
      dateTime: input.endDateTime,
      timeZone: event.end.timeZone || getLocalTimeZone(),
    },
    recurrence,
    status: "confirmed",
    syncState: "dirty",
    syncOrigin: event.syncOrigin,
    updatedAt: now,
    deletedAt: undefined,
    unsupportedReason: undefined,
    syncError: undefined,
  });
};

export const calendarEventToSchedule = (
  event: CalendarEvent,
): Schedule | null => {
  if (event.status === "cancelled" || event.deletedAt) {
    return null;
  }

  const startTime = calendarEventTimeToDate(event.start, false);
  const endTime = calendarEventTimeToDate(event.end, true);
  if (!startTime || !endTime) {
    return null;
  }

  const repeat = recurrenceToRepeat(event.recurrence);
  const unsupportedNote = event.unsupportedReason
    ? `\n\n[同期メモ] ${event.unsupportedReason}`
    : "";

  return {
    id: event.id,
    type: "schedule",
    name: event.summary || "(無題)",
    startTime,
    endTime,
    repeat,
    repeatStartDate: startOfDay(startTime),
    repeatEndDate: getRecurrenceUntil(event.recurrence),
    location: event.location,
    memo: `${event.description || ""}${unsupportedNote}`.trim() || undefined,
    blackoutDates: [],
    googleCalendarId: event.googleCalendarId,
    googleEventId: event.googleEventId,
    unsupportedReason: event.unsupportedReason,
  };
};

export const googleEventToCalendarEvent = (
  googleEvent: GoogleCalendarEventResource,
  calendarId: string,
  localId: string,
  previous?: CalendarEvent,
  now = new Date(),
): CalendarEvent => {
  const unsupportedReason = getUnsupportedRecurrenceReason(googleEvent.recurrence);

  return removeUndefinedValues({
    id: localId,
    type: "calendarEvent",
    summary: googleEvent.summary || "(無題)",
    description: googleEvent.description,
    location: googleEvent.location,
    start: googleTimeToCalendarTime(googleEvent.start),
    end: googleTimeToCalendarTime(googleEvent.end),
    recurrence: googleEvent.recurrence,
    status: googleEvent.status === "cancelled" || googleEvent.status === "tentative"
      ? googleEvent.status
      : "confirmed",
    googleCalendarId: calendarId,
    googleEventId: googleEvent.id,
    googleEtag: googleEvent.etag,
    googleUpdatedAt: googleEvent.updated ? new Date(googleEvent.updated) : now,
    htmlLink: googleEvent.htmlLink,
    syncState: "synced",
    syncOrigin: previous?.syncOrigin || "google",
    lastSyncedAt: now,
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    unsupportedReason,
  });
};

export const calendarEventToGoogleEvent = (
  event: CalendarEvent,
): GoogleCalendarEventResource => {
  return removeUndefinedValues({
    summary: event.summary,
    description: event.description,
    location: event.location,
    status: event.status,
    start: calendarTimeToGoogleTime(event.start),
    end: calendarTimeToGoogleTime(event.end),
    recurrence: event.recurrence && event.recurrence.length > 0
      ? event.recurrence
      : undefined,
    extendedProperties: {
      private: {
        [GOOGLE_EVENT_APP_ID_KEY]: event.id,
      },
    },
  });
};

export const getAppEventIdFromGoogleEvent = (
  googleEvent: GoogleCalendarEventResource,
): string | undefined => {
  return googleEvent.extendedProperties?.private?.[GOOGLE_EVENT_APP_ID_KEY];
};

export const isCalendarEventInWindow = (
  event: CalendarEvent,
  windowStart: Date,
  windowEnd: Date,
): boolean => {
  const start = calendarEventTimeToDate(event.start, false);
  const end = calendarEventTimeToDate(event.end, true);
  if (!start || !end) {
    return false;
  }

  return start <= windowEnd && end >= windowStart;
};

export const hasGoogleEventChanged = (
  event: CalendarEvent,
  googleEvent: GoogleCalendarEventResource,
): boolean => {
  if (event.googleEtag && googleEvent.etag) {
    return event.googleEtag !== googleEvent.etag;
  }

  if (!event.googleUpdatedAt || !googleEvent.updated) {
    return true;
  }

  return event.googleUpdatedAt.getTime() !== new Date(googleEvent.updated).getTime();
};

export const removeUndefinedValues = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedValues(item)) as T;
  }

  if (value instanceof Date || value === null || typeof value !== "object") {
    return value;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .map(([key, entryValue]) => [key, removeUndefinedValues(entryValue)]);

  return Object.fromEntries(entries) as T;
};

const googleTimeToCalendarTime = (
  time?: GoogleCalendarEventTime,
): CalendarEventTime => {
  if (!time) {
    return { dateTime: new Date(), timeZone: getLocalTimeZone() };
  }

  if (time.date) {
    return removeUndefinedValues({
      date: time.date,
      timeZone: time.timeZone,
    });
  }

  return removeUndefinedValues({
    dateTime: time.dateTime ? new Date(time.dateTime) : new Date(),
    timeZone: time.timeZone || getLocalTimeZone(),
  });
};

const calendarTimeToGoogleTime = (
  time: CalendarEventTime,
): GoogleCalendarEventTime => {
  if (time.date) {
    return removeUndefinedValues({
      date: time.date,
      timeZone: time.timeZone,
    });
  }

  return removeUndefinedValues({
    dateTime: (time.dateTime || new Date()).toISOString(),
    timeZone: time.timeZone || getLocalTimeZone(),
  });
};

const calendarEventTimeToDate = (
  time: CalendarEventTime,
  isEnd: boolean,
): Date | null => {
  if (time.dateTime) {
    return new Date(time.dateTime);
  }

  if (time.date) {
    const date = new Date(`${time.date}T00:00:00`);
    if (isEnd) {
      date.setMilliseconds(date.getMilliseconds() - 1);
    }
    return date;
  }

  return null;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getRecurrenceUntil = (recurrence?: string[]): Date | null => {
  const rule = recurrence?.find((entry) => entry.startsWith("RRULE:"));
  const untilValue = rule
    ?.replace("RRULE:", "")
    .split(";")
    .find((part) => part.startsWith("UNTIL="))
    ?.replace("UNTIL=", "");

  if (!untilValue) {
    return null;
  }

  if (/^\d{8}$/.test(untilValue)) {
    return new Date(
      `${untilValue.slice(0, 4)}-${untilValue.slice(4, 6)}-${untilValue.slice(6, 8)}T00:00:00`,
    );
  }

  const parsed = new Date(untilValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
