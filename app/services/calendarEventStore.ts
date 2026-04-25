import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  CalendarEvent,
  CalendarEventTime,
  GoogleCalendarSyncSettings,
} from "@/types/event";
import { db } from "@/lib/firebase";
import {
  CalendarEventFormInput,
  createCalendarEventFromFormInput,
  mergeCalendarEventFormInput,
  removeUndefinedValues,
} from "@/services/calendarEventAdapters";

export const createCalendarEvent = async (
  userId: string,
  input: CalendarEventFormInput,
): Promise<CalendarEvent> => {
  const eventData = createCalendarEventFromFormInput(input);
  const ref = await addDoc(
    collection(db, "users", userId, "calendarEvents"),
    removeUndefinedValues(eventData),
  );

  return {
    ...eventData,
    id: ref.id,
  };
};

export const updateCalendarEvent = async (
  userId: string,
  eventId: string,
  input: CalendarEventFormInput,
): Promise<void> => {
  const ref = doc(db, "users", userId, "calendarEvents", eventId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    throw new Error("更新対象の予定が見つかりません");
  }

  const existing = calendarEventFromFirestore(snapshot.id, snapshot.data());
  const next = mergeCalendarEventFormInput(existing, input);
  const { id: _id, ...data } = next;
  await setDoc(ref, removeUndefinedValues(data));
};

export const markCalendarEventDeleted = async (
  userId: string,
  eventId: string,
): Promise<void> => {
  const ref = doc(db, "users", userId, "calendarEvents", eventId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    return;
  }

  const event = calendarEventFromFirestore(snapshot.id, snapshot.data());
  if (!event.googleEventId) {
    await deleteDoc(ref);
    return;
  }

  const now = new Date();
  await updateDoc(ref, {
    syncState: "deleted",
    deletedAt: now,
    updatedAt: now,
  });
};

export const getAllCalendarEvents = async (
  userId: string,
): Promise<CalendarEvent[]> => {
  const snapshot = await getDocs(collection(db, "users", userId, "calendarEvents"));
  return snapshot.docs.map((document) => {
    return calendarEventFromFirestore(document.id, document.data());
  });
};

export const createCalendarEventId = (userId: string): string => {
  return doc(collection(db, "users", userId, "calendarEvents")).id;
};

export const saveCalendarEventRecord = async (
  userId: string,
  event: CalendarEvent,
): Promise<void> => {
  const { id, ...data } = event;
  await setDoc(
    doc(db, "users", userId, "calendarEvents", id),
    removeUndefinedValues(data),
  );
};

export const removeCalendarEventRecord = async (
  userId: string,
  eventId: string,
): Promise<void> => {
  await deleteDoc(doc(db, "users", userId, "calendarEvents", eventId));
};

export const saveGoogleCalendarSyncSettings = async (
  userId: string,
  settings: GoogleCalendarSyncSettings,
): Promise<void> => {
  await setDoc(
    doc(db, "users", userId, "settings", "userSettings"),
    {
      googleCalendarSync: removeUndefinedValues({
        ...settings,
        lastSyncError: settings.lastSyncError || "",
      }),
    },
    { merge: true },
  );
};

export const calendarEventFromFirestore = (
  id: string,
  data: Record<string, unknown>,
): CalendarEvent => {
  return removeUndefinedValues({
    id,
    type: "calendarEvent",
    summary: readString(data.summary) || "(無題)",
    description: readString(data.description),
    location: readString(data.location),
    start: readCalendarEventTime(data.start),
    end: readCalendarEventTime(data.end),
    recurrence: Array.isArray(data.recurrence)
      ? data.recurrence.filter((entry): entry is string => typeof entry === "string")
      : undefined,
    status: data.status === "cancelled" || data.status === "tentative"
      ? data.status
      : "confirmed",
    googleCalendarId: readString(data.googleCalendarId),
    googleEventId: readString(data.googleEventId),
    googleEtag: readString(data.googleEtag),
    googleUpdatedAt: readDate(data.googleUpdatedAt),
    htmlLink: readString(data.htmlLink),
    syncState: data.syncState === "synced" || data.syncState === "deleted" || data.syncState === "error"
      ? data.syncState
      : "dirty",
    syncOrigin: data.syncOrigin === "google" ? "google" : "app",
    lastSyncedAt: readDate(data.lastSyncedAt),
    createdAt: readDate(data.createdAt) || new Date(),
    updatedAt: readDate(data.updatedAt) || new Date(),
    deletedAt: readDate(data.deletedAt),
    unsupportedReason: readString(data.unsupportedReason),
    syncError: readString(data.syncError),
  });
};

export const readDate = (value: unknown): Date | undefined => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return undefined;
};

const readCalendarEventTime = (value: unknown): CalendarEventTime => {
  if (!value || typeof value !== "object") {
    return {
      dateTime: new Date(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo",
    };
  }

  const record = value as Record<string, unknown>;
  return removeUndefinedValues({
    date: readString(record.date),
    dateTime: readDate(record.dateTime),
    timeZone: readString(record.timeZone),
  });
};

const readString = (value: unknown): string | undefined => {
  return typeof value === "string" && value.length > 0 ? value : undefined;
};
