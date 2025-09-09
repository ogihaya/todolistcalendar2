import { TempTask } from "@/types/event";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, addDoc, collection } from "firebase/firestore";

interface EditTempTaskModalProps {
    setIsEditTempTaskModalOpen: (isEditTempTaskModalOpen: boolean) => void;
    editingTempTask: TempTask | null;
    selectedDate: Date;
}


export default function EditTempTaskModal({ setIsEditTempTaskModalOpen, editingTempTask, selectedDate }: EditTempTaskModalProps) {

    const getInitialDateTime = () => {
        // ローカルタイムゾーンを考慮したISO文字列形式で返す
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    // フォームの状態を管理するstate（既存のデータで初期化）
    const [formData, setFormData] = useState({
        name: editingTempTask?.name || "",
        deadline: getInitialDateTime(),
        estimatedTime: "",
        memo:""
    });

    // 送信中の状態を管理
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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

            // 更新するデータを作成
            const submitData = {
                name: formData.name,
                deadline: new Date(formData.deadline),
                estimatedTime: estimatedTime,
                memo: formData.memo
            };

            // Firestoreのドキュメントを更新
            await addDoc(collection(db, "users", userId, 'tasks'), submitData);
            await deleteDoc(doc(db, "users", userId, 'tempTasks', editingTempTask?.id || ""));

            setIsEditTempTaskModalOpen(false); // モーダルを閉じる

        } catch (error) {
            console.error("タスクの更新に失敗しました:", error);
            alert("タスクの更新に失敗しました。もう一度お試しください。");
        } finally {
            setIsSubmitting(false); // 送信完了
        }
    };

    const handleDelete = async () => {
        if (!editingTempTask?.id) return;
        if (!confirm("このタスクを削除しますか？")) return;

        try {
            setIsDeleting(true);

            // 現在のユーザーIDを取得
            const userId = auth.currentUser?.uid;
            if (!userId) {
                throw new Error('ユーザーがログインしていません');
            }
            
            // Firestoreのドキュメントを削除
            const taskRef = doc(db, "users", userId, 'tempTasks', editingTempTask.id);
            await deleteDoc(taskRef);

            setIsEditTempTaskModalOpen(false);

        } catch (error) {
            console.error("タスクの削除に失敗しました:", error);
            alert("タスクの削除に失敗しました。もう一度お試しください。");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        // モーダルの背景を含む最外層のラッパー
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
            onClick={() => setIsEditTempTaskModalOpen(false)} // 背景クリックでモーダルを閉じる
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
                    onClick={() => setIsEditTempTaskModalOpen(false)}
                    aria-label="閉じる"
                >
                    ×
                </button>

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
                            onClick={() => setIsEditTempTaskModalOpen(false)}
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
                            {isSubmitting ? "更新中..." : "更新"}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {isDeleting ? "削除中..." : "削除"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
