"use client";

import Calendar from "@/components/Calendar";
import AddEventModal from "@/components/AddEventModal";
import { useState } from "react";

// メインページコンポーネント
export default function Home() {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const openEventModal = () => {
    setIsEventModalOpen(true);
  };

  return (
   <>
   <Calendar />
   <button onClick={openEventModal}>追加</button>
   {isEventModalOpen && <AddEventModal setIsEventModalOpen={setIsEventModalOpen} />}
   </>
  );
}
