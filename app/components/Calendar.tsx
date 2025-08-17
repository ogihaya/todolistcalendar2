"use client";

import CalendarHeader from "@/components/Calendar_component/CalendarHeader";
import DaysHeader from "@/components/Calendar_component/DaysHeader";
import CalendarCell from "@/components/Calendar_component/CalendarCell";
import { useState } from "react";
import { CurrentYM } from "@/types/others";
import { useEvents } from "@/hooks/useEvents"; // カスタムフックをインポート

export default function Calendar() {
  const today = new Date();
  const [currentYM, setCurrentYM] = useState<CurrentYM>({
    year: today.getFullYear(),
    month: today.getMonth()
  });
  
  // Firebaseから全てのデータを取得
  const { schedules, tasks, loading, error } = useEvents();

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">データを読み込み中...</div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <>
      <CalendarHeader currentYM={currentYM} setCurrentYM={setCurrentYM} />
      <DaysHeader />
      <CalendarCell 
        currentYM={currentYM} 
        schedules={schedules}
        tasks={tasks}
      />
    </>
  );
}