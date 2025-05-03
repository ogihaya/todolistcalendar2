type CurrentYM = {
  year: number;
  month: number;
}

type CalendarCellProps = {
  currentYM: CurrentYM;
}

export default function CalendarCell({currentYM}:CalendarCellProps) {

  const daysInMonth = new Date(currentYM.year, currentYM.month + 1, 0).getDate();//表示している月の日数
  const dayOfFirstDate = new Date(currentYM.year, currentYM.month, 1).getDay();//一日目の曜日
  const dayOfLastDate = new Date(currentYM.year, currentYM.month+1, 0).getDay();//最終日の曜日

  let calendarCellList = [];

  //日付のセルを生成
  for (let i = 1-dayOfFirstDate; i <= daysInMonth+6-dayOfLastDate; i++) {//先月の分と来月の分も表示するようなiの範囲でループ
    const processDate = new Date(currentYM.year, currentYM.month, i);
    const processDay = processDate.getDay(); // 曜日を取得

    // 曜日に応じてクラス名を決定
    let textColorClass = "";
    if (processDay === 0) {
      textColorClass = "text-red-500"; // 日曜日は赤
    } else if (processDay === 6) {
      textColorClass = "text-blue-500"; // 土曜日は青
    }
    
    calendarCellList.push(
      <div key={i} className={textColorClass}>
        {processDate.getDate()}
      </div>
    );
  }


  return (
    <div className="grid grid-cols-7">
      {calendarCellList}
    </div>
  );
}


