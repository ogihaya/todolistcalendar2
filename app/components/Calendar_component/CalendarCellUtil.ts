import { Schedule, Task } from "@/types/event";

// 週表示の際にスケジュールの期間内の曜日を取得する関数
export const getWeekDaysInScheduleRange = (startDate: Date, endDate: Date): number[] => {
    const weekDays: number[] = [];

    // 日付のみを取得（時刻を00:00:00に設定）
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        // 曜日を取得（0:日曜日 ～ 6:土曜日）
        const dayOfWeek = currentDate.getDay();
        weekDays.push(dayOfWeek);

        // 次の日へ
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return weekDays;
};


export const getMonthDaysInScheduleRange = (startDate: Date, endDate: Date): number[] => {
    const monthDays: number[] = [];

    // 日付のみを取得（時刻を00:00:00に設定）
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        // 日付を取得（1-31）
        const dayOfMonth = currentDate.getDate();
        monthDays.push(dayOfMonth);

        // 次の日へ
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return monthDays;
};


/**
* スケジュールの期間内の月と日付を取得する関数（毎年用）
* @param schedule スケジュール
* @returns 期間内の月と日付の配列（{month: 0-11, day: 1-31}）
*/
export const getYearMonthDaysInScheduleRange = (startDate: Date, endDate: Date): Array<{ month: number, day: number }> => {
    const yearMonthDays: Array<{ month: number, day: number }> = [];

    // 日付のみを取得（時刻を00:00:00に設定）
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        // 月と日付を取得
        const month = currentDate.getMonth(); // 0-11（0:1月, 1:2月, ..., 11:12月）
        const day = currentDate.getDate();    // 1-31

        yearMonthDays.push({ month, day });

        // 次の日へ
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return yearMonthDays;
};


/**
* スケジュールの期間内の月と日付を取得する関数（用）
* @param schedule スケジュール
* @returns 期間内の月と日付の配列（{month: 0-11, day: 1-31}）
*/
export const getNoRepeatScheduleRange = (startDate: Date, endDate: Date): Array<{ year: number, month: number, day: number }> => {
    const noRepeatScheduleRange: Array<{ year: number, month: number, day: number }> = [];

    // 日付のみを取得（時刻を00:00:00に設定）
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        // 月と日付を取得
        const year = currentDate.getFullYear(); // 年
        const month = currentDate.getMonth(); // 0-11（0:1月, 1:2月, ..., 11:12月）
        const day = currentDate.getDate();    // 1-31

        noRepeatScheduleRange.push({ year, month, day });

        // 次の日へ
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return noRepeatScheduleRange;
};



// 対応する日付の予定を取得
export const getSchedulesForDate = (schedules: Schedule[], processDate: Date): Schedule[] => {
    return schedules.filter(schedule => {
        const startDate = new Date(schedule.startTime);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(schedule.endTime);
        endDate.setHours(0, 0, 0, 0);
        const repeatStartDate = new Date(schedule.repeatStartDate);
        if (schedule.repeatEndDate !== null && schedule.repeatEndDate < processDate) {
            return false;
        }
        if (schedule.blackoutDates && schedule.blackoutDates.some(blackoutDate => blackoutDate.getFullYear() === processDate.getFullYear() && blackoutDate.getMonth() === processDate.getMonth() && blackoutDate.getDate() === processDate.getDate())) {
            return false;
        }
        if (schedule.repeat === "daily") {
            return processDate >= startDate && processDate >= repeatStartDate;
        }
        else if (schedule.repeat === "weekly") {
            const weekDays = getWeekDaysInScheduleRange(startDate, endDate);
            return weekDays.includes(processDate.getDay()) && processDate >= startDate && processDate >= repeatStartDate;
        } else if (schedule.repeat === "monthly") {
            const monthDays = getMonthDaysInScheduleRange(startDate, endDate);
            return monthDays.includes(processDate.getDate()) && processDate >= startDate && processDate >= repeatStartDate;
        } else if (schedule.repeat === "yearly") {
            const yearMonthDays = getYearMonthDaysInScheduleRange(startDate, endDate);
            return yearMonthDays.some(({ month, day }) =>
                month === processDate.getMonth() && day === processDate.getDate()
            ) && processDate >= startDate && processDate >= repeatStartDate;
        } else {
            const noRepeatScheduleRange = getNoRepeatScheduleRange(startDate, endDate);
            return noRepeatScheduleRange.some(({ year, month, day }) =>
                year === processDate.getFullYear() && month === processDate.getMonth() && day === processDate.getDate()
            )
        }
    });
};

export const getTasksForDate = (tasks: Task[], processDate: Date): Task[] => {
    return tasks.filter(task => {
        return task.deadline.getFullYear() === processDate.getFullYear() && task.deadline.getMonth() === processDate.getMonth() && task.deadline.getDate() === processDate.getDate();
    });
};