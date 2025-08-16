// 繰り返しの種類を定義
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// イベントの種類を定義
export type EventType = 'schedule' | 'task';

// 予定（スケジュール）の型定義
export interface Schedule {
  id: string;
  type: 'schedule';
  name: string;
  startTime: Date;
  endTime: Date;
  repeat: RepeatType;
  repeatStartDate: Date;
  repeatEndDate: Date;
  location?: string;
  memo?: string;
}

// タスクの型定義
export interface Task {
  id: string;
  type: 'task';
  name: string;
  deadline: Date;
  estimatedTime: number; // 所要時間（時間単位）
  memo?: string;
}

// イベントのユニオン型
export type Event = Schedule | Task; 