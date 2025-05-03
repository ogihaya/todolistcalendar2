"use client"; // クライアントサイドでのレンダリングを指定

import Calendar from "./components/Calendar";
import { useState } from "react";
import AddEventModal from "./components/AddEventModal";

// メインページコンポーネント
export default function Home() {
  // モーダルの表示状態を管理するstate
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // モーダルを開くための関数
  const openEventModal = () => {
    setIsEventModalOpen(true);
  };

  return (
    // メインコンテナ
    <div>
      {/* カレンダーコンポーネント */}
      <Calendar />
      {/* イベント追加ボタン */}
      <button onClick={openEventModal}>追加</button>
      {/* モーダルの条件付きレンダリング - isEventModalOpenがtrueの時のみ表示 */}
      {isEventModalOpen && <AddEventModal setIsEventModalOpen={setIsEventModalOpen} />}
    </div>
  );
}
