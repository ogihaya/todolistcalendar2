"use client";

import CalendarHeader from "@/components/Calendar_component/CalendarHeader";
import DaysHeader from "@/components/Calendar_component/DaysHeader";
import CalendarCell from "@/components/Calendar_component/CalendarCell";
import { useState } from "react";
import { CurrentYM } from "@/types/others";

export default function Calendar() {
  const today = new Date();
  const [currentYM, setCurrentYM] = useState<CurrentYM>({
    year: today.getFullYear(),
    month: today.getMonth()
  });
  return (
    <>
      <CalendarHeader currentYM={currentYM} setCurrentYM={setCurrentYM} />
      <DaysHeader />
      <CalendarCell currentYM={currentYM} />
    </>
  );
}