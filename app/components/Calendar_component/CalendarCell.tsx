import { CurrentYM } from "@/types/others";
import { isHoliday } from "japanese-holidays";
import { Schedule, Task } from "@/types/event"; // 型をインポート
import { getSchedulesForDate, getTasksForDate } from "@/Utils/CalendarCellUtil";
import { useMemo } from "react"; // useMemoをインポート

interface CalendarCellProps {
  currentYM: CurrentYM;
  schedules: Schedule[]; // 追加：予定データを受け取る
  tasks: Task[];         // 追加：タスクデータを受け取る
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  today: Date;
}

export default function CalendarCell({ currentYM, schedules, tasks, selectedDate, setSelectedDate, today }: CalendarCellProps) {

  // カレンダー生成に必要な日付情報を計算（useMemoでメモ化）
  const calendarInfo = useMemo(() => {
    // 月の最終日を取得（翌月の0日目 = 当月の最終日）
    const daysInMonth = new Date(currentYM.year, currentYM.month + 1, 0).getDate();

    // 月の1日目の曜日を取得（0:日曜日 ～ 6:土曜日）
    const dayOfFirstDate = new Date(currentYM.year, currentYM.month, 1).getDay();

    // 月の最終日の曜日を取得
    const dayOfLastDate = new Date(currentYM.year, currentYM.month + 1, 0).getDay();

    return { daysInMonth, dayOfFirstDate, dayOfLastDate };
  }, [currentYM.year, currentYM.month]);

  // カレンダーセルのリストを生成（useMemoでメモ化）
  const calendarCellList = useMemo(() => {
    const { daysInMonth, dayOfFirstDate, dayOfLastDate } = calendarInfo;
    const cellList = [];

    // カレンダーの日付セルを生成
    // 先月の残り日数、当月の日数、来月の日数を含めてループ
    for (let i = 1 - dayOfFirstDate; i <= daysInMonth + 6 - dayOfLastDate; i++) {
      // 処理対象の日付オブジェクトを生成
      const processDate = new Date(currentYM.year, currentYM.month, i);
      // 曜日を取得（0:日曜日 ～ 6:土曜日）
      const processDay = processDate.getDay();

      // 対応する日付の予定を取得
      const schedulesForDate = getSchedulesForDate(schedules, processDate);

      // 対応する日付のタスクを取得
      const tasksForDate = getTasksForDate(tasks, processDate);

      // 属性に応じてクラスを設定
      let textClass = "";
      if (processDay === 0 || isHoliday(processDate)) {
        textClass += "text-red-500 ";  // 日曜日と祝日は赤色
      } 
      if (processDay === 6) {
        textClass += "text-blue-500 "; // 土曜日は青色
      } 
      if (processDate.getMonth() !== currentYM.month) {
        textClass += "opacity-50 "; // 他の月は半透明
      }

      const isSelected = selectedDate.getFullYear() === processDate.getFullYear() && 
                        selectedDate.getMonth() === processDate.getMonth() && 
                        selectedDate.getDate() === processDate.getDate();

      const isToday = processDate.getFullYear() === today.getFullYear() && processDate.getMonth() === today.getMonth() && processDate.getDate() === today.getDate();

      // 日付セルを生成してリストに追加
      cellList.push(
        <div key={i} className={`border border-gray-300 ${isSelected ? "border-red-500 border-2" : ""} ${isToday ? "bg-red-100" : ""}`} onClick={() => {
          setSelectedDate(processDate);
        }}>
          <div className={textClass}>
            {processDate.getDate()} {/* 日付を表示 */}
          </div>
          <div>
            {schedulesForDate.map(schedule => (
              <div key={schedule.id} className="text-sm truncate bg-blue-100 rounded-sm m-1">{schedule.name}</div>
            ))}
          </div>
          <div>
            {tasksForDate.map(task => (
              <div key={task.id} className="text-sm truncate bg-green-100 rounded-sm m-1">{task.name}</div>
            ))}
          </div>
        </div>
      );
    }
    return cellList;
  }, [currentYM, schedules, tasks, selectedDate, setSelectedDate, calendarInfo]);

  return (
    <div className="grid grid-cols-7">
      {calendarCellList}
    </div>
  );
}