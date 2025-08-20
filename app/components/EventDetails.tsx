import { Schedule, Task } from "@/types/event";

interface EventDetailsProps {
    selectedDate: Date;
    selectedSchedule: Schedule[];
    selectedTask: Task[];
    setIsEditScheduleModalOpen: (isEditScheduleModalOpen: boolean) => void;
    setIsEditTaskModalOpen: (isEditTaskModalOpen: boolean) => void;
    setEditingSchedule: (editingSchedule: Schedule) => void;
    setEditingTask: (editingTask: Task) => void;
}

export default function EventDetails({ selectedDate, selectedSchedule, selectedTask, setIsEditScheduleModalOpen, setIsEditTaskModalOpen, setEditingSchedule, setEditingTask }: EventDetailsProps) {
    // 日付を日本語形式でフォーマットする関数
    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        };
        return date.toLocaleDateString('ja-JP', options);
    };

    // 時間をフォーマットする関数
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            {/* 日付ヘッダー */}
            <h2 className="text-lg font-bold">
                {formatDate(selectedDate)}
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
                        <div key={schedule.id} className="border-l-4 border-blue-500 pl-2 bg-blue-50 rounded-r-lg mb-1 flex justify-between items-center">
                            <div>
                                <span className="text-sm text-gray-600 mr-2">
                                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                </span>
                                <span className="font-medium text-gray-800 mr-2">{schedule.name}</span>
                                {schedule.location && (
                                    <span className="text-sm text-gray-500 mr-2">
                                        📍{schedule.location}
                                    </span>
                                )}
                                {schedule.memo && (
                                    <span className="text-sm text-gray-600 mr-2">
                                        📝 {schedule.memo}
                                    </span>
                                )}
                            </div>
                            <div>
                                <button className="text-sm text-gray-600 mr-6 my-1 bg-gray-50 border border-gray-600 rounded-sm px-1 hover:bg-gray-300" onClick={() => {
                                    setIsEditScheduleModalOpen(true);
                                    setEditingSchedule(schedule);
                                }}>編集</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* タスクの表示 */}
            {selectedTask.length > 0 && (
                <div>
                    {selectedTask.map((task) => (
                        <div key={task.id} className="border-l-4 border-green-500 pl-2 bg-green-50 rounded-r-lg mb-1 flex justify-between items-center">
                            <div>
                                <span className="font-medium text-gray-800 mr-2">{task.name}</span>
                                <span className="text-sm text-gray-600 mr-2">
                                    📅 期限: {formatDate(task.deadline)}
                                </span>
                                <span className="text-sm text-gray-600 mr-2">
                                    ⏱️ 所要時間: {task.estimatedTime}時間
                                </span>
                                {task.memo && (
                                    <span className="text-sm text-gray-600 mr-2">
                                        📝 {task.memo}
                                    </span>
                                )}
                            </div>
                            <div>
                                <button className="text-sm text-gray-600 mr-6 my-1 bg-gray-50 border border-gray-600 rounded-sm px-1 hover:bg-gray-300" onClick={() => {
                                    setIsEditTaskModalOpen(true);
                                    setEditingTask(task);
                                }}>編集</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
