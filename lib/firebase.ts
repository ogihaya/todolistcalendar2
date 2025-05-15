// 必要な関数をSDKからインポートします
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Firebase Authentication を使う場合
import { getFirestore } from "firebase/firestore"; // Firestore Database を使う場合
import { getStorage } from "firebase/storage"; // Firebase Storage を使う場合
// import { getAnalytics, isSupported } from "firebase/analytics"; // Firebase Analytics を使う場合 (後述)

// TODO: 使用したいFirebase製品のSDKを追加してください
// https://firebase.google.com/docs/web/setup#available-libraries

// あなたのウェブアプリのFirebase設定
// ※セキュリティのため、これらのキーは直接コードに書き込まず、
//   環境変数経由で読み込むことを強く推奨します。
//   Next.jsでの環境変数の扱い方: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Analyticsを使う場合に必要
};

// Firebaseアプリを初期化します。
// Next.jsではサーバーサイドでもコードが実行されることがあるため、
// 既に初期化済みでないかを確認してから初期化処理を行います。
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 各Firebaseサービスへの参照を取得し、エクスポートします。
// これにより、アプリ内の他の場所からこれらのサービスを利用できるようになります。
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// let analytics; // Analytics はクライアントサイドでのみ初期化
// if (typeof window !== 'undefined') {
//   isSupported().then((supported) => {
//     if (supported) {
//       analytics = getAnalytics(app);
//     }
//   });
// }

export { app, auth, db, storage /*, analytics */ };