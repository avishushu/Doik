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
import { IconUser, IconPhone, IconMail, IconLock, IconSparkle, IconHeart } from "@/components/icons";

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
  const [prefilled, setPrefilled] = useState(false);

  const isLoggedIn = user && !user.isAnonymous;

  useEffect(() => {
    if (!loading && userData?.role === "admin") {
      router.replace("/admin");
    }
  }, [loading, userData, router]);

  useEffect(() => {
    const raw = sessionStorage.getItem("doik_prefill");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.name) setName(data.name);
        if (data.phone) setPhone(data.phone);
        setPrefilled(true);
      } catch {}
      sessionStorage.removeItem("doik_prefill");
    }
  }, []);

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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-rose/20 flex items-center justify-center text-brand-rose">
            <IconUser className="w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-bold">{userData?.name || user.email}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
            {userData?.phone && <p className="text-sm text-gray-400 mt-0.5" dir="ltr">{userData.phone}</p>}
          </div>
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
      <div className="w-14 h-14 rounded-full bg-brand-rose/20 flex items-center justify-center mb-4 text-brand-rose">
        {mode === "register" ? <IconSparkle className="w-7 h-7" /> : <IconHeart className="w-7 h-7" />}
      </div>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">
        {mode === "register" ? "בואי נכיר" : "ברוכה השבה"}
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        {prefilled
          ? "מילאנו לך כבר את הפרטים מהתור שקבעת - רק תשלימי אימייל וסיסמה."
          : "לא חובה כדי לקבוע תור - אבל עוזר לנו לזכור אותך בפעם הבאה."}
      </p>

      <div className="flex bg-white/5 border border-white/10 rounded-full p-1 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError("");
          }}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-colors ${
            mode === "register" ? "bg-gradient-to-r from-brand-rose to-pink-700 text-white" : "text-gray-400"
          }`}
        >
          הרשמה
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-colors ${
            mode === "login" ? "bg-gradient-to-r from-brand-rose to-pink-700 text-white" : "text-gray-400"
          }`}
        >
          התחברות
        </button>
      </div>

      <form onSubmit={mode === "register" ? handleRegister : handleLogin} className="space-y-4">
        {mode === "register" && (
          <>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                <IconUser className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                placeholder="שם מלא"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-rose"
              />
            </div>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                <IconPhone className="w-5 h-5" />
              </span>
              <input
                type="tel"
                required
                placeholder="טלפון"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white text-right placeholder:text-gray-500 focus:outline-none focus:border-brand-rose"
              />
            </div>
          </>
        )}
        <div className="relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            <IconMail className="w-5 h-5" />
          </span>
          <input
            type="email"
            required
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white text-right placeholder:text-gray-500 focus:outline-none focus:border-brand-rose"
          />
        </div>
        <div className="relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            <IconLock className="w-5 h-5" />
          </span>
          <input
            type="password"
            required
            minLength={6}
            placeholder="סיסמה (לפחות 6 תווים)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white text-right placeholder:text-gray-500 focus:outline-none focus:border-brand-rose"
          />
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-60 active:scale-95 transition-transform"
        >
          {submitting ? "רגע..." : mode === "register" ? "יצירת חשבון" : "התחברות"}
        </button>
      </form>
    </div>
  );
}
