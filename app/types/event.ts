// 繰り返しの種類を定義
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// イベントの種類を定義
export type EventType = 'schedule' | 'task';

export type CalendarEventStatus = 'confirmed' | 'tentative' | 'cancelled';

export type CalendarEventSyncState = 'dirty' | 'synced' | 'deleted' | 'error';

export type CalendarEventSyncOrigin = 'app' | 'google';

export interface CalendarEventTime {
  date?: string;
  dateTime?: Date;
  timeZone?: string;
}

// Google Calendar Eventに寄せた予定の永続化モデル
export interface CalendarEvent {
  id: string;
  type: 'calendarEvent';
  summary: string;
  start: CalendarEventTime;
  end: CalendarEventTime;
  status: CalendarEventStatus;
  description?: string;
  location?: string;
  recurrence?: string[];
  googleCalendarId?: string;
  googleEventId?: string;
  googleEtag?: string;
  googleUpdatedAt?: Date;
  htmlLink?: string;
  syncState: CalendarEventSyncState;
  syncOrigin: CalendarEventSyncOrigin;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  unsupportedReason?: string;
  syncError?: string;
}

// 予定（スケジュール）の型定義
export interface Schedule {
  id: string;
  type: 'schedule';
  name: string;
  startTime: Date;
  endTime: Date;
  repeat: RepeatType;
  repeatStartDate: Date;
  repeatEndDate: Date | null;
  location?: string;
  memo?: string;
  blackoutDates?: Date[];
  googleCalendarId?: string;
  googleEventId?: string;
  unsupportedReason?: string;
}

// タスクの型定義
export interface Task {
  id: string;
  type: 'task';
  name: string;
  deadline: Date;
  estimatedTime: number; // 所要時間（時間単位）
  memo?: string;
}

// イベントのユニオン型
export type Event = Schedule | Task; 

// 設定の型定義
export interface Settings {
  availableTimePerDay: number;
  dateTakeIntoAccount: Date;
  availableTimePerUnscheduledDay: number;
  googleCalendarSync?: GoogleCalendarSyncSettings;
}

export interface GoogleCalendarSyncSettings {
  calendarId?: string;
  calendarSummary?: string;
  lastSyncedAt?: Date;
  syncWindowPastDays: number;
  syncWindowFutureDays: number;
  lastSyncError?: string;
}

// 一時的なタスクの型定義
export interface TempTask {
  id: string;
  name: string;
}
