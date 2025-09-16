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
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
            onClick={() => setIsEditScheduleModalOpen(false)} // 背景クリックでモーダルを閉じる
        >
            {/* モーダル本体 */}
            <div
                className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // モーダル本体のクリックイベントが背景に伝播するのを防ぐ
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">予定を編集</h2>
                    <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => setIsEditScheduleModalOpen(false)}
                        aria-label="閉じる"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 予定名 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                予定名 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="例: 会議、打ち合わせ、イベント"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            />
                        </div>

                        {/* 時間設定 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    開始時刻 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    終了時刻 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                            </div>
                        </div>

                        {/* 繰り返し設定 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                繰り返し
                            </label>
                            <select
                                name="repeat"
                                value={formData.repeat}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            >
                                <option value="none">なし</option>
                                <option value="weekly">毎週</option>
                                <option value="monthly">毎月</option>
                                <option value="yearly">毎年</option>
                            </select>
                        </div>

                        {/* 場所 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                場所
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="例: 会議室A、オンライン、カフェ"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            />
                        </div>

                        {/* メモ */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                メモ
                            </label>
                            <textarea
                                name="memo"
                                value={formData.memo}
                                onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                                placeholder="詳細や注意事項を入力してください"
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                            />
                        </div>

                        {/* ボタン */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsEditScheduleModalOpen(false)}
                                disabled={isSubmitting || isDeleting}
                                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isDeleting}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        更新中...
                                    </span>
                                ) : (
                                    "更新"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isSubmitting || isDeleting}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                {isDeleting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        削除中...
                                    </span>
                                ) : (
                                    "削除"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
