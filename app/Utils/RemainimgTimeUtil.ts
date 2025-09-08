import { Schedule, Task } from "@/types/event";
import { getSchedulesForDate } from "@/Utils/CalendarCellUtil";
/**
 * 今日から指定日までの各日付のスケジュール合計時間を計算する関数
 * 
 * @param today 今日の日付
 * @param schedules 予定の配列
 * @param tasks タスクの配列
 * @param availableTimePerDay 1日の利用可能時間（時間単位）
 * @param dateTakeIntoAccount 考慮する最終日
 * @returns 日付をキー、スケジュール合計時間を値とするオブジェクト
 */
export const makeDailyScheduleTime = (
    today: Date,
    schedules: Schedule[],
    tasks: Task[],
    availableTimePerDay: number,
    dateTakeIntoAccount: Date
): Map<string, number> => {
    // 1. タスクの中で一番遅い締め切り日のタスクを取得
    const latestDeadlineTask = tasks.reduce((latest, current) => {
        return current.deadline > latest.deadline ? current : latest;
    }, tasks[0]);

    // 2. 一番遅いタスクの締め切り日とdateTakeIntoAccountを比較して早い方を最終日とする
    const finalDate = latestDeadlineTask && latestDeadlineTask.deadline < dateTakeIntoAccount
        ? latestDeadlineTask.deadline
        : dateTakeIntoAccount;

    finalDate.setHours(0, 0, 0, 0);

    // 3. 今日から最終日まで各日付のスケジュール合計時間を計算
    const dailyScheduleTime: Map<string, number> = new Map();

    // 日付を1日ずつ進めながら処理
    for (let currentDate = new Date(today); currentDate <= finalDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const dateKey = new Date(currentDate); // ✅ 新しいDateオブジェクトを作成
        dateKey.setHours(0, 0, 0, 0);
        let totalScheduleTime = 0;

        const schedulesForDate = getSchedulesForDate(schedules, currentDate);

        schedulesForDate.forEach(schedule => {
            let start = schedule.startTime.getTime();
            let end = schedule.endTime.getTime();

            // datekeyの日付を取得（時刻は0:00:00に設定済み）
            const dateKeyDate = new Date(dateKey);
            dateKeyDate.setHours(0, 0, 0, 0);

            if (schedule.repeat === 'none') {
                // 繰り返しなしの場合：日付が異なる場合に調整
                const startDate = new Date(schedule.startTime);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(schedule.endTime);
                endDate.setHours(0, 0, 0, 0);

                // startTimeの日付がdatekeyと異なる場合、startをdatekeyの0:00に設定
                if (startDate.getTime() !== dateKeyDate.getTime()) {
                    start = dateKeyDate.getTime();
                }

                // endTimeの日付がdatekeyと異なる場合、endをdatekeyの23:59に設定
                if (endDate.getTime() !== dateKeyDate.getTime()) {
                    const endOfDay = new Date(dateKeyDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    end = endOfDay.getTime();
                }
            } else if (schedule.repeat === 'weekly') {
                // 週次繰り返しの場合：曜日が異なる場合に調整
                const startDayOfWeek = schedule.startTime.getDay(); // 0-6 (日曜日-土曜日)
                const endDayOfWeek = schedule.endTime.getDay();
                const dateKeyDayOfWeek = dateKey.getDay();

                // startTimeの曜日がdatekeyと異なる場合、startをdatekeyの0:00に設定
                if (startDayOfWeek !== dateKeyDayOfWeek) {
                    start = dateKeyDate.getTime();
                } else {
                    // startTimeの曜日がdatekeyと同じ場合
                    // datekeyの年月日とstartTimeの時間を組み合わせた新しいDateオブジェクトを作成
                    const combinedDate = new Date(dateKey);
                    combinedDate.setHours(
                        schedule.startTime.getHours(),
                        schedule.startTime.getMinutes(),
                        schedule.startTime.getSeconds(),
                        schedule.startTime.getMilliseconds()
                    );
                    start = combinedDate.getTime();
                }

                // endTimeの曜日がdatekeyと異なる場合、endをdatekeyの23:59に設定
                if (endDayOfWeek !== dateKeyDayOfWeek) {
                    const endOfDay = new Date(dateKeyDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    end = endOfDay.getTime();
                } else {
                    // datekeyの年月日とstartTimeの時間を組み合わせた新しいDateオブジェクトを作成
                    const combinedDate = new Date(dateKey);
                    combinedDate.setHours(
                        schedule.endTime.getHours(),
                        schedule.endTime.getMinutes(),
                        schedule.endTime.getSeconds(),
                        schedule.endTime.getMilliseconds()
                    );
                    end = combinedDate.getTime();
                }
            } else if (schedule.repeat === 'monthly' || schedule.repeat === 'yearly') {
                // 月次・年次繰り返しの場合：日が異なる場合に調整
                const startDay = schedule.startTime.getDate(); // 1-31
                const endDay = schedule.endTime.getDate();
                const dateKeyDay = dateKey.getDate();

                // startTimeの日がdatekeyと異なる場合、startをdatekeyの0:00に設定
                if (startDay !== dateKeyDay) {
                    start = dateKeyDate.getTime();
                } else {
                    // datekeyの年月日とstartTimeの時間を組み合わせた新しいDateオブジェクトを作成
                    const combinedDate = new Date(dateKey);
                    combinedDate.setHours(
                        schedule.startTime.getHours(),
                        schedule.startTime.getMinutes(),
                        schedule.startTime.getSeconds(),
                        schedule.startTime.getMilliseconds()
                    );
                    start = combinedDate.getTime();
                }

                // endTimeの日がdatekeyと異なる場合、endをdatekeyの23:59に設定
                if (endDay !== dateKeyDay) {
                    const endOfDay = new Date(dateKeyDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    end = endOfDay.getTime();
                } else {
                    // datekeyの年月日とstartTimeの時間を組み合わせた新しいDateオブジェクトを作成
                    const combinedDate = new Date(dateKey);
                    combinedDate.setHours(
                        schedule.endTime.getHours(),
                        schedule.endTime.getMinutes(),
                        schedule.endTime.getSeconds(),
                        schedule.endTime.getMilliseconds()
                    );
                    end = combinedDate.getTime();
                }
            }

            totalScheduleTime += (end - start) / (1000 * 60 * 60);
        })
        dailyScheduleTime.set(dateKey.toDateString(), Math.min(totalScheduleTime, availableTimePerDay));
    }
    return dailyScheduleTime;
};

/**
 * タスクの猶予時間を計算する関数
 * 
 * @param today 今日の日付
 * @param schedules 予定の配列
 * @param task 計算対象のタスク
 * @param tasks 全てのタスクの配列
 * @param availableTimePerDay 1日の利用可能時間（時間単位）
 * @param dateTakeIntoAccount 考慮する最終日
 * @param availableTimePerUnscheduledDay 予定なし日の利用可能時間（時間単位）
 * @returns 猶予時間（時間単位）
 */
// export const calculateRemainingTime = (
//     today: Date,
//     schedules: Schedule[],
//     task: Task,
//     tasks: Task[],
//     availableTimePerDay: number,
//     dateTakeIntoAccount: Date,
//     availableTimePerUnscheduledDay: number
// ): number => {
//     // 1. 引数のタスクの締切日を取得
//     const deadline = new Date(task.deadline);
//     deadline.setHours(0, 0, 0, 0);

//     // 2. 今日から締切日までの日数と、その間の各日の予定で使われる時間の合計を計算
//     const dailyScheduleTime = makeDailyScheduleTime(today, schedules, tasks, availableTimePerDay, dateTakeIntoAccount);

//     // 今日から締切日までの日数を計算
//     const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

//     // 3. 総利用可能時間（予定を考慮する前）「日数 × 一日あたり使える時間」を計算
//     let totalAvailableTime = daysUntilDeadline * availableTimePerDay;

//     const dateTakeIntoAccountStart = new Date(dateTakeIntoAccount);
//     dateTakeIntoAccountStart.setHours(0, 0, 0, 0);
//     // 今日からdateTakeIntoAccountまでの日数を計算
//     const daysUntilDateTakeIntoAccount = Math.ceil((dateTakeIntoAccountStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))+1;

//     // 締切日とdateTakeIntoAccountの早い方までの日数を計算
//     const daysToCalculate = Math.min(daysUntilDeadline, daysUntilDateTakeIntoAccount);

//     // 4. 予定で使われる時間を差し引く
//     let totalScheduleTime = 0;
//     for (let i = 0; i < daysToCalculate; i++) {
//         const currentDate = new Date(today);
//         currentDate.setDate(today.getDate() + i);

//         const scheduleTimeForDay = dailyScheduleTime.get(currentDate.toDateString()) || 0;
//         totalScheduleTime += scheduleTimeForDay;
//     }
//     // 予定で使われる時間を差し引く
//     totalAvailableTime -= totalScheduleTime;

//     // 5. 該当タスクを含む、締切日以前（または同日）のタスクの所要時間も差し引く
//     const tasksBeforeDeadline = tasks.filter(t => {
//         const taskDeadline = new Date(t.deadline);
//         taskDeadline.setHours(0, 0, 0, 0);
//         return taskDeadline <= deadline;
//     });

//     const totalTaskTime = tasksBeforeDeadline.reduce((sum, t) => sum + t.estimatedTime, 0);
//     totalAvailableTime -= totalTaskTime;

//     // 6. 予定未確定の日程の減算
//     const deadlineDate = new Date(deadline);
//     deadlineDate.setHours(0, 0, 0, 0);
//     const noAccountDaysLeft = Math.ceil((deadlineDate.getTime() - dateTakeIntoAccountStart.getTime()) / (1000 * 60 * 60 * 24) - 1); // 考慮してる日から締切までの日数
//     if (noAccountDaysLeft > 0) {
//         totalAvailableTime -= noAccountDaysLeft * (availableTimePerDay - availableTimePerUnscheduledDay);
//     }

//     // 結果を返す（負の値の場合は0を返す）
//     return totalAvailableTime;
// };


// 最適化された猶予時間計算関数
export const calculateRemainingTime = (
    today: Date,
    dailyScheduleTime: Map<string, number>, // 事前計算済みの日別スケジュール時間
    task: Task,
    tasks: Task[],
    availableTimePerDay: number,
    dateTakeIntoAccount: Date,
    availableTimePerUnscheduledDay: number
): number => {
    // 1. 引数のタスクの締切日を取得
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    // 今日から締切日までの日数を計算
    const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // 2. 総利用可能時間（予定を考慮する前）「日数 × 一日あたり使える時間」を計算
    let totalAvailableTime = daysUntilDeadline * availableTimePerDay;

    const dateTakeIntoAccountStart = new Date(dateTakeIntoAccount);
    dateTakeIntoAccountStart.setHours(0, 0, 0, 0);
    // 今日からdateTakeIntoAccountまでの日数を計算
    const daysUntilDateTakeIntoAccount = Math.ceil((dateTakeIntoAccountStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))+1;

    // 締切日とdateTakeIntoAccountの早い方までの日数を計算
    const daysToCalculate = Math.min(daysUntilDeadline, daysUntilDateTakeIntoAccount);

    // 3. 予定で使われる時間を差し引く（事前計算済みのデータを使用）
    let totalScheduleTime = 0;
    for (let i = 0; i < daysToCalculate; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        const scheduleTimeForDay = dailyScheduleTime.get(currentDate.toDateString()) || 0;
        totalScheduleTime += scheduleTimeForDay;
    }
    // 予定で使われる時間を差し引く
    totalAvailableTime -= totalScheduleTime;

    // 4. 該当タスクを含む、締切日以前（または同日）のタスクの所要時間も差し引く
    const tasksBeforeDeadline = tasks.filter(t => {
        const taskDeadline = new Date(t.deadline);
        taskDeadline.setHours(0, 0, 0, 0);
        return taskDeadline <= deadline;
    });

    const totalTaskTime = tasksBeforeDeadline.reduce((sum, t) => sum + t.estimatedTime, 0);
    totalAvailableTime -= totalTaskTime;

    // 5. 予定未確定の日程の減算
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const noAccountDaysLeft = Math.ceil((deadlineDate.getTime() - dateTakeIntoAccountStart.getTime()) / (1000 * 60 * 60 * 24) - 1);
    if (noAccountDaysLeft > 0) {
        totalAvailableTime -= noAccountDaysLeft * (availableTimePerDay - availableTimePerUnscheduledDay);
    }

    // 結果を返す（負の値の場合は0を返す）
    return totalAvailableTime;
};