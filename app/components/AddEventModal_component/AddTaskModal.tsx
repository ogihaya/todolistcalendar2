import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Task } from "@/types/event";

// モーダルのプロパティの型定義
interface AddTaskModalProps {
    onClose: () => void; // モーダルを閉じる関数
    selectedDate: Date;
}

export default function AddTaskModal({ onClose, selectedDate }: AddTaskModalProps) {
    const getInitialDateTime = () => {
        const date = new Date(selectedDate);
        date.setHours(0, 0, 0, 0);
        // ローカルタイムゾーンを考慮したISO文字列形式で返す
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };
    // フォームの状態を管理するstate
    const [formData, setFormData] = useState({
        name: "",
        deadline: getInitialDateTime(),
        estimatedTime: "",
        memo: ""
    });

    // 送信中の状態を管理
    const [isSubmitting, setIsSubmitting] = useState(false);

    // フォームの入力値を更新する関数
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // フォームを送信する関数
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // フォームのデフォルトの送信動作を防ぐ

        // バリデーション（入力値の検証）
        if (!formData.name || !formData.deadline || !formData.estimatedTime) {
            alert("タスク名、締め切り日、所要時間は必須です");
            return;
        }

        // 所要時間が正の数であることを確認
        const estimatedTime = parseFloat(formData.estimatedTime);
        if (estimatedTime <= 0) {
            alert("所要時間は正の数である必要があります");
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
            const taskData: Omit<Task, 'id'> = {
                type: 'task',
                name: formData.name,
                deadline: new Date(formData.deadline),
                estimatedTime: estimatedTime,
                memo: formData.memo
            };

            // Firestoreの'tasks'コレクションにデータを追加
            await addDoc(collection(db, "users", userId, 'tasks'), taskData);
            onClose(); // モーダルを閉じる

        } catch (error) {
            console.error("タスクの保存に失敗しました:", error);
            alert("タスクの保存に失敗しました。もう一度お試しください。");
        } finally {
            setIsSubmitting(false); // 送信完了
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm text-gray-600 mt-1">
                    タスク名
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="タスク名を入力してください"
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-600 mt-1">
                    締め切り日
                </label>
                <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-600 mt-1">
                    所要時間（時間）
                </label>
                <input
                    type="number"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-600 mt-1">
                    メモ
                </label>
                <input
                    type="text"
                    name="memo"
                    value={formData.memo}
                    onChange={handleInputChange}
                    placeholder="メモを入力してください"
                    className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
                />
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                    キャンセル
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {isSubmitting ? "保存中..." : "タスクを追加"}
                </button>
            </div>
        </form>
    );
}