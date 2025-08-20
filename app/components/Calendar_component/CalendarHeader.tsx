import { CurrentYM } from "@/types/others";
import { Dispatch, SetStateAction } from "react";

interface CalendarHeaderProps {
  currentYM: CurrentYM;
  setCurrentYM: Dispatch<SetStateAction<CurrentYM>>;
}

export default function CalendarHeader({ currentYM, setCurrentYM }: CalendarHeaderProps) {
  const navigateToPreviousMonth = () => {
    // 1月（month=0）の時は前年の12月（month=11）に移動
    if (currentYM.month <= 0) {
      setCurrentYM({ year: currentYM.year - 1, month: 11 });
    } else {
      // それ以外は同じ年の前月に移動
      setCurrentYM({ year: currentYM.year, month: currentYM.month - 1 });
    }
  }
  const navigateToNextMonth = () => {
    // 12月（month=11）の時は翌年の1月（month=0）に移動
    if (currentYM.month >= 11) {
      setCurrentYM({ year: currentYM.year + 1, month: 0 });
    } else {
      // それ以外は同じ年の翌月に移動
      setCurrentYM({ year: currentYM.year, month: currentYM.month + 1 });
    }
  }
  return (
    <>
      <div className="flex justify-between">
        <button onClick={navigateToPreviousMonth} className="text-lg border border-gray-600 rounded-sm px-4 hover:bg-gray-200 mb-1 ml-1">＜</button>
        <div className="text-xl font-bold">{currentYM.year}年{currentYM.month + 1}月</div>
        <button onClick={navigateToNextMonth} className="text-lg border border-gray-600 rounded-sm px-4 hover:bg-gray-200 mb-1 mr-1">＞</button>
      </div>
    </>
  );
}