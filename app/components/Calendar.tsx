"use client";

import CalendarHeader from "@/components/Calendar_component/CalendarHeader";
import DaysHeader from "@/components/Calendar_component/DaysHeader";
import CalendarCell from "@/components/Calendar_component/CalendarCell";
import { useEffect, useState } from "react";
import { CurrentYM } from "@/types/others";
import { Schedule } from "@/types/event";
import { Task } from "@/types/event";
import { getSchedulesForDate, getTasksForDate } from "@/components/Calendar_component/CalendarCellUtil";

interface CalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  setSelectedSchedule: (schedule: Schedule[]) => void;
  setSelectedTask: (task: Task[]) => void;
  today: Date;
  schedules: Schedule[];
  tasks: Task[];
  loading: boolean;
  error: string|null;
}

export default function Calendar({ selectedDate, setSelectedDate, setSelectedSchedule, setSelectedTask, today, schedules, tasks, loading, error }: CalendarProps) {



  const [currentYM, setCurrentYM] = useState<CurrentYM>({
    year: today.getFullYear(),
    month: today.getMonth()
  });


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
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </>
  );
}