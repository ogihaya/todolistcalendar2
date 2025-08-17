import { CurrentYM } from "@/types/others";
import { isHoliday } from "japanese-holidays";
import { Schedule, Task } from "@/types/event"; // 型をインポート
import { getSchedulesForDate, getTasksForDate } from "./CalendarCellUtil";

interface CalendarCellProps {
  currentYM: CurrentYM;
  schedules: Schedule[]; // 追加：予定データを受け取る
  tasks: Task[];         // 追加：タスクデータを受け取る
}

export default function CalendarCell({ currentYM, schedules, tasks }: CalendarCellProps) {
  // カレンダー生成に必要な日付情報を計算
  // 月の最終日を取得（翌月の0日目 = 当月の最終日）
  const daysInMonth = new Date(currentYM.year, currentYM.month + 1, 0).getDate();

  // 月の1日目の曜日を取得（0:日曜日 ～ 6:土曜日）
  const dayOfFirstDate = new Date(currentYM.year, currentYM.month, 1).getDay();

  // 月の最終日の曜日を取得
  const dayOfLastDate = new Date(currentYM.year, currentYM.month + 1, 0).getDay();

  // カレンダーセルのリストを格納する配列
  let calendarCellList = [];

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

    // 日付セルを生成してリストに追加
    calendarCellList.push(
      <div key={i} className="border border-gray-300">
        <div
          className={textClass}
        >
          {processDate.getDate()} {/* 日付を表示 */}
        </div>
        <div className="schedulecontents">
          {schedulesForDate.map(schedule => (
            <div key={schedule.id}>{schedule.name}</div>
          ))}
        </div>
        <div className="taskcontents">
          {tasksForDate.map(task => (
            <div key={task.id}>{task.name}</div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-7">
      {calendarCellList}
    </div>
  );
}