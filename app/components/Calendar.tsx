"use client"; // クライアントサイドでのレンダリングを指定

import { useState } from "react";
import DaysHeader from "./Calendar_components/DaysHeader";
import CalendarCell from "./Calendar_components/CalendarCell";
import CalendarHeader from "./Calendar_components/CalendarHeader";

// 現在表示中の年月を管理するための型定義
interface CurrentYM {
  year: number;  // 年
  month: number; // 月（0-11の値を取る）
}

// カレンダーメインコンポーネント
export default function Calendar() {
  // 現在の日付を取得
  const today = new Date();
  
  // 表示中の年月を管理するstate
  // 初期値は現在の年月
  const [currentYM, setCurrentYM] = useState<CurrentYM>({
    year: today.getFullYear(),
    month: today.getMonth()
  });

  return (
    // カレンダーのメインコンテナ
    <div>
      {/* カレンダーヘッダー（年月表示と月切り替えボタン） */}
      <CalendarHeader currentYM={currentYM} setCurrentYM={setCurrentYM}/>
      {/* 曜日ヘッダー（日～土） */}
      <DaysHeader />
      {/* カレンダーのセル（日付表示部分） */}
      <CalendarCell currentYM={currentYM}/>
    </div>
  );
}

