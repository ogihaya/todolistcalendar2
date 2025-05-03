// 日本の祝日判定用ライブラリをインポート
import { isHoliday } from "japanese-holidays";

// 現在表示中の年月を管理するための型定義
interface CurrentYM {
  year: number;  // 年
  month: number; // 月（0-11の値を取る）
}

// カレンダーセルコンポーネントのプロパティの型定義
interface CalendarCellProps {
  currentYM: CurrentYM; // 表示する年月
}

// カレンダーの日付セルを表示するコンポーネント
export default function CalendarCell({currentYM}:CalendarCellProps) {
  // カレンダー生成に必要な日付情報を計算
  // 月の最終日を取得（翌月の0日目 = 当月の最終日）
  const daysInMonth = new Date(currentYM.year, currentYM.month + 1, 0).getDate();
  
  // 月の1日目の曜日を取得（0:日曜日 ～ 6:土曜日）
  const dayOfFirstDate = new Date(currentYM.year, currentYM.month, 1).getDay();
  
  // 月の最終日の曜日を取得
  const dayOfLastDate = new Date(currentYM.year, currentYM.month+1, 0).getDay();

  // カレンダーセルのリストを格納する配列
  let calendarCellList = [];

  // カレンダーの日付セルを生成
  // 先月の残り日数、当月の日数、来月の日数を含めてループ
  for (let i = 1-dayOfFirstDate; i <= daysInMonth+6-dayOfLastDate; i++) {
    // 処理対象の日付オブジェクトを生成
    const processDate = new Date(currentYM.year, currentYM.month, i);
    // 曜日を取得（0:日曜日 ～ 6:土曜日）
    const processDay = processDate.getDay();

    // 曜日と祝日に応じてテキストカラーを設定
    let textColorClass = "";
    if (processDay === 0 || isHoliday(processDate)) {
      textColorClass = "text-red-500";  // 日曜日と祝日は赤色
    } else if (processDay === 6) {
      textColorClass = "text-blue-500"; // 土曜日は青色
    }
    
    // 日付セルを生成してリストに追加
    calendarCellList.push(
      <div 
        key={i} 
        className={"border border-gray-300 "+textColorClass}
      >
        {processDate.getDate()} {/* 日付を表示 */}
      </div>
    );
  }

  // 7列のグリッドでカレンダーを表示
  return (
    <div className="grid grid-cols-7">
      {calendarCellList}
    </div>
  );
}


