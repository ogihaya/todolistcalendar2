import { Schedule, Task } from "@/types/event";
import { FaMapMarkerAlt, FaStickyNote, FaCalendarAlt, FaClock, FaEdit } from "react-icons/fa";
import { isHoliday } from "japanese-holidays";

interface EventDetailsProps {
    selectedDate: Date;
    selectedSchedule: Schedule[];
    selectedTask: Task[];
    setIsEditScheduleModalOpen: (isEditScheduleModalOpen: boolean) => void;
    setIsEditTaskModalOpen: (isEditTaskModalOpen: boolean) => void;
    setEditingSchedule: (editingSchedule: Schedule) => void;
    setEditingTask: (editingTask: Task) => void;
    setRepeatEditOpitonModalOpen: (repeatEditOpitonModalOpen: boolean) => void;
}

export default function EventDetails({ selectedDate, selectedSchedule, selectedTask, setIsEditScheduleModalOpen, setIsEditTaskModalOpen, setEditingSchedule, setEditingTask, setRepeatEditOpitonModalOpen }: EventDetailsProps) {
    // 日付を日本語形式でフォーマットする関数（曜日なし）
    const formatDateWithoutWeekday = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('ja-JP', options);
    };

    // 曜日を日本語形式でフォーマットする関数
    const formatWeekday = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short'
        };
        return date.toLocaleDateString('ja-JP', options);
    };

    // 曜日の色を取得する関数
    const getWeekdayColor = (date: Date) => {
        const dayOfWeek = date.getDay(); // 0:日曜日, 6:土曜日
        const holidayName = isHoliday(date);

        if (dayOfWeek === 0 || holidayName) {
            return "text-red-500"; // 日曜日と祝日は赤色
        } else if (dayOfWeek === 6) {
            return "text-blue-500"; // 土曜日は青色
        } else {
            return ""; // 平日はグレー色
        }
    };


    const getHolidayName = (date: Date) => {
        return isHoliday(date);
    };

    // 時間をフォーマットする関数
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const makeTimeDisplay = (schedule: Schedule) => {
        let start = formatTime(schedule.startTime);
        let end = formatTime(schedule.endTime);

        if (schedule.repeat === 'none') {
            // 繰り返しなしの場合：日付が異なる場合に調整
            const startDate = new Date(schedule.startTime);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(schedule.endTime);
            endDate.setHours(0, 0, 0, 0);

            // startTimeの日付がdatekeyと異なる場合、startをdatekeyの0:00に設定
            if (startDate.getTime() !== selectedDate.getTime()) {
                start = "--";
            }

            // endTimeの日付がdatekeyと異なる場合、endをdatekeyの23:59に設定
            if (endDate.getTime() !== selectedDate.getTime()) {
                end = "--";
            }
        } else if (schedule.repeat === 'weekly') {
            // 週次繰り返しの場合：曜日が異なる場合に調整
            const startDayOfWeek = schedule.startTime.getDay(); // 0-6 (日曜日-土曜日)
            const endDayOfWeek = schedule.endTime.getDay();
            const selectedDateDayOfWeek = selectedDate.getDay();

            // startTimeの曜日がdatekeyと異なる場合、startをdatekeyの0:00に設定
            if (startDayOfWeek !== selectedDateDayOfWeek) {
                start = "--";
            }

            // endTimeの曜日がdatekeyと異なる場合、endをdatekeyの23:59に設定
            if (endDayOfWeek !== selectedDateDayOfWeek) {
                end = "--";
            }
        } else if (schedule.repeat === 'monthly' || schedule.repeat === 'yearly') {
            // 月次・年次繰り返しの場合：日が異なる場合に調整
            const startDay = schedule.startTime.getDate(); // 1-31
            const endDay = schedule.endTime.getDate();
            const selectedDateDay = selectedDate.getDate();

            // startTimeの日がdatekeyと異なる場合、startをdatekeyの0:00に設定
            if (startDay !== selectedDateDay) {
                start = "--";
            }
            // endTimeの日がdatekeyと異なる場合、endをdatekeyの23:59に設定
            if (endDay !== selectedDateDay) {
                end = "--";
            }
        }
        return `${start} - ${end}`;
    }

    return (
        <div>
            {/* 日付ヘッダー */}
            <h2 className="text-lg font-bold">
                {formatDateWithoutWeekday(selectedDate)}
                (<span className={`${getWeekdayColor(selectedDate)}`}>{formatWeekday(selectedDate)}</span>)
                {/* 祝日の場合は祝日名を表示 */}
                {getHolidayName(selectedDate) && (
                    <span className="ml-2 text-sm font-normal text-red-500">
                        {getHolidayName(selectedDate)}
                    </span>
                )}
            </h2>

            {selectedSchedule.length === 0 && selectedTask.length === 0 && (
                <div className="text-center">
                    <p className="text-gray-500 text-lg">この日には予定がありません</p>
                    <p className="text-gray-400 text-sm">新しい予定やタスクを追加してみましょう！</p>
                </div>
            )}

            {/* スケジュール（予定）の表示 */}
            {selectedSchedule.length > 0 && (
                <div>
                    {selectedSchedule.map((schedule) => (
                        <div key={schedule.id} className="pl-2 bg-blue-50 rounded-r-lg mb-1 flex items-center">
                            <button className="text-sm text-gray-600 mr-2 my-1 bg-gray-50 border border-gray-600 rounded-sm px-1 hover:bg-gray-300 flex-shrink-0" onClick={() => {
                                if (schedule.repeat !== "none") {
                                    setRepeatEditOpitonModalOpen(true);
                                    setEditingSchedule(schedule);
                                } else {
                                    setIsEditScheduleModalOpen(true);
                                    setEditingSchedule(schedule);
                                }
                            }}><FaEdit /></button>
                            <div className="flex items-center border-l-4 border-blue-500 pl-2 truncate">
                                <span className="text-sm text-gray-600 mr-2 flex-shrink-0">
                                    {makeTimeDisplay(schedule)}
                                </span>
                                <span className="font-medium text-gray-800 mr-2">{schedule.name}</span>
                                {schedule.location && (
                                    <span className="text-sm text-gray-500 mr-2 flex items-center">
                                        <FaMapMarkerAlt />{schedule.location}
                                    </span>
                                )}
                                {schedule.memo && (
                                    <span className="text-sm text-gray-600 mr-2 flex items-center">
                                        <FaStickyNote /> {schedule.memo}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* タスクの表示 */}
            {selectedTask.length > 0 && (
                <div>
                    {selectedTask.map((task) => (
                        <div key={task.id} className="pl-2 bg-green-50 rounded-r-lg mb-1 flex items-center">
                            <button className="text-sm text-gray-600 mr-2 my-1 bg-gray-50 border border-gray-600 rounded-sm px-1 hover:bg-gray-300 flex-shrink-0" onClick={() => {
                                setIsEditTaskModalOpen(true);
                                setEditingTask(task);
                            }}><FaEdit /></button>
                            <div className="flex items-center border-l-4 border-green-500 pl-2 truncate">
                                <span className="font-medium text-gray-800 mr-2">{task.name}</span>
                                <span className="text-sm text-gray-600 mr-2 flex items-center">
                                    <FaCalendarAlt /> 期限: {formatDateWithoutWeekday(task.deadline)}
                                </span>
                                <span className="text-sm text-gray-600 mr-2 flex items-center">
                                    <FaClock /> 所要時間: {task.estimatedTime}時間
                                </span>
                                {task.memo && (
                                    <span className="text-sm text-gray-600 mr-2 flex items-center">
                                        <FaStickyNote /> {task.memo}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
