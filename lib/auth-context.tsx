"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";

type DoikUserData = { role: "customer" | "admin"; name?: string; phone?: string } | null;

type AuthContextType = {
  user: User | null;
  userData: DoikUserData;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DoikUserData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u || u.isAnonymous) {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user || user.isAnonymous) return;
    const unsubDoc = onSnapshot(doc(db, "doik/app/users", user.uid), (snap) => {
      setUserData(snap.exists() ? (snap.data() as DoikUserData) : null);
      setLoading(false);
    });
    return () => unsubDoc();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
