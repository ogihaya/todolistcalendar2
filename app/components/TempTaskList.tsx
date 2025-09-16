import { useState } from "react";
import { auth } from "@/lib/firebase";
import { TempTask } from "@/types/event";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import EditTempTaskModal from "@/components/TempTaskList_component/EditTempTaskModal";

interface TempTaskListProps {
    tempTasks: TempTask[];
    selectedDate: Date;
}

export default function TempTaskList({ tempTasks, selectedDate }: TempTaskListProps) {

    const [taskName, setTaskName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingTempTask, setEditingTempTask] = useState<TempTask | null>(null);
    const [isEditTempTaskModalOpen, setIsEditTempTaskModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // バリデーション（入力値の検証）
        if (!taskName) {
            alert("タスク名は必須です");
            return;
        }

        setIsSubmitting(true); // 送信開始

        try {
            // 現在のユーザーIDを取得
            const userId = auth.currentUser?.uid;
            if (!userId) {
                alert("ユーザーがログインしていません。右上の設定ボタンからログインしてください。");
                throw new Error('ユーザーがログインしていません');
            }
            // Firestoreに保存するデータを作成
            const tempTask: Omit<TempTask, 'id'> = {
                name: taskName,
            };

            // Firestoreの'tempTasks'コレクションにデータを追加
            await addDoc(collection(db, "users", userId, 'tempTasks'), tempTask);
            setTaskName(""); // タスク名をクリア

        } catch (error) {
            console.error("タスクの保存に失敗しました:", error);
            alert("タスクの保存に失敗しました。もう一度お試しください。");
        } finally {
            setIsSubmitting(false); // 送信完了
        }
    };

    const handleEdit = (tempTask: TempTask) => {
        setEditingTempTask(tempTask);
        setIsEditTempTaskModalOpen(true);
    };

    return (
        <div className="h-60 rounded-lg border border-slate-200 overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                           {/* フォーム */}
            <div className="border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="新しいタスク名を入力..." 
                            value={taskName} 
                            onChange={(e) => setTaskName(e.target.value)} 
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                        />
                        <button 
                            disabled={isSubmitting || !taskName.trim()} 
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {isSubmitting ? "追加中..." : "追加"}
                        </button>
                    </div>
                </form>
            </div>

            </div>

            {/* タスクリスト */}
            <div className="max-h-48 overflow-y-auto">
                {tempTasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <div className="text-3xl mb-2">📝</div>
                        <p className="text-sm">一時的なタスクがありません</p>
                        <p className="text-xs text-slate-400 mt-1">上記のフォームから追加してください</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {tempTasks.map((tempTask) => (
                            <div key={tempTask.id} className="p-3 hover:bg-slate-50 transition-colors duration-150">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {tempTask.name}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleEdit(tempTask)} 
                                        className="ml-3 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        編集
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isEditTempTaskModalOpen && <EditTempTaskModal setIsEditTempTaskModalOpen={setIsEditTempTaskModalOpen} editingTempTask={editingTempTask} selectedDate={selectedDate} />}
        </div>
    );
}