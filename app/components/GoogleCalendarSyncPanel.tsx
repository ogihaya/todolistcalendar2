"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getGoogleCalendarAccessToken } from "@/services/googleAuth";
import {
  GoogleCalendarListEntry,
  listGoogleCalendars,
} from "@/services/googleCalendarApi";
import { syncGoogleCalendar } from "@/services/googleCalendarSync";
import { saveGoogleCalendarSyncSettings } from "@/services/calendarEventStore";
import {
  DEFAULT_SYNC_WINDOW_FUTURE_DAYS,
  DEFAULT_SYNC_WINDOW_PAST_DAYS,
} from "@/services/calendarEventAdapters";
import { GoogleCalendarSyncSettings } from "@/types/event";

interface GoogleCalendarSyncPanelProps {
  settings?: GoogleCalendarSyncSettings;
}

export default function GoogleCalendarSyncPanel({
  settings,
}: GoogleCalendarSyncPanelProps) {
  const [calendars, setCalendars] = useState<GoogleCalendarListEntry[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(
    settings?.calendarId || "",
  );
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCalendarId(settings?.calendarId || "");
  }, [settings?.calendarId]);

  const selectedCalendar = calendars.find((calendar) => {
    return calendar.id === selectedCalendarId;
  });

  const handleLoadCalendars = async () => {
    setIsLoadingCalendars(true);
    setMessage("Google Calendarの認可を確認しています...");

    try {
      const accessToken = await getGoogleCalendarAccessToken();
      const writableCalendars = await listGoogleCalendars(accessToken);
      setCalendars(writableCalendars);

      const defaultCalendar =
        writableCalendars.find((calendar) => calendar.id === settings?.calendarId) ||
        writableCalendars.find((calendar) => calendar.primary) ||
        writableCalendars[0];
      setSelectedCalendarId(defaultCalendar?.id || "");
      setMessage(
        writableCalendars.length > 0
          ? "同期先カレンダーを選択できます"
          : "書き込み可能なカレンダーが見つかりません",
      );
    } catch (error) {
      setMessage(toErrorMessage(error));
    } finally {
      setIsLoadingCalendars(false);
    }
  };

  const handleSaveCalendar = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !selectedCalendarId) {
      setMessage("ログインして同期先カレンダーを選択してください");
      return;
    }

    await saveGoogleCalendarSyncSettings(userId, {
      calendarId: selectedCalendarId,
      calendarSummary: selectedCalendar?.summary || settings?.calendarSummary,
      lastSyncedAt: settings?.lastSyncedAt,
      syncWindowPastDays: settings?.syncWindowPastDays || DEFAULT_SYNC_WINDOW_PAST_DAYS,
      syncWindowFutureDays:
        settings?.syncWindowFutureDays || DEFAULT_SYNC_WINDOW_FUTURE_DAYS,
      lastSyncError: settings?.lastSyncError,
    });
    setMessage("同期先カレンダーを保存しました");
  };

  const handleSync = async () => {
    const userId = auth.currentUser?.uid;
    const calendarId = selectedCalendarId || settings?.calendarId;
    if (!userId || !calendarId) {
      setMessage("ログインして同期先カレンダーを選択してください");
      return;
    }

    setIsSyncing(true);
    setMessage("Google Calendarと同期しています...");

    try {
      const accessToken = await getGoogleCalendarAccessToken();
      const result = await syncGoogleCalendar({
        userId,
        accessToken,
        calendarId,
        calendarSummary: selectedCalendar?.summary || settings?.calendarSummary,
        syncWindowPastDays:
          settings?.syncWindowPastDays || DEFAULT_SYNC_WINDOW_PAST_DAYS,
        syncWindowFutureDays:
          settings?.syncWindowFutureDays || DEFAULT_SYNC_WINDOW_FUTURE_DAYS,
      });

      setMessage(
        [
          `同期完了: Googleから取込${result.importedFromGoogle}件`,
          `Google更新反映${result.updatedFromGoogle}件`,
          `Googleへ作成${result.insertedToGoogle}件`,
          `Googleへ更新${result.updatedToGoogle}件`,
          `削除${result.deletedFromGoogle + result.deletedToGoogle}件`,
          `競合解決${result.conflictsResolvedByGoogle}件`,
          result.errors.length > 0 ? `エラー${result.errors.length}件` : "",
        ]
          .filter(Boolean)
          .join(" / "),
      );
    } catch (error) {
      setMessage(toErrorMessage(error));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <section className="border-t border-slate-200 pt-4">
      <h3 className="text-lg font-semibold text-slate-900 mb-3">
        Google Calendar同期
      </h3>
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleLoadCalendars}
          disabled={isLoadingCalendars || isSyncing}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingCalendars ? "取得中..." : "カレンダーを取得/再認可"}
        </button>

        {(calendars.length > 0 || settings?.calendarId) && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              同期先カレンダー
            </label>
            <select
              value={selectedCalendarId}
              onChange={(event) => setSelectedCalendarId(event.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {settings?.calendarId && calendars.length === 0 && (
                <option value={settings.calendarId}>
                  {settings.calendarSummary || settings.calendarId}
                </option>
              )}
              {calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.summary}
                  {calendar.primary ? " (primary)" : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveCalendar}
              disabled={!selectedCalendarId || isSyncing}
              className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              同期先を保存
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing || !(selectedCalendarId || settings?.calendarId)}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? "同期中..." : "今すぐ同期"}
        </button>

        <p className="text-xs text-slate-500">
          同期範囲: 過去{settings?.syncWindowPastDays || DEFAULT_SYNC_WINDOW_PAST_DAYS}
          日から未来
          {settings?.syncWindowFutureDays || DEFAULT_SYNC_WINDOW_FUTURE_DAYS}
          日。同期時はGoogleの予定が優先されます。
        </p>
        {settings?.lastSyncedAt && (
          <p className="text-xs text-slate-500">
            最終同期: {settings.lastSyncedAt.toLocaleString("ja-JP")}
          </p>
        )}
        {(message || settings?.lastSyncError) && (
          <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            {message || settings?.lastSyncError}
          </p>
        )}
      </div>
    </section>
  );
}

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};
