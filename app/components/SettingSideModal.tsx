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
                alert("ユーザーがログインしていません。右上の設定ボタンからログインしてください。");
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
            className="fixed inset-0 flex items-start justify-end bg-black/50 z-50"
            onClick={() => setIsSettingSideModalOpen(false)} // 背景クリックでモーダルを閉じる
        >
            {/* サイドモーダル本体 */}
            <div
                className="relative bg-white border-l border-slate-200 w-full max-w-md h-full overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // モーダル本体のクリックイベントが背景に伝播するのを防ぐ
            >
                {/* 右上の閉じるボタン */}
                {/* 右上に設定アイコンを配置 */}
                <div className="text-right m-1">
                    <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setIsSettingSideModalOpen(false)}>
                        <MdSettings className="text-gray-700 text-xl" />
                    </button>
                </div>

                <div className="px-6 space-y-2">
                    {/* ログインセクション */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">アカウント</h3>
                        <LoginButton />
                    </div>

                    {/* 詳細設定セクション */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">詳細設定</h3>
                        <form onSubmit={handleSubmit} className="space-y-2">
                            {/* 一日あたり使える時間 */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    一日あたり使える時間 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        min="0.1"
                                        step="0.1"
                                        value={formData.availableTimePerDay} 
                                        onChange={(e) => setFormData({ ...formData, availableTimePerDay: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors duration-200"
                                        placeholder="例: 8"
                                    />
                                    <span className="text-sm text-slate-500 font-medium">時間</span>
                                </div>
                            </div>

                            {/* 予定確定日 */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    予定確定日 <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="date" 
                                    value={formData.dateTakeIntoAccount} 
                                    onChange={(e) => setFormData({ ...formData, dateTakeIntoAccount: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors duration-200"
                                />
                            </div>

                            {/* 予定未確定日の一日あたり使える時間 */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    予定未確定日の一日あたり使える時間 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        min="0.1"
                                        value={formData.availableTimePerUnscheduledDay} 
                                        onChange={(e) => setFormData({ ...formData, availableTimePerUnscheduledDay: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors duration-200"
                                        placeholder="例: 4"
                                    />
                                    <span className="text-sm text-slate-500 font-medium">時間</span>
                                </div>
                            </div>

                            {/* 保存ボタン */}
                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
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
                                        "設定を保存"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}