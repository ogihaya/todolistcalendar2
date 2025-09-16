import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Schedule } from "@/types/event";

// モーダルのプロパティの型定義
interface AddScheduleModalProps {
    onClose: () => void; // モーダルを閉じる関数
    selectedDate: Date;
}

export default function AddScheduleModal({ onClose, selectedDate }: AddScheduleModalProps) {
    // 選択された日付の0:00を初期値として設定
    const getInitialDateTime = () => {
        // ローカルタイムゾーンを考慮したISO文字列形式で返す
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const hours = String(selectedDate.getHours()).padStart(2, '0');
        const minutes = String(selectedDate.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;

    };
    // フォームの状態を管理するstate
    const [formData, setFormData] = useState({
        name: "",
        startTime: getInitialDateTime(),
        endTime: getInitialDateTime(),
        repeat: "none" as const,
        location: "",
        memo: ""
    });

    // 送信中の状態を管理
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            // 現在のユーザーIDを取得
            const userId = auth.currentUser?.uid;
            if (!userId) {
                alert("ユーザーがログインしていません。右上の設定ボタンからログインしてください。");
                throw new Error('ユーザーがログインしていません');
            }
            // Firestoreに保存するデータを作成
            const scheduleData: Omit<Schedule, 'id'> = {
                type: 'schedule',
                name: formData.name,
                startTime: new Date(formData.startTime),
                endTime: new Date(formData.endTime),
                repeat: formData.repeat,
                repeatStartDate: new Date(new Date(formData.startTime).setHours(0, 0, 0, 0)), // 繰り返し開始日は開始時刻の0時0分0秒
                repeatEndDate: null,
                location: formData.location,
                memo: formData.memo,
                blackoutDates: []
            };

            // Firestoreの'schedules'コレクションにデータを追加
            await addDoc(collection(db, "users", userId, 'schedules'), scheduleData);

            onClose(); // モーダルを閉じる

        } catch (error) {
            console.error("予定の保存に失敗しました:", error);
            alert("予定の保存に失敗しました。もう一度お試しください。");
        } finally {
            setIsSubmitting(false); // 送信完了
        }
    };

    return (
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
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                    キャンセル
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            保存中...
                        </span>
                    ) : (
                        "予定を追加"
                    )}
                </button>
            </div>
        </form>
    );
}