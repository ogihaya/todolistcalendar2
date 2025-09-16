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
    <div className="flex items-center justify-between mb-6">
      {/* 前月ボタン */}
      <button 
        onClick={navigateToPreviousMonth} 
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="前の月"
      >
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 年月表示と今日ボタン */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {currentYM.year}年{currentYM.month + 1}月
        </h2>
        <button 
          onClick={navigateToToday} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaUndo className="w-4 h-4" />
          今日
        </button>
      </div>

      {/* 次月ボタン */}
      <button 
        onClick={navigateToNextMonth} 
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="次の月"
      >
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}