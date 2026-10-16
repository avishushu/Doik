"use client";

import { useEffect } from "react";

const WHATSAPP_HREF = "https://wa.me/972538245057";

// מסך שגיאה ידידותי במקום מסך לבן, לכל תקלה בתוך דף
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  function retry() {
    // אחרי פריסה חדשה קבצים ישנים עלולים להיכשל בטעינה - אז רענון מלא פותר את זה
    if (/ChunkLoadError|Loading chunk|Failed to fetch dynamically imported/i.test(`${error?.name} ${error?.message}`)) {
      window.location.reload();
    } else {
      reset();
    }
  }

  return (
    <div
      className="app-shell px-6 flex flex-col items-center justify-center text-center"
      style={{ paddingTop: "calc(96px + var(--sat))", minHeight: "70vh" }}
    >
      <h1 className="font-serif text-2xl font-bold text-white mb-2">משהו השתבש</h1>
      <p className="text-sm text-gray-400 mb-6">נסי לטעון שוב. אם זה חוזר, אפשר לפנות אלינו בוואטסאפ.</p>
      <button
        type="button"
        onClick={retry}
        className="w-full max-w-xs bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-full py-3.5 text-sm font-bold mb-3"
      >
        נסי שוב
      </button>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-xs border border-white/15 text-white rounded-full py-3.5 text-sm font-semibold"
      >
        פנייה בוואטסאפ
      </a>
    </div>
  );
}
