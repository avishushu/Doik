"use client";

// נתפס כשהתקלה היא בשכבה העליונה של האתר (כולל ה-layout), ולכן בלי Tailwind - עיצוב ישיר
export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error(error);
  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 24,
          background: "#050505",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 320, width: "100%" }}>
          <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>משהו השתבש</h1>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 24px" }}>
            נסי לטעון שוב. אם זה חוזר, אפשר לפנות אלינו בוואטסאפ.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              width: "100%",
              padding: "14px 0",
              marginBottom: 12,
              border: 0,
              borderRadius: 999,
              background: "#be185d",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            נסי שוב
          </button>
          <a
            href="https://wa.me/972538245057"
            style={{
              display: "block",
              padding: "14px 0",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            פנייה בוואטסאפ
          </a>
        </div>
      </body>
    </html>
  );
}
