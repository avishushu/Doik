"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookingSheet } from "@/lib/booking-sheet-context";

export default function BookingPage() {
  const router = useRouter();
  const { open } = useBookingSheet();

  useEffect(() => {
    open();
    router.replace("/");
  }, []);

  return null;
}
