import {
  calendarEventToGoogleEvent,
  DEFAULT_SYNC_WINDOW_FUTURE_DAYS,
  DEFAULT_SYNC_WINDOW_PAST_DAYS,
  getAppEventIdFromGoogleEvent,
  googleEventToCalendarEvent,
  hasGoogleEventChanged,
  isCalendarEventInWindow,
} from "@/services/calendarEventAdapters";
import {
  deleteGoogleEvent,
  insertGoogleEvent,
  listGoogleEvents,
  patchGoogleEvent,
} from "@/services/googleCalendarApi";
import {
  createCalendarEventId,
  getAllCalendarEvents,
  removeCalendarEventRecord,
  saveCalendarEventRecord,
  saveGoogleCalendarSyncSettings,
} from "@/services/calendarEventStore";
import { CalendarEvent, GoogleCalendarSyncSettings } from "@/types/event";

export interface GoogleCalendarSyncResult {
  importedFromGoogle: number;
  updatedFromGoogle: number;
  deletedFromGoogle: number;
  insertedToGoogle: number;
  updatedToGoogle: number;
  deletedToGoogle: number;
  conflictsResolvedByGoogle: number;
  skipped: number;
  errors: string[];
  startedAt: Date;
  finishedAt: Date;
}

interface SyncGoogleCalendarParams {
  userId: string;
  accessToken: string;
  calendarId: string;
  calendarSummary?: string;
  syncWindowPastDays?: number;
  syncWindowFutureDays?: number;
}

export const syncGoogleCalendar = async ({
  userId,
  accessToken,
  calendarId,
  calendarSummary,
  syncWindowPastDays = DEFAULT_SYNC_WINDOW_PAST_DAYS,
  syncWindowFutureDays = DEFAULT_SYNC_WINDOW_FUTURE_DAYS,
}: SyncGoogleCalendarParams): Promise<GoogleCalendarSyncResult> => {
  const startedAt = new Date();
  const windowStart = startOfDay(addDays(startedAt, -syncWindowPastDays));
  const windowEnd = endOfDay(addDays(startedAt, syncWindowFutureDays));
  const result: GoogleCalendarSyncResult = {
    importedFromGoogle: 0,
    updatedFromGoogle: 0,
    deletedFromGoogle: 0,
    insertedToGoogle: 0,
    updatedToGoogle: 0,
    deletedToGoogle: 0,
    conflictsResolvedByGoogle: 0,
    skipped: 0,
    errors: [],
    startedAt,
    finishedAt: startedAt,
  };

  const localEvents = await getAllCalendarEvents(userId);
  const localById = new Map(localEvents.map((event) => [event.id, event]));
  const localByGoogleEventId = new Map(
    localEvents
      .filter((event) => event.googleCalendarId === calendarId && event.googleEventId)
      .map((event) => [event.googleEventId as string, event]),
  );

  const googleEvents = await listGoogleEvents(
    accessToken,
    calendarId,
    windowStart,
    windowEnd,
  );
  const googleById = new Map(
    googleEvents
      .filter((event) => event.id)
      .map((event) => [event.id as string, event]),
  );

  for (const googleEvent of googleEvents) {
    const extendedLocalId = getAppEventIdFromGoogleEvent(googleEvent);
    const existing = googleEvent.id
      ? localByGoogleEventId.get(googleEvent.id) || (extendedLocalId ? localById.get(extendedLocalId) : undefined)
      : undefined;

    if (googleEvent.status === "cancelled") {
      if (existing) {
        await removeCalendarEventRecord(userId, existing.id);
        result.deletedFromGoogle += 1;
      }
      continue;
    }

    const localId = existing?.id || extendedLocalId || createCalendarEventId(userId);
    const nextEvent = googleEventToCalendarEvent(
      googleEvent,
      calendarId,
      localId,
      existing,
      new Date(),
    );

    if (!existing) {
      await saveCalendarEventRecord(userId, nextEvent);
      result.importedFromGoogle += 1;
      continue;
    }

    if (
      existing.syncState === "dirty" &&
      hasGoogleEventChanged(existing, googleEvent)
    ) {
      await saveCalendarEventRecord(userId, nextEvent);
      result.conflictsResolvedByGoogle += 1;
      continue;
    }

    if (hasGoogleEventChanged(existing, googleEvent) || existing.syncState !== "synced") {
      await saveCalendarEventRecord(userId, nextEvent);
      result.updatedFromGoogle += 1;
    }
  }

  const latestLocalEvents = await getAllCalendarEvents(userId);
  for (const localEvent of latestLocalEvents) {
    if (localEvent.googleCalendarId && localEvent.googleCalendarId !== calendarId) {
      result.skipped += 1;
      continue;
    }

    if (localEvent.syncState === "deleted" || localEvent.deletedAt) {
      await deleteLocalAndGoogleEvent(
        accessToken,
        calendarId,
        userId,
        localEvent,
        result,
      );
      continue;
    }

    if (!isCalendarEventInWindow(localEvent, windowStart, windowEnd)) {
      result.skipped += 1;
      continue;
    }

    if (localEvent.googleEventId) {
      const googleEvent = googleById.get(localEvent.googleEventId);
      if (
        localEvent.syncState === "dirty" &&
        googleEvent &&
        hasGoogleEventChanged(localEvent, googleEvent)
      ) {
        const nextEvent = googleEventToCalendarEvent(
          googleEvent,
          calendarId,
          localEvent.id,
          localEvent,
          new Date(),
        );
        await saveCalendarEventRecord(userId, nextEvent);
        result.conflictsResolvedByGoogle += 1;
        continue;
      }

      if (localEvent.syncState !== "dirty" && localEvent.syncState !== "error") {
        continue;
      }

      try {
        const updatedGoogleEvent = await patchGoogleEvent(
          accessToken,
          calendarId,
          localEvent.googleEventId,
          calendarEventToGoogleEvent(localEvent),
        );
        await saveCalendarEventRecord(
          userId,
          googleEventToCalendarEvent(
            updatedGoogleEvent,
            calendarId,
            localEvent.id,
            localEvent,
            new Date(),
          ),
        );
        result.updatedToGoogle += 1;
      } catch (error) {
        await saveCalendarEventRecord(userId, markSyncError(localEvent, error));
        result.errors.push(toErrorMessage(error));
      }
      continue;
    }

    if (localEvent.syncState !== "dirty" && localEvent.syncState !== "error") {
      continue;
    }

    try {
      const insertedGoogleEvent = await insertGoogleEvent(
        accessToken,
        calendarId,
        calendarEventToGoogleEvent(localEvent),
      );
      await saveCalendarEventRecord(
        userId,
        googleEventToCalendarEvent(
          insertedGoogleEvent,
          calendarId,
          localEvent.id,
          localEvent,
          new Date(),
        ),
      );
      result.insertedToGoogle += 1;
    } catch (error) {
      await saveCalendarEventRecord(userId, markSyncError(localEvent, error));
      result.errors.push(toErrorMessage(error));
    }
  }

  result.finishedAt = new Date();
  const nextSettings: GoogleCalendarSyncSettings = {
    calendarId,
    calendarSummary,
    lastSyncedAt: result.finishedAt,
    syncWindowPastDays,
    syncWindowFutureDays,
    lastSyncError: result.errors.length > 0 ? result.errors.join("\n") : undefined,
  };
  await saveGoogleCalendarSyncSettings(userId, nextSettings);

  return result;
};

const deleteLocalAndGoogleEvent = async (
  accessToken: string,
  calendarId: string,
  userId: string,
  localEvent: CalendarEvent,
  result: GoogleCalendarSyncResult,
): Promise<void> => {
  try {
    if (localEvent.googleEventId) {
      await deleteGoogleEvent(accessToken, calendarId, localEvent.googleEventId);
      result.deletedToGoogle += 1;
    }
    await removeCalendarEventRecord(userId, localEvent.id);
  } catch (error) {
    await saveCalendarEventRecord(userId, markSyncError(localEvent, error));
    result.errors.push(toErrorMessage(error));
  }
};

const markSyncError = (
  event: CalendarEvent,
  error: unknown,
): CalendarEvent => {
  return {
    ...event,
    syncState: "error",
    syncError: toErrorMessage(error),
    updatedAt: new Date(),
  };
};

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};
