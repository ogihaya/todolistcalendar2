import LoginButton from "@/components/LoginButton";
import { MdSettings } from "react-icons/md";
import { useState, useEffect } from "react";
import { Settings } from "@/types/event";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";

interface SettingSideModalProps {
    setIsSettingSideModalOpen: (isSettingSideModalOpen: boolean) => void;
    settings: Settings | null;
}

export default function SettingSideModal({ setIsSettingSideModalOpen, settings }: SettingSideModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 日付をフォーマットする関数（HTML input用）
    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        availableTimePerDay: settings?.availableTimePerDay.toString() || "",
        dateTakeIntoAccount: formatDateForInput(settings?.dateTakeIntoAccount || new Date()) || "",
        availableTimePerUnscheduledDay: settings?.availableTimePerUnscheduledDay.toString() || ""
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                availableTimePerDay: settings.availableTimePerDay.toString(),
                dateTakeIntoAccount: formatDateForInput(settings.dateTakeIntoAccount),
                availableTimePerUnscheduledDay: settings.availableTimePerUnscheduledDay.toString()
            });
        }
    }, [settings]);

    // フォームを送信する関数
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // フォームのデフォルトの送信動作を防ぐ

        // バリデーション（入力値の検証）
        if (!formData.availableTimePerDay || !formData.dateTakeIntoAccount || !formData.availableTimePerUnscheduledDay) {
            alert("一日あたり使える時間、予定確定日、予定未確定日の一日あたり使える時間は必須です");
            return;
        }

        // 予定未確定日の一日あたり使える時間が正の数であることを確認
        const availableTimePerUnscheduledDay = parseFloat(formData.availableTimePerUnscheduledDay);
        if (availableTimePerUnscheduledDay <= 0) {
            alert("予定未確定日の一日あたり使える時間は正の数である必要があります");
            return;
        }
        // 一日あたり使える時間が正の数であることを確認
        const availableTimePerDay = parseFloat(formData.availableTimePerDay);
        if (availableTimePerDay <= 0) {
            alert("一日あたり使える時間は正の数である必要があります");
            return;
        }

        setIsSubmitting(true); // 送信開始

        try {
            // 現在のユーザーIDを取得
            const userId = auth.currentUser?.uid;
            if (!userId) {
                throw new Error('ユーザーがログインしていません');
            }
            const dateTakeIntoAccount = new Date(formData.dateTakeIntoAccount);
            dateTakeIntoAccount.setHours(0, 0, 0, 0);
            // Firestoreに保存するデータを作成
            const settingsData: Omit<Settings, 'id'> = {
                availableTimePerDay: availableTimePerDay,
                dateTakeIntoAccount: dateTakeIntoAccount,
                availableTimePerUnscheduledDay: availableTimePerUnscheduledDay,
            };

            await setDoc(doc(db, "users", userId, 'settings', 'userSettings'), settingsData);

            setIsSettingSideModalOpen(false); // モーダルを閉じる

        } catch (error) {
            console.error("設定の保存に失敗しました:", error);
            alert("設定の保存に失敗しました。もう一度お試しください。");
        } finally {
            setIsSubmitting(false); // 送信完了
        }
    };
    return (
        // モーダルの背景を含む最外層のラッパー
        <div
            className="fixed inset-0 flex items-start justify-end bg-black/30 z-50"
            onClick={() => setIsSettingSideModalOpen(false)} // 背景クリックでモーダルを閉じる
        >
            {/* サイドモーダル本体 */}
            <div
                className="relative bg-white border-l border-gray-200 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()} // モーダル本体のクリックイベントが背景に伝播するのを防ぐ
            >
                {/* 右上の閉じるボタン */}
                {/* 右上に設定アイコンを配置 */}
                <div className="text-right m-1">
                    <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setIsSettingSideModalOpen(false)}>
                        <MdSettings className="text-gray-700 text-xl" />
                    </button>
                </div>
                <div className="p-4">
                    <LoginButton />
                    <h1 className="text-lg font-bold border-t border-gray-200 pt-4 mt-4">詳細設定</h1>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm text-gray-600 mt-2">
                                一日あたり使える時間
                            </label>
                            <input type="number" className="border border-gray-300" value={formData.availableTimePerDay} onChange={(e) => setFormData({ ...formData, availableTimePerDay: e.target.value })} />
                            <span className="text-sm text-gray-500">時間</span>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mt-2">
                                予定確定日
                            </label>
                            <input type="date" className="border border-gray-300" value={formData.dateTakeIntoAccount} onChange={(e) => setFormData({ ...formData, dateTakeIntoAccount: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mt-2">
                                予定未確定日の一日当たり使える時間
                            </label>
                            <input type="number" step="0.1" className="border border-gray-300" value={formData.availableTimePerUnscheduledDay} onChange={(e) => setFormData({ ...formData, availableTimePerUnscheduledDay: e.target.value })} />
                        </div>
                        <button type="submit" className="px-4 py-1 mt-2 border border-gray-300 text-black hover:bg-gray-50 disabled:opacity-50">{isSubmitting ? "更新中..." : "更新"}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}