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
        <div className="h-60 overflow-y-auto border border-gray-800 p-2">
            <form onSubmit={handleSubmit} className="flex gap-2 justify-between">
                <input type="text" placeholder="タスク名" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="border border-gray-400" />
                <button disabled={isSubmitting} className="border border-gray-600 px-1 rounded-md hover:bg-gray-200">一時タスク追加</button>
            </form>
            <div>
                {tempTasks.map((tempTask) => (
                    <div key={tempTask.id} className="flex gap-2 justify-between mt-1 bg-gray-200">
                        <div className="ml-2">{tempTask.name}</div>
                        <button onClick={() => handleEdit(tempTask)} className="bg-white border border-gray-600 px-1 mr-2 hover:bg-gray-200">編集</button>
                    </div>
                ))}
            </div>
            {isEditTempTaskModalOpen && <EditTempTaskModal setIsEditTempTaskModalOpen={setIsEditTempTaskModalOpen} editingTempTask={editingTempTask} selectedDate={selectedDate} />}
        </div>
    );
}