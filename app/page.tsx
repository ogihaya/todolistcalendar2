"use client";

import Calendar from "@/components/Calendar";
import AddEventModal from "@/components/AddEventModal";
import { useEffect, useState } from "react";
import EventDetails from "@/components/EventDetails";
import { Schedule } from "@/types/event";
import { Task } from "@/types/event";
import { useEvents } from "@/hooks/useEvents";
import { getSchedulesForDate, getTasksForDate } from "@/Utils/CalendarCellUtil";
import EditScheduleModal from "@/components/EditScheduleModal";
import EditTaskModal from "@/components/EditTaskModal";
import RepeatEditOptionModal from "@/components/RepeatEditOptionModal";
import TaskList from "@/components/TaskList";
import SettingSideModal from "@/components/SettingSideModal";
import { MdSettings } from "react-icons/md";
import TempTaskList from "@/components/TempTaskList";

// メインページコンポーネント
export default function Home() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Firebaseから全てのデータを取得
  const { schedules, tasks, tempTasks, settings, loading, error } = useEvents();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isSettingSideModalOpen, setIsSettingSideModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(todayDate);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule[]>([]); // 空配列で初期化
  const [selectedTask, setSelectedTask] = useState<Task[]>([]); // 空配列で初期化
  // 編集モーダルの状態を管理
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [repeatEditOpitonModalOpen, setRepeatEditOpitonModalOpen] = useState(false);

  // データが読み込まれたら、選択された日付のイベントを更新
  useEffect(() => {
    setSelectedSchedule(getSchedulesForDate(schedules, selectedDate));
    setSelectedTask(getTasksForDate(tasks, selectedDate));
  }, [schedules, tasks, selectedDate]); // 依存配列にselectedDateも追加

  const openEventModal = () => {
    setIsEventModalOpen(true);
  };


  return (
    <>
      {/* 右上に設定アイコンを配置 */}
      <div className="text-right m-1">
        <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setIsSettingSideModalOpen(true)}>
          <MdSettings className="text-gray-700 text-xl" />
        </button>
      </div>
      {isSettingSideModalOpen && <SettingSideModal setIsSettingSideModalOpen={setIsSettingSideModalOpen} settings={settings} />}
      <div className="my-1 mx-2">
        <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} today={today} schedules={schedules} tasks={tasks} loading={loading} error={error} />
      </div>
      <div className="my-1 mx-2">
        <EventDetails selectedDate={selectedDate} selectedSchedule={selectedSchedule} selectedTask={selectedTask} setIsEditScheduleModalOpen={setIsEditScheduleModalOpen} setIsEditTaskModalOpen={setIsEditTaskModalOpen} setEditingSchedule={setEditingSchedule} setEditingTask={setEditingTask} setRepeatEditOpitonModalOpen={setRepeatEditOpitonModalOpen} />
      </div>
      <div className="flex justify-end">
        <button onClick={openEventModal} className="text-lg font-bold border border-gray-600 rounded-sm px-6 hover:bg-gray-200 mr-4">＋イベント追加</button>
      </div>
      <div className="my-1 mx-2 flex">
        <div className="w-7/10 pr-2">
          <TaskList today={today} schedules={schedules} tasks={tasks} availableTimePerDay={settings?.availableTimePerDay} dateTakeIntoAccount={settings?.dateTakeIntoAccount} availableTimePerUnscheduledDay={settings?.availableTimePerUnscheduledDay} onEditTask={(task) => { setEditingTask(task); setIsEditTaskModalOpen(true); }} />
        </div>
        <div className="w-3/10">
          <TempTaskList tempTasks={tempTasks} selectedDate={selectedDate} />
        </div>
      </div>
      {isEventModalOpen && <AddEventModal setIsEventModalOpen={setIsEventModalOpen} selectedDate={selectedDate} />}
      {isEditScheduleModalOpen && <EditScheduleModal setIsEditScheduleModalOpen={setIsEditScheduleModalOpen} editingSchedule={editingSchedule} />}
      {isEditTaskModalOpen && <EditTaskModal setIsEditTaskModalOpen={setIsEditTaskModalOpen} editingTask={editingTask} />}
      {repeatEditOpitonModalOpen && <RepeatEditOptionModal setRepeatEditOpitonModalOpen={setRepeatEditOpitonModalOpen} setIsEditScheduleModalOpen={setIsEditScheduleModalOpen} editingSchedule={editingSchedule} setEditingSchedule={setEditingSchedule} selectedDate={selectedDate} />}
    </>
  );
}
