import { useState, useMemo, useEffect } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { calculateRemainingTime, makeDailyScheduleTime } from "@/Utils/RemainimgTimeUtil";
import { Task, Schedule } from "@/types/event";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";

interface TaskListProps {
    today: Date;
    schedules: Schedule[];
    tasks: Task[];
    availableTimePerDay: number;
    dateTakeIntoAccount: Date;
    availableTimePerUnscheduledDay: number;
    onEditTask: (task: Task) => void;
    onMinDailySlackChange?: (value: number | null) => void;
}

// タスクと猶予時間を含む型定義
type TaskWithRemainingTime = Task & {
    remainingTime: number;
};

// 列ヘルパーを作成
const columnHelper = createColumnHelper<TaskWithRemainingTime>();

export default function TaskList({
    today,
    schedules,
    tasks,
    availableTimePerDay,
    dateTakeIntoAccount,
    availableTimePerUnscheduledDay,
    onEditTask,
    onMinDailySlackChange
}: TaskListProps) {
    // ソート状態を管理
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'deadline', desc: false } // デフォルトで締切日昇順
    ]);


    // 各タスクの猶予時間を計算して、タスク情報と組み合わせる
    const tasksWithRemainingTime = useMemo(() => {
        const dailyScheduleTime = makeDailyScheduleTime(today, schedules, tasks, availableTimePerDay, dateTakeIntoAccount);
        return tasks.map(task => {
            const remainingTime = calculateRemainingTime(
                today,
                dailyScheduleTime,
                task,
                tasks,
                availableTimePerDay,
                dateTakeIntoAccount,
                availableTimePerUnscheduledDay
            );

            return {
                ...task,
                remainingTime
            };
        });
    }, [today, schedules, tasks, availableTimePerDay, dateTakeIntoAccount, availableTimePerUnscheduledDay]);

    // (猶予時間 / 締め切り日までの日数) が最小のタスクと、その最小値を同時計算
    const { minTask, minDailySlack } = useMemo(() => {
        if (tasksWithRemainingTime.length === 0) {
            return { minTask: null as TaskWithRemainingTime | null, minDailySlack: null as number | null };
        }
        const getIndex = (task: TaskWithRemainingTime) => {
            const daysUntilDeadline = (task.deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            const denominator = daysUntilDeadline > 0 ? daysUntilDeadline : Number.EPSILON;
            return task.remainingTime / denominator;
        };
        let bestTask = tasksWithRemainingTime[0];
        let bestVal = getIndex(bestTask);
        for (let i = 1; i < tasksWithRemainingTime.length; i++) {
            const candidate = tasksWithRemainingTime[i];
            const v = getIndex(candidate);
            if (v < bestVal) {
                bestVal = v;
                bestTask = candidate;
            }
        }
        return { minTask: bestTask, minDailySlack: bestVal };
    }, [tasksWithRemainingTime, today]);

    useEffect(() => {
        if (onMinDailySlackChange) {
            onMinDailySlackChange(minDailySlack);
        }
    }, [minDailySlack, onMinDailySlackChange]);

    // 行の背景色を決定する関数
    const getRowBackgroundColor = (task: TaskWithRemainingTime) => {
        // タスクがない場合は通常の背景色
        if (!minTask) return "";

        // (猶予時間/締め切り日までの日数) が最小のタスクの場合
        if (task.id === minTask.id) {
            return "bg-red-100"; // 薄い赤の背景
        }

        // 上記タスクの締め切り日より早いタスクの場合
        if (task.deadline < minTask.deadline) {
            return "bg-red-100"; // 薄い赤の背景
        }

        return ""; // 通常の背景色
    };

    // 日付をフォーマットする関数
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // 時間をフォーマットする関数
    const formatTime = (hours: number) => {
        if (hours < 0) {
            return `-${Math.abs(hours).toFixed(1)}時間`;
        }
        return `${hours.toFixed(1)}時間`;
    };

    // 列定義を作成
    const columns = useMemo(
        () => [
            // タスク名列
            columnHelper.accessor('name', {
                id: 'name',
                header: ({ column }) => (
                    <button
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="flex items-center"
                    >
                        タスク名
                        {column.getIsSorted() === 'asc' && <FaSortUp />}
                        {column.getIsSorted() === 'desc' && <FaSortDown />}
                        {!column.getIsSorted() && <FaSort />}
                    </button>
                ),
                cell: ({ row }) => (
                    <div className="py-2">
                        <div className="font-medium text-slate-900">{row.original.name}</div>
                        {row.original.memo && (
                            <div className="text-xs text-slate-500 mt-1">
                                {row.original.memo}
                            </div>
                        )}
                    </div>
                ),
            }),

            // 締め切り日列
            columnHelper.accessor('deadline', {
                id: 'deadline',
                header: ({ column }) => (
                    <button
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="flex items-center"
                    >
                        締め切り日
                        {column.getIsSorted() === 'asc' && <FaSortUp />}
                        {column.getIsSorted() === 'desc' && <FaSortDown />}
                        {!column.getIsSorted() && <FaSort />}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <div className="py-2 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                            {formatDate(getValue())}
                        </span>
                    </div>
                ),
            }),

            // 所要時間列
            columnHelper.accessor('estimatedTime', {
                id: 'estimatedTime',
                header: ({ column }) => (
                    <button
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="flex items-center"
                    >
                        所要時間
                        {column.getIsSorted() === 'asc' && <FaSortUp />}
                        {column.getIsSorted() === 'desc' && <FaSortDown />}
                        {!column.getIsSorted() && <FaSort />}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <div className="py-2 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                            {formatTime(getValue())}
                        </span>
                    </div>
                ),
            }),

            // 猶予時間列
            columnHelper.accessor('remainingTime', {
                id: 'remainingTime',
                header: ({ column }) => (
                    <button
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="flex items-center"
                    >
                        猶予時間
                        {column.getIsSorted() === 'asc' && <FaSortUp />}
                        {column.getIsSorted() === 'desc' && <FaSortDown />}
                        {!column.getIsSorted() && <FaSort />}
                    </button>
                ),
                cell: ({ row }) => {
                    const remainingTime = row.original.remainingTime;
                    const isUrgent = remainingTime < 0;
                    const isWarning = remainingTime >= 0 && remainingTime < 24; // 24時間未満
                    
                    return (
                        <div className="py-2 text-center">
                            <span className={`
                                inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                                ${isUrgent 
                                    ? "bg-red-100 text-red-700" 
                                    : isWarning 
                                    ? "bg-yellow-100 text-yellow-700" 
                                    : "bg-green-100 text-green-700"
                                }
                            `}>
                                {formatTime(remainingTime)}
                            </span>
                        </div>
                    );
                },
            }),

            // 編集ボタン列
            columnHelper.display({
                id: 'actions',
                header: '操作',
                cell: ({ row }) => (
                    <div className="py-2 text-center">
                        <button
                            onClick={() => onEditTask(row.original)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            編集
                        </button>
                    </div>
                ),
            }),
        ],
        [onEditTask]
    );

    // テーブルインスタンスを作成
    const table = useReactTable({
        data: tasksWithRemainingTime,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* テーブル */}
            <div className="h-60 overflow-y-auto">
                <table className="w-full">
                    {/* テーブルヘッダー */}
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    {/* テーブルボディ */}
                    <tbody className="bg-white divide-y divide-slate-200">
                        {table.getRowModel().rows.length === 0 ? (
                            // タスクがない場合の表示
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-12 text-center text-slate-500"
                                >
                                    <div className="text-4xl mb-2">📝</div>
                                    <p className="text-lg font-medium">タスクがありません</p>
                                    <p className="text-sm">新しいタスクを追加してみましょう！</p>
                                </td>
                            </tr>
                        ) : (
                            // タスクがある場合の表示
                            table.getRowModel().rows.map(row => (
                                <tr 
                                    key={row.id} 
                                    className={`
                                        ${getRowBackgroundColor(row.original)}
                                    `}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-3 text-sm text-slate-900">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}