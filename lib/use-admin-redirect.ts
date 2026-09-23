"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./auth-context";

// דף הבית הציבורי לא רלוונטי למנהלת - היא מועברת אוטומטית ללוח הבקרה שלה
export function useRedirectAdminHome() {
  const { userData, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userData?.role === "admin") {
      router.replace("/admin");
    }
  }, [loading, userData, router]);

  return userData?.role === "admin";
}
