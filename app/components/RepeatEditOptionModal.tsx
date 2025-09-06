import { Schedule } from "@/types/event";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { addBlackoutDatesFunction, makeEndTime, makeStartTime } from "@/Utils/DeleteUtil";

interface RepeatEditOptionModalProps {
    setRepeatEditOpitonModalOpen: (repeatEditOpitonModalOpen: boolean) => void;
    setIsEditScheduleModalOpen: (isEditScheduleModalOpen: boolean) => void;
    editingSchedule: Schedule | null;
    setEditingSchedule: (editingSchedule: Schedule | null) => void;
    selectedDate: Date;
}

export default function RepeatEditOptionModal({ setRepeatEditOpitonModalOpen, setIsEditScheduleModalOpen, editingSchedule, setEditingSchedule, selectedDate }: RepeatEditOptionModalProps) {


    const processThisSchedule = async () => {
        if (!editingSchedule) return;

        try {
            // 現在のユーザーIDを取得
            const userId = auth.currentUser?.uid;
            if (!userId) {
                throw new Error('ユーザーがログインしていません');
            }

            /*
            // 選択された日付の前日と翌日を計算
            const previousDay = new Date(selectedDate);
            previousDay.setDate(selectedDate.getDate() - 1);

            const nextDay = new Date(selectedDate);
            nextDay.setDate(selectedDate.getDate() + 1);

            const { id, ...scheduleWithoutId } = editingSchedule;
            // ①(1) editingScheduleのrepeatEndをselectedDateの一日前に設定した予定
            const scheduleBefore: Omit<Schedule, 'id'> = {
                ...scheduleWithoutId,
                repeatEndDate: previousDay,
                link: editingSchedule.id
            };

            // ①(2) editingScheduleのrepeatStartをselectedDateの一日後に設定した予定
            const scheduleAfter: Omit<Schedule, 'id'> = {
                ...scheduleWithoutId,
                repeatStartDate: nextDay,
                link: editingSchedule.id
            };

            const newStartTime = makeStartTime(selectedDate, editingSchedule.startTime);
            const newEndTime = makeEndTime(selectedDate, editingSchedule.endTime);

            console.log("newStartTime", newStartTime);
            console.log("newEndTime", newEndTime);

            // ①(3) editingScheduleのrepeatStartとrepeatEndをselectedDateに設定した予定
            const scheduleCurrent: Omit<Schedule, 'id'> = {
                ...scheduleWithoutId,
                startTime: newStartTime,
                endTime: newEndTime,
                repeat: "none",
                repeatStartDate: selectedDate,
                repeatEndDate: null
            };

            if (editingSchedule.link) {
                await deleteSchedulesByLink(editingSchedule.link);
            } else {
                await deleteDoc(doc(db, "users", userId, 'schedules', editingSchedule.id));
            }

            // Firestoreに新しい予定を保存
            await addDoc(collection(db, "users", userId, 'schedules'), scheduleBefore);
            await addDoc(collection(db, "users", userId, 'schedules'), scheduleAfter);
            const currentScheduleRef = await addDoc(collection(db, "users", userId, 'schedules'), scheduleCurrent);

            const newSchedule: Schedule = {
                ...scheduleCurrent,
                id: currentScheduleRef.id
            };
            console.log("newSchedule", newSchedule);
            setEditingSchedule(newSchedule);
            */
     
            const addBlackoutDates = addBlackoutDatesFunction(editingSchedule, selectedDate);
            console.log("addBlackoutDates", addBlackoutDates);

            const updatedSchedule = {
                blackoutDates: [...(editingSchedule.blackoutDates || []), ...addBlackoutDates],
            }

            await updateDoc(doc(db, "users", userId, 'schedules', editingSchedule.id), updatedSchedule);

            const { id, ...editingScheduleWithoutId } = editingSchedule;
            const newSchedule: Omit<Schedule, 'id'> = {
                ...editingScheduleWithoutId,
                startTime: makeStartTime(addBlackoutDates, editingSchedule.startTime),
                endTime: makeEndTime(addBlackoutDates, editingSchedule.endTime),
                repeat: "none",
                repeatStartDate: selectedDate,
                repeatEndDate: null
            }
            console.log("newSchedule", newSchedule);


            const newScheduleRef = await addDoc(collection(db, "users", userId, 'schedules'), newSchedule);

            setEditingSchedule({
                ...newSchedule,
                id: newScheduleRef.id
            });

        } catch (error) {
            console.error("予定の分割に失敗しました:", error);
            alert("予定の分割に失敗しました。もう一度お試しください。");
            return;
        }
    }

    const processFutureSchedules = async () => {
        if (!editingSchedule) return;

        try {
            // 現在のユーザーIDを取得
            const userId = auth.currentUser?.uid;
            if (!userId) {
                throw new Error('ユーザーがログインしていません');
            }

            // 選択された日付の前日と翌日を計算
            const previousDay = new Date(selectedDate);
            previousDay.setDate(selectedDate.getDate() - 1);

            const { id, ...scheduleWithoutId } = editingSchedule;
            const scheduleBefore: Omit<Schedule, 'id'> = {
                ...scheduleWithoutId,
                repeatEndDate: previousDay,
            }

            await updateDoc(doc(db, "users", userId, 'schedules', editingSchedule.id), scheduleBefore);

            const addBlackoutDates = addBlackoutDatesFunction(editingSchedule, selectedDate);
            const newStartTime = makeStartTime(addBlackoutDates, editingSchedule.startTime);
            const newEndTime = makeEndTime(addBlackoutDates, editingSchedule.endTime);

            const scheduleAfter: Omit<Schedule, 'id'> = {
                ...scheduleWithoutId,
                repeatStartDate: addBlackoutDates[0],
                startTime: newStartTime,
                endTime: newEndTime,
            }    

            const afterScheduleRef = await addDoc(collection(db, "users", userId, 'schedules'), scheduleAfter);

            const newSchedule: Schedule = {
                ...scheduleAfter,
                id: afterScheduleRef.id
            };
            setEditingSchedule(newSchedule);

        } catch (error) {
            console.error("予定の分割に失敗しました:", error);
            alert("予定の分割に失敗しました。もう一度お試しください。");
            return;
        }
    }

    return (
        // モーダルの背景を含む最外層のラッパー
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
            onClick={() => setRepeatEditOpitonModalOpen(false)} // 背景クリックでモーダルを閉じる
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
                    onClick={() => setRepeatEditOpitonModalOpen(false)}
                    aria-label="閉じる"
                >
                    ×
                </button>
                <button onClick={() => {
                    setRepeatEditOpitonModalOpen(false);
                    setIsEditScheduleModalOpen(true);
                }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >すべての予定を編集</button>
                <button onClick={() => {
                    processThisSchedule();
                    setRepeatEditOpitonModalOpen(false);
                    setIsEditScheduleModalOpen(true);
                }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >この予定だけを編集</button>
                <button onClick={() => {
                    processFutureSchedules();
                    setRepeatEditOpitonModalOpen(false);
                    setIsEditScheduleModalOpen(true);
                }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >以降の予定を編集</button>
            </div>
        </div>
    );
}