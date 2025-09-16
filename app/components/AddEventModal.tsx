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
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
            onClick={() => setIsEventModalOpen(false)} // 背景クリックでモーダルを閉じる
        >
            {/* モーダル本体 */}
            <div
                className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // モーダル本体のクリックイベントが背景に伝播するのを防ぐ
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">新しいイベントを追加</h2>
                    <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => setIsEventModalOpen(false)}
                        aria-label="閉じる"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* イベントタイプ選択セクション */}
                <div className="p-6 border-b border-slate-200">
                    <div className="text-sm font-medium text-slate-700 mb-4">イベントの種類を選択してください</div>
                    <div className="grid grid-cols-2 gap-3">
                        {/* 予定選択のラジオボタン */}
                        <label className={`
                            relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                            ${eventType === "schedule" 
                                ? "border-blue-500 bg-blue-50 text-blue-700" 
                                : "border-slate-200 hover:border-slate-300 text-slate-700"
                            }
                        `}>
                            <input
                                type="radio"
                                value="schedule"
                                checked={eventType === "schedule"}
                                onChange={() => setEventType("schedule")}
                                className="sr-only"
                            />
                            <div className="text-center">
                                <div className="text-sm font-medium">📅予定</div>
                            </div>
                        </label>
                        {/* タスク選択のラジオボタン */}
                        <label className={`
                            relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                            ${eventType === "task" 
                                ? "border-green-500 bg-green-50 text-green-700" 
                                : "border-slate-200 hover:border-slate-300 text-slate-700"
                            }
                        `}>
                            <input
                                type="radio"
                                value="task"
                                checked={eventType === "task"}
                                onChange={() => setEventType("task")}
                                className="sr-only"
                            />
                            <div className="text-center">
                                <div className="text-sm font-medium">✅タスク</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* 選択されたイベントタイプに応じたフォームを条件付きレンダリング */}
                <div className="p-6">
                    {eventType === "schedule" && (
                        <AddScheduleModal onClose={() => setIsEventModalOpen(false)} selectedDate={selectedDate} />
                    )}
                    {eventType === "task" && (
                        <AddTaskModal onClose={() => setIsEventModalOpen(false)} selectedDate={selectedDate} />
                    )}
                </div>
            </div>
        </div>
    );
}
