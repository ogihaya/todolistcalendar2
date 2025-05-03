// 現在表示中の年月を管理するための型定義
interface CurrentYM {
  year: number;  // 年
  month: number; // 月（0-11の値を取る）
}

// カレンダーヘッダーコンポーネントのプロパティの型定義
interface CalendarHeaderProps {
  currentYM: CurrentYM;              // 現在表示中の年月
  setCurrentYM: React.Dispatch<React.SetStateAction<CurrentYM>>; // 年月を更新する関数
}

// カレンダーヘッダーコンポーネント
// 年月の表示と月の切り替えボタンを提供
export default function CalendarHeader({currentYM, setCurrentYM}:CalendarHeaderProps) {
  return (
    // フレックスボックスで両端に寄せたレイアウト
    <div className="flex justify-between">
      {/* 前月へ移動するボタン */}
      <button  
        className="bg-gray-200 hover:bg-gray-300 mx-2 px-4"
        onClick={() => {
          // 1月（month=0）の時は前年の12月（month=11）に移動
          if (currentYM.month <= 0) {
            setCurrentYM({year:currentYM.year-1, month:11});
          } else {
            // それ以外は同じ年の前月に移動
            setCurrentYM({year:currentYM.year, month:currentYM.month-1});
          }
        }}
      >&lt;</button>

      {/* 現在の年月を表示 （monthは0から始まるため+1する） */}
      <div>{currentYM.year}年{currentYM.month+1}月</div>

      {/* 次月へ移動するボタン */}
      <button 
        className="bg-gray-200 hover:bg-gray-300 mx-2 px-4"
        onClick={() => {
          // 12月（month=11）の時は翌年の1月（month=0）に移動
          if (currentYM.month >= 11) {
            setCurrentYM({year:currentYM.year+1, month:0});
          } else {
            // それ以外は同じ年の次月に移動
            setCurrentYM({year:currentYM.year, month:currentYM.month+1});
          }
        }}
      >&gt;</button>
    </div>
  );
}
