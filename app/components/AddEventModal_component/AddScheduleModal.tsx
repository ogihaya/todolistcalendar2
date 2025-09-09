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
                    {isSubmitting ? "保存中..." : "予定を追加"}
                </button>
            </div>
        </form>
    );
}