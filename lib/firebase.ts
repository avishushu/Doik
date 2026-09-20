import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADVI0SVjJLWedUmfbqBYtlgw1BslfXtMY",
  authDomain: "attendancemda.firebaseapp.com",
  projectId: "attendancemda",
  storageBucket: "attendancemda.firebasestorage.app",
  messagingSenderId: "303165146059",
  appId: "1:303165146059:web:cf698f5837c0ee96702c4e",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
