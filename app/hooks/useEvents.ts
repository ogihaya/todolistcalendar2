// Reactの必要な機能をインポート
import { useState, useEffect } from 'react';
// Firebase Firestoreから必要な関数をインポート
import { collection, onSnapshot, Timestamp, doc } from 'firebase/firestore';
// Firebase認証から必要な関数と型をインポート
import { onAuthStateChanged, User } from 'firebase/auth';
// プロジェクト内のFirebase設定と型定義をインポート
import { auth, db } from '@/lib/firebase';
import { Schedule, Task, Settings, TempTask } from '@/types/event';

/**
 * Firebaseから全ての予定とタスクを取得するカスタムフック
 * 
 * このフックは以下の機能を提供します：
 * 1. ユーザーの認証状態を監視
 * 2. ログインしているユーザーの予定データを取得
 * 3. ログインしているユーザーのタスクデータを取得
 * 4. ローディング状態とエラー状態の管理
 * 
 * @returns {Object} 予定、タスク、ローディング状態、エラー、ユーザー情報
 */
export function useEvents() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tempTasks, setTempTasks] = useState<TempTask[]>([]);
  const [settings, setSettings] = useState<Settings>({
    availableTimePerDay: 0,
    dateTakeIntoAccount: new Date(),
    availableTimePerUnscheduledDay: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // ユーザー認証の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // データのリアルタイム監視
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 予定の監視
    const unsubscribeSchedules = onSnapshot(
      collection(db, 'users', user.uid, 'schedules'),
      (snapshot) => {
        const schedulesData = snapshot.docs.map(doc => ({
          id: doc.id, // ドキュメントのID
          type: 'schedule' as const, // 予定であることを示すタイプ
          name: doc.data().name, // 予定名
          startTime: doc.data().startTime.toDate(), // 開始時刻（Firebase TimestampをDate型に変換）
          endTime: doc.data().endTime.toDate(), // 終了時刻
          repeat: doc.data().repeat || 'none', // 繰り返し設定（デフォルトは'none'）
          repeatStartDate: doc.data().repeatStartDate?.toDate(), // 繰り返し開始日
          repeatEndDate: doc.data().repeatEndDate?.toDate() || null, // 繰り返し終了日
          location: doc.data().location, // 場所
          memo: doc.data().memo, // メモ
          blackoutDates: doc.data().blackoutDates?.map((date: Timestamp) => date.toDate())
        }));
        setSchedules(schedulesData);
        setLoading(false);
      },
      (_error) => {
        setError('予定データの取得に失敗しました');
        setLoading(false);
      }
    );

    // タスクの監視
    const unsubscribeTasks = onSnapshot(
      collection(db, 'users', user.uid, 'tasks'),
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id, // ドキュメントのID
          type: 'task' as const, // タスクであることを示すタイプ
          name: doc.data().name, // タスク名
          deadline: doc.data().deadline.toDate(), // 期限（Firebase TimestampをDate型に変換）
          estimatedTime: doc.data().estimatedTime || 0, // 推定時間（デフォルトは0）
          memo: doc.data().memo // メモ
        }));
        setTasks(tasksData);
        setLoading(false);
      },
      (_error) => {
        setError('タスクデータの取得に失敗しました');
        setLoading(false);
      }
    );

    // 一時的なタスクの監視
    const unsubscribeTempTasks = onSnapshot(
      collection(db, 'users', user.uid, 'tempTasks'),
      (snapshot) => {
        const tempTasksData = snapshot.docs.map(doc => ({
          id: doc.id, // ドキュメントのID
          name: doc.data().name // タスク名
        }));
        setTempTasks(tempTasksData);
        setLoading(false);
      }
    );

    // 設定の監視
    const unsubscribeSettings = onSnapshot(
      doc(db, 'users', user.uid, 'settings', 'userSettings'),
      (snapshot) => {
        if (snapshot.exists()) {
          const settingsData = snapshot.data();
          setSettings({
            availableTimePerDay: settingsData.availableTimePerDay || 0, // 1日の利用可能時間
            dateTakeIntoAccount: settingsData.dateTakeIntoAccount?.toDate() || new Date(), // 考慮開始日
            availableTimePerUnscheduledDay: settingsData.availableTimePerUnscheduledDay || 0 // 予定なし日の利用可能時間
          });
        } else {
          // 設定ドキュメントが存在しない場合はデフォルト値を維持
          console.log('設定データが見つかりません。デフォルト値を使用します。');
        }
        setLoading(false);
      },
      (_error) => {
        setError('設定データの取得に失敗しました');
        setLoading(false);
      }
    );

    // クリーンアップ
    return () => {
      unsubscribeSchedules();
      unsubscribeTasks();
      unsubscribeSettings();
      unsubscribeTempTasks();
    };
  }, [user]);

  return { schedules, tasks, tempTasks, settings, loading, error, user };
}