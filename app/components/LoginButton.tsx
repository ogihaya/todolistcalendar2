'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export default function LoginButton() {
    // 現在のユーザーの状態
    const [user, setUser] = useState<User | null>(null);
    // ローディング状態
    const [loading, setLoading] = useState(true);

    // ユーザーの認証状態を監視
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Googleでログイン
    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('ログインエラー:', error);
            alert('ログインに失敗しました。もう一度お試しください。');
        }
    };

    // ログアウト
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('ログアウトエラー:', error);
            alert('ログアウトに失敗しました。もう一度お試しください。');
        }
    };

    return (
        <div>
            {user ? (
                // ログイン済みの場合
                <div>
                    <button
                        onClick={handleLogout}
                    >
                        ログアウト
                    </button>
                </div>
            ) : (
                // 未ログインの場合
                <button
                    onClick={handleGoogleLogin}
                >
                    {loading ? "ローディング中..." : "Googleでログイン"}
                </button>
            )}
        </div>
    );
}