import { useState } from "react";
import AddScheduleModal from "@/components/AddEventModal_component/AddScheduleModal";
import AddTaskModal from "@/components/AddEventModal_component/AddTaskModal";

// モーダルのプロパティの型定義
interface AddEventModalProps {
    setIsEventModalOpen: (isOpen: boolean) => void;
    selectedDate: Date;
}

export default function AddEventModal({ setIsEventModalOpen, selectedDate }: AddEventModalProps) {
    const [eventType, setEventType] = useState<"schedule" | "task">("schedule");
    return (
        // モーダルの背景を含む最外層のラッパー
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
            onClick={() => setIsEventModalOpen(false)} // 背景クリックでモーダルを閉じる
        >
            {/* モーダル本体 */}
            <div
                className="relative bg-white border border-gray-200 p-4 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()} // モーダル本体のクリックイベントが背景に伝播するのを防ぐ
            >
                {/* 右上の閉じるボタン */}
                <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg"
                    onClick={() => setIsEventModalOpen(false)}
                    aria-label="閉じる"
                >
                    ×
                </button>

                {/* イベントタイプ選択セクション */}
                <div>
                    <div className="text-sm text-gray-600">イベントの種類</div>
                    <div className="flex gap-4">
                        {/* 予定選択のラジオボタン */}
                        <label className="flex items-center gap-1 text-sm">
                            <input
                                type="radio"
                                value="schedule"
                                checked={eventType === "schedule"}
                                onChange={() => setEventType("schedule")}
                                className="text-blue-600"
                            />
                            予定
                        </label>
                        {/* タスク選択のラジオボタン */}
                        <label className="flex items-center gap-1 text-sm">
                            <input
                                type="radio"
                                value="task"
                                checked={eventType === "task"}
                                onChange={() => setEventType("task")}
                                className="text-blue-600"
                            />
                            タスク
                        </label>
                    </div>
                </div>

                {/* 選択されたイベントタイプに応じたフォームを条件付きレンダリング */}
                {eventType === "schedule" && (
                    <AddScheduleModal onClose={() => setIsEventModalOpen(false)} selectedDate={selectedDate} />
                )}
                {eventType === "task" && (
                    <AddTaskModal onClose={() => setIsEventModalOpen(false)} selectedDate={selectedDate} />
                )}
            </div>
        </div>
    );
}
