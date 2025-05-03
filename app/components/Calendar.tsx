"use client";

import { useState } from "react";
import DaysHeader from "./Calendar_components/DaysHeader";
import CalendarCell from "./Calendar_components/CalendarCell";
import CalendarHeader from "./Calendar_components/CalendarHeader";

type CurrentYM = {
  year: number;
  month: number;
}

export default function Calendar() {

  const today = new Date();
  const [currentYM, setCurrentYM] = useState<CurrentYM>({year:today.getFullYear(), month:today.getMonth()});

  return (
  <div>
    <CalendarHeader currentYM={currentYM} setCurrentYM={setCurrentYM}/>
    <DaysHeader />
    <CalendarCell currentYM={currentYM}/>
  </div>
  );
}

