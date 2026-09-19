"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ServiceInfo = { title: string; price: string; duration: string };

type BookingSheetContextType = {
  isOpen: boolean;
  service: ServiceInfo | null;
  open: (service?: ServiceInfo) => void;
  close: () => void;
};

const BookingSheetContext = createContext<BookingSheetContextType | null>(null);

export function BookingSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [service, setService] = useState<ServiceInfo | null>(null);

  const open = (s?: ServiceInfo) => {
    setService(s ?? null);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <BookingSheetContext.Provider value={{ isOpen, service, open, close }}>
      {children}
    </BookingSheetContext.Provider>
  );
}

export function useBookingSheet() {
  const ctx = useContext(BookingSheetContext);
  if (!ctx) throw new Error("useBookingSheet must be used within BookingSheetProvider");
  return ctx;
}
