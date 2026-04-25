import { GoogleCalendarEventResource } from "@/services/calendarEventAdapters";

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

export interface GoogleCalendarListEntry {
  id: string;
  summary: string;
  primary?: boolean;
  accessRole?: "none" | "freeBusyReader" | "reader" | "writer" | "owner";
}

interface GoogleCalendarListResponse {
  items?: GoogleCalendarListEntry[];
}

interface GoogleCalendarEventsResponse {
  items?: GoogleCalendarEventResource[];
}

export const listGoogleCalendars = async (
  accessToken: string,
): Promise<GoogleCalendarListEntry[]> => {
  const response = await requestGoogleCalendar<GoogleCalendarListResponse>(
    accessToken,
    "/users/me/calendarList",
  );

  return (response.items || []).filter((calendar) => {
    return calendar.accessRole === "owner" || calendar.accessRole === "writer";
  });
};

export const listGoogleEvents = async (
  accessToken: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date,
): Promise<GoogleCalendarEventResource[]> => {
  const params = new URLSearchParams({
    singleEvents: "false",
    showDeleted: "true",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    maxResults: "2500",
  });

  const response = await requestGoogleCalendar<GoogleCalendarEventsResponse>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
  );

  return response.items || [];
};

export const insertGoogleEvent = async (
  accessToken: string,
  calendarId: string,
  event: GoogleCalendarEventResource,
): Promise<GoogleCalendarEventResource> => {
  return requestGoogleCalendar<GoogleCalendarEventResource>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      body: JSON.stringify(event),
    },
  );
};

export const patchGoogleEvent = async (
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: GoogleCalendarEventResource,
): Promise<GoogleCalendarEventResource> => {
  return requestGoogleCalendar<GoogleCalendarEventResource>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(event),
    },
  );
};

export const deleteGoogleEvent = async (
  accessToken: string,
  calendarId: string,
  eventId: string,
): Promise<void> => {
  await requestGoogleCalendar<void>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      ignoreNotFound: true,
    },
  );
};

interface GoogleCalendarRequestInit extends RequestInit {
  ignoreNotFound?: boolean;
}

const requestGoogleCalendar = async <T>(
  accessToken: string,
  path: string,
  init: GoogleCalendarRequestInit = {},
): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  if (init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (init.ignoreNotFound && response.status === 404) {
    return undefined as T;
  }

  if (!response.ok) {
    let message = `Google Calendar API error: ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody.error?.message || message;
    } catch {
      // JSONでないエラー本文は既定メッセージを使う。
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};
