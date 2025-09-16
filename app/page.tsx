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

  // Firebaseから全てのデータを取得
  const { schedules, tasks, tempTasks, settings, loading, error } = useEvents();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isSettingSideModalOpen, setIsSettingSideModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <header className="border-slate-200">
      {/* 右上に設定アイコンを配置 */}
      <div className="text-right m-1">
        <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setIsSettingSideModalOpen(true)}>
          <MdSettings className="text-gray-700 text-xl" />
        </button>
      </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* カレンダーセクション */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
            <Calendar
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              today={today}
              schedules={schedules}
              tasks={tasks}
              loading={loading}
              error={error}
            />

          {/* 選択日付の詳細セクション */}
            <EventDetails
              selectedDate={selectedDate}
              selectedSchedule={selectedSchedule}
              selectedTask={selectedTask}
              setIsEditScheduleModalOpen={setIsEditScheduleModalOpen}
              setIsEditTaskModalOpen={setIsEditTaskModalOpen}
              setEditingSchedule={setEditingSchedule}
              setEditingTask={setEditingTask}
              setRepeatEditOpitonModalOpen={setRepeatEditOpitonModalOpen}
            />
            {/* アクションボタン */}
            <div className="flex justify-end">
              <button
                onClick={openEventModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">+</span>
                  イベント追加
                </span>
              </button>
            </div>
          </div>

          {/* タスクリストとテンプタスクのセクション */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/3">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">タスクリスト</h2>
                <TaskList
                  today={today}
                  schedules={schedules}
                  tasks={tasks}
                  availableTimePerDay={settings?.availableTimePerDay}
                  dateTakeIntoAccount={settings?.dateTakeIntoAccount}
                  availableTimePerUnscheduledDay={settings?.availableTimePerUnscheduledDay}
                  onEditTask={(task) => { setEditingTask(task); setIsEditTaskModalOpen(true); }}
                />
              </div>
              <div className="lg:w-1/3">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">一時的なタスク</h2>
                <TempTaskList tempTasks={tempTasks} selectedDate={selectedDate} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* モーダル */}
      {isSettingSideModalOpen && <SettingSideModal setIsSettingSideModalOpen={setIsSettingSideModalOpen} settings={settings} />}
      {isEventModalOpen && <AddEventModal setIsEventModalOpen={setIsEventModalOpen} selectedDate={selectedDate} />}
      {isEditScheduleModalOpen && <EditScheduleModal setIsEditScheduleModalOpen={setIsEditScheduleModalOpen} editingSchedule={editingSchedule} />}
      {isEditTaskModalOpen && <EditTaskModal setIsEditTaskModalOpen={setIsEditTaskModalOpen} editingTask={editingTask} />}
      {repeatEditOpitonModalOpen && <RepeatEditOptionModal setRepeatEditOpitonModalOpen={setRepeatEditOpitonModalOpen} setIsEditScheduleModalOpen={setIsEditScheduleModalOpen} editingSchedule={editingSchedule} setEditingSchedule={setEditingSchedule} selectedDate={selectedDate} />}
    </div>
  );
}
