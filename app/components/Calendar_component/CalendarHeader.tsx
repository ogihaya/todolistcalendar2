import { CurrentYM } from "@/types/others";
import { Dispatch, SetStateAction } from "react";
import { FaUndo } from "react-icons/fa";

interface CalendarHeaderProps {
  currentYM: CurrentYM;
  setCurrentYM: Dispatch<SetStateAction<CurrentYM>>;
  today: Date;
  setSelectedDate: (date: Date) => void;
}

export default function CalendarHeader({ currentYM, setCurrentYM, today, setSelectedDate }: CalendarHeaderProps) {
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
  const navigateToToday = () => {
    setCurrentYM({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDate(today);
  }
  return (
    <>
      <div className="flex justify-between">
        <button onClick={navigateToPreviousMonth} className="text-lg border border-gray-600 rounded-sm px-4 hover:bg-gray-200 mb-1 ml-1">＜</button>
        <div className="text-xl font-bold flex items-center">{currentYM.year}年{currentYM.month + 1}月<button onClick={navigateToToday} className="ml-2 text-sm flex items-center"><FaUndo />今日</button></div>
        <button onClick={navigateToNextMonth} className="text-lg border border-gray-600 rounded-sm px-4 hover:bg-gray-200 mb-1 mr-1">＞</button>
      </div>
    </>
  );
}