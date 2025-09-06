import { useEffect, useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Schedule } from "@/types/event";

// モーダルのプロパティの型定義
interface EditScheduleModalProps {
    setIsEditScheduleModalOpen: (isEditScheduleModalOpen: boolean) => void;
    editingSchedule: Schedule | null;
}

export default function EditScheduleModal({ setIsEditScheduleModalOpen, editingSchedule }: EditScheduleModalProps) {
    // 日時をフォーマットする関数（HTML input用）
    const formatDateTimeForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // フォームの状態を管理するstate（既存のデータで初期化）
    const [formData, setFormData] = useState({
        name: editingSchedule?.name || "",
        startTime: formatDateTimeForInput(editingSchedule?.startTime || new Date()),
        endTime: formatDateTimeForInput(editingSchedule?.endTime || new Date()),
        repeat: editingSchedule?.repeat || "none",
        location: editingSchedule?.location || "",
        memo: editingSchedule?.memo || ""
    });

    useEffect(() => {
        setFormData({
            name: editingSchedule?.name || "",
            startTime: formatDateTimeForInput(editingSchedule?.startTime || new Date()),
            endTime: formatDateTimeForInput(editingSchedule?.endTime || new Date()),
            repeat: editingSchedule?.repeat || "none",
            location: editingSchedule?.location || "",
            memo: editingSchedule?.memo || ""
        });
    }, [editingSchedule]);

    // 送信中の状態を管理
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // フォームの入力値を更新する関数
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        if (!formData.name || !formData.startTime || !formData.endTime) {
            alert("予定名、開始時刻、終了時刻は必須です");
            return;
        }

        // 開始時刻が終了時刻より後の場合はエラー
        if (new Date(formData.startTime) > new Date(formData.endTime)) {
            alert("開始時刻は終了時刻より前である必要があります");
            return;
        }

        setIsSubmitting(true); // 送信開始

        try {
            if (!editingSchedule) return;

            // 現在のユーザーIDを取得
            const userId = auth.currentUser?.uid;
            if (!userId) {
                throw new Error('ユーザーがログインしていません');
            }

            const updatedSchedule = {
                name: formData.name,
                startTime: new Date(formData.startTime),
                endTime: new Date(formData.endTime),
                repeat: formData.repeat,
                repeatStartDate: new Date(new Date(formData.startTime).setHours(0, 0, 0, 0)),
                location: formData.location,
                memo: formData.memo,
            };

            await updateDoc(doc(db, "users", userId, 'schedules', editingSchedule.id), updatedSchedule);

            setIsEditScheduleModalOpen(false); // モーダルを閉じる

        } catch (error) {
            console.error("予定の更新に失敗しました:", error);
            alert("予定の更新に失敗しました。もう一度お試しください。");
        } finally {
            setIsSubmitting(false); // 送信完了
        }
    };

    const handleDelete = async () => {
        if (!editingSchedule?.id) return;
        if (!confirm("この予定を削除しますか？")) return;

        try {
            setIsDeleting(true);

            // 現在のユーザーIDを取得
            const userId = auth.currentUser?.uid;
            if (!userId) {
                throw new Error('ユーザーがログインしていません');
            }

            // Firestoreのドキュメントを削除
            await deleteDoc(doc(db, "users", userId, 'schedules', editingSchedule.id));

            setIsEditScheduleModalOpen(false);

        } catch (error) {
            console.error("予定の削除に失敗しました:", error);
            alert("予定の削除に失敗しました。もう一度お試しください。");
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        // モーダルの背景を含む最外層のラッパー
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
            onClick={() => setIsEditScheduleModalOpen(false)} // 背景クリックでモーダルを閉じる
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
                    onClick={() => setIsEditScheduleModalOpen(false)}
                    aria-label="閉じる"
                >
                    ×
                </button>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm text-gray-600 mt-1 ">
                            予定名
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="予定名を入力してください"
                            required
                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mt-1">
                            開始時刻
                        </label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mt-1">
                            終了時刻
                        </label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mt-1">
                            繰り返し
                        </label>
                        <select
                            name="repeat"
                            value={formData.repeat}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
                        >
                            <option value="none">なし</option>
                            {/* <option value="daily">毎日</option> */}
                            <option value="weekly">毎週</option>
                            <option value="monthly">毎月</option>
                            <option value="yearly">毎年</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mt-1">
                            場所
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="場所を入力してください"
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
                            onClick={() => setIsEditScheduleModalOpen(false)}
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
                            disabled={isSubmitting || isDeleting}
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
