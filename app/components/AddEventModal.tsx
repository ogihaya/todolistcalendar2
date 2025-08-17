import { useState } from "react";
import AddScheduleModal from "@/components/AddEventModal_component/AddScheduleModal";
import AddTaskModal from "@/components/AddEventModal_component/AddTaskModal";

// モーダルのプロパティの型定義
interface AddEventModalProps {
    setIsEventModalOpen: (isOpen: boolean) => void;
}

export default function AddEventModal({ setIsEventModalOpen }: AddEventModalProps) {
    const [eventType, setEventType] = useState<"schedule" | "task">("schedule");
    return (
        // モーダルの背景を含む最外層のラッパー
        <div
            className="fixed inset-0 flex items-center justify-center bg-gray-500/50 z-50"
            onClick={() => setIsEventModalOpen(false)} // 背景クリックでモーダルを閉じる
        >
            {/* モーダル本体 */}
            <div
                className="relative bg-white p-6 rounded shadow-lg w-full max-w-md"
                onClick={(e) => e.stopPropagation()} // モーダル本体のクリックイベントが背景に伝播するのを防ぐ
            >
                {/* 右上の閉じるボタン - absolute positioningで配置 */}
                <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                    onClick={() => setIsEventModalOpen(false)}
                    aria-label="閉じる"
                >
                    ×
                </button>

                {/* イベントタイプ選択セクション */}
                <div>
                    <label>イベントの種類</label>
                    <div>
                        {/* 予定選択のラジオボタン */}
                        <label>
                            <input
                                type="radio"
                                value="schedule"
                                checked={eventType === "schedule"}
                                onChange={() => setEventType("schedule")}
                            />
                            予定
                        </label>
                        {/* タスク選択のラジオボタン */}
                        <label>
                            <input
                                type="radio"
                                value="task"
                                checked={eventType === "task"}
                                onChange={() => setEventType("task")}
                            />
                            タスク
                        </label>
                    </div>
                </div>

                {/* 選択されたイベントタイプに応じたフォームを条件付きレンダリング */}
                {eventType === "schedule" && (
                    <AddScheduleModal onClose={() => setIsEventModalOpen(false)} />
                )}
                {eventType === "task" && (
                    <AddTaskModal onClose={() => setIsEventModalOpen(false)} />
                )}
            </div>
        </div>
    );
}
