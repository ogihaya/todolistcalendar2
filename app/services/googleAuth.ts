import { auth, googleProvider } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  reauthenticateWithPopup,
  signInWithPopup,
} from "firebase/auth";

export const getGoogleCalendarAccessToken = async (): Promise<string> => {
  const user = auth.currentUser;
  const result = user
    ? await reauthenticateWithPopup(user, googleProvider)
    : await signInWithPopup(auth, googleProvider);

  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error("Google Calendar APIのアクセストークンを取得できませんでした");
  }

  return credential.accessToken;
};
