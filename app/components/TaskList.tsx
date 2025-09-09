import { useState, useMemo } from "react";
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
    onEditTask
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
                        {column.getIsSorted() === 'asc' && <FaSortUp/>}
                        {column.getIsSorted() === 'desc' && <FaSortDown/>}
                        {!column.getIsSorted() && <FaSort/>}
                    </button>
                ),
                cell: ({ row }) => (
                    <div>
                        <div className="m-2">
                        <div>{row.original.name}</div>
                        {row.original.memo && (
                            <div className="text-xs text-gray-500">
                                {row.original.memo}
                            </div>
                        )}
                        </div>
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
                        {column.getIsSorted() === 'asc' && <FaSortUp/>}
                        {column.getIsSorted() === 'desc' && <FaSortDown/>}
                        {!column.getIsSorted() && <FaSort/>}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <div className="m-2 text-center">
                        {formatDate(getValue())}
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
                        {column.getIsSorted() === 'asc' && <FaSortUp/>}
                        {column.getIsSorted() === 'desc' && <FaSortDown/>}
                        {!column.getIsSorted() && <FaSort/>}
                    </button>
                ),
                cell: ({ getValue }) => (
                    <div className="m-2 text-center">
                        {formatTime(getValue())}
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
                        {column.getIsSorted() === 'asc' && <FaSortUp/>}
                        {column.getIsSorted() === 'desc' && <FaSortDown/>}
                        {!column.getIsSorted() && <FaSort/>}
                    </button>
                ),
                cell: ({ row }) => {
                    const remainingTime = row.original.remainingTime;
                    return (
                        <div className="m-2 text-center">
                            {formatTime(remainingTime)}
                        </div>
                    );
                },
            }),

            // 編集ボタン列
            columnHelper.display({
                id: 'actions',
                header: '操作',
                cell: ({ row }) => (
                    <div className="m-2 text-center">
                        <button
                            onClick={() => onEditTask(row.original)}
                            className="border border-gray-600 px-1 hover:bg-gray-300"
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
        <div>
            {/* テーブル */}
            <div className="h-60 overflow-y-auto border border-gray-800 px-2">
                <table className="border border-gray-800 w-full">
                    {/* テーブルヘッダー */}
                    <thead className="bg-gray-200 sticky top-0">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-2 border border-gray-800"
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
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            // タスクがない場合の表示
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-2 border border-gray-800"
                                >
                                    タスクがありません
                                </td>
                            </tr>
                        ) : (
                            // タスクがある場合の表示
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="border border-gray-400">
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