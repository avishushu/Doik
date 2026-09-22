"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthContext } from "@/lib/auth-context";

export default function AccountPage() {
  const { user, userData, loading } = useAuthContext();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = user && !user.isAnonymous;

  useEffect(() => {
    if (!loading && userData?.role === "admin") {
      router.replace("/admin");
    }
  }, [loading, userData, router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "doik/app/users", cred.user.uid), {
        role: "customer",
        name: name.trim(),
        phone: phone.trim(),
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError(translateError(err?.code));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(translateError(err?.code));
    } finally {
      setSubmitting(false);
    }
  }

  function translateError(code?: string) {
    switch (code) {
      case "auth/email-already-in-use":
        return "כתובת האימייל הזו כבר רשומה - נסי להתחבר";
      case "auth/invalid-email":
        return "כתובת אימייל לא תקינה";
      case "auth/weak-password":
        return "הסיסמה חייבת להכיל לפחות 6 תווים";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "אימייל או סיסמה שגויים";
      default:
        return "משהו השתבש, נסי שוב";
    }
  }

  if (isLoggedIn) {
    return (
      <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
        <h1 className="font-serif text-3xl font-bold text-white mb-6">החשבון שלי</h1>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-white font-bold mb-1">{userData?.name || user.email}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
          {userData?.phone && <p className="text-sm text-gray-400 mt-1" dir="ltr">{userData.phone}</p>}
        </div>
        <button
          onClick={() => signOut(auth)}
          className="w-full border border-white/15 text-white rounded-full py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
        >
          התנתקות
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">
        {mode === "register" ? "יצירת חשבון" : "התחברות"}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        לא חובה כדי לקבוע תור - אבל עוזר לנו לזכור אותך בפעם הבאה.
      </p>

      <form onSubmit={mode === "register" ? handleRegister : handleLogin} className="space-y-4">
        {mode === "register" && (
          <>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">שם מלא</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-rose"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">טלפון</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-rose"
              />
            </div>
          </>
        )}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">אימייל</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-rose"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">סיסמה</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-rose"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-60"
        >
          {submitting ? "רגע..." : mode === "register" ? "יצירת חשבון" : "התחברות"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "register" ? "login" : "register");
          setError("");
        }}
        className="mt-6 text-sm text-gray-400 underline"
      >
        {mode === "register" ? "כבר יש לך חשבון? התחברי" : "עדיין אין לך חשבון? הרשמי"}
      </button>
    </div>
  );
}
