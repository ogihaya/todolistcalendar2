import { Schedule } from "@/types/event";
import { getWeekDaysInScheduleRange } from "@/Utils/CalendarCellUtil";

/*
export const deleteSchedulesByLink = async (link: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // 特定の条件に合う予定を検索
    const schedulesRef = collection(db, "users", userId, 'schedules');
    const q = query(
        schedulesRef,
        where("link", "==", link)
    );

    const querySnapshot = await getDocs(q);

    // バッチ処理で複数の予定を削除
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
};
*/

export const addBlackoutDatesFunction = (editingSchedule: Schedule, selectedDate: Date) => {

    const startDate = new Date(editingSchedule.startTime);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(editingSchedule.endTime);
    endDate.setHours(0, 0, 0, 0);
    const editingScheduleDays = getWeekDaysInScheduleRange(startDate, endDate);

    const processDate = new Date(selectedDate);
    processDate.setHours(0, 0, 0, 0);

    const addBlackoutDates: Date[] = [];

    while (editingScheduleDays.includes(processDate.getDay())) {
        processDate.setDate(processDate.getDate() - 1);
    }
    processDate.setDate(processDate.getDate() + 1);
    while (editingScheduleDays.includes(processDate.getDay())) {
        const dateCopy = new Date(processDate);
        addBlackoutDates.push(dateCopy);
        processDate.setDate(processDate.getDate() + 1);
    }

    return addBlackoutDates;
}

export const makeStartTime = (addBlackoutDates: Date[], startTime: Date) => {
    const newStartTime = new Date(addBlackoutDates[0]);
    newStartTime.setHours(startTime.getHours());
    newStartTime.setMinutes(startTime.getMinutes());
    newStartTime.setSeconds(startTime.getSeconds());
    newStartTime.setMilliseconds(startTime.getMilliseconds());
    return newStartTime;
}

export const makeEndTime = (addBlackoutDates: Date[], endTime: Date) => {
    const newEndTime = new Date(addBlackoutDates[addBlackoutDates.length - 1]);
    newEndTime.setHours(endTime.getHours());
    newEndTime.setMinutes(endTime.getMinutes());
    newEndTime.setSeconds(endTime.getSeconds());
    newEndTime.setMilliseconds(endTime.getMilliseconds());
    return newEndTime;
}

