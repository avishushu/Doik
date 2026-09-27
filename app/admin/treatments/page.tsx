"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Treatment = {
  id: string;
  title: string;
  duration: number;
  price: number;
  active: boolean;
  image?: string;
  featured?: boolean;
};

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "doik/app/treatments"), orderBy("title"));
    const unsub = onSnapshot(q, (snap) => {
      setTreatments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Treatment)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function openNewForm() {
    setEditingId(null);
    setTitle("");
    setDuration("");
    setPrice("");
    setImage("");
    setFeatured(false);
    setError("");
    setShowForm(true);
  }

  function openEditForm(t: Treatment) {
    setEditingId(t.id);
    setTitle(t.title);
    setDuration(String(t.duration));
    setPrice(String(t.price));
    setImage(t.image || "");
    setFeatured(!!t.featured);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const durationNum = parseInt(duration, 10);
    const priceNum = parseInt(price, 10);

    if (!title.trim() || title.trim().length < 2) {
      setError("שם הטיפול חייב להכיל לפחות 2 תווים");
      return;
    }
    if (!durationNum || durationNum < 5 || durationNum > 480) {
      setError("משך הטיפול חייב להיות בין 5 ל-480 דקות");
      return;
    }
    if (!priceNum || priceNum < 0) {
      setError("נא להזין מחיר תקין");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        title: title.trim(),
        duration: durationNum,
        price: priceNum,
        featured,
      };
      if (image.trim()) data.image = image.trim();

      if (editingId) {
        await updateDoc(doc(db, "doik/app/treatments", editingId), data);
      } else {
        await addDoc(collection(db, "doik/app/treatments"), { ...data, active: true });
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("משהו השתבש, נסי שוב");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(t: Treatment) {
    await updateDoc(doc(db, "doik/app/treatments", t.id), { active: !t.active });
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק את הטיפול הזה לצמיתות?")) return;
    await deleteDoc(doc(db, "doik/app/treatments", id));
  }

  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-3xl font-bold text-white">ניהול טיפולים</h1>
        <button
          onClick={openNewForm}
          className="w-9 h-9 rounded-full bg-gradient-to-r from-brand-rose to-pink-700 text-white flex items-center justify-center text-xl font-bold"
          aria-label="הוסיפי טיפול"
        >
          +
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        טיפולים "בולטים בעמוד הבית" מוצגים בקרוסלה הראשית - כדאי לסמן 2-4 מהמבוקשים ביותר.
      </p>

      {loading && <p className="text-gray-400 text-sm">טוענת...</p>}

      {!loading && treatments.length === 0 && (
        <p className="text-gray-400 text-sm mb-6">אין עדיין טיפולים - תלחצי על + כדי להוסיף.</p>
      )}

      <div className="space-y-3">
        {treatments.map((t) => (
          <div
            key={t.id}
            className={`bg-white/5 border rounded-2xl p-4 ${
              t.active ? "border-white/10" : "border-white/5 opacity-50"
            }`}
          >
            <div className="flex gap-3 mb-2">
              {t.image && (
                <img src={t.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white truncate">{t.title}</h3>
                  <span className="text-brand-rose text-sm font-bold tabular-nums flex-shrink-0">₪{t.price}</span>
                </div>
                <p className="text-sm text-gray-400 tabular-nums">{t.duration} דקות</p>
                {t.featured && <span className="text-[10px] text-brand-rose font-bold">★ בולט בעמוד הבית</span>}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => openEditForm(t)}
                className="flex-1 border border-white/15 text-white rounded-full py-2 text-xs font-semibold hover:bg-white/5 transition-colors"
              >
                עריכה
              </button>
              <button
                onClick={() => toggleActive(t)}
                className="flex-1 border border-white/15 text-gray-300 rounded-full py-2 text-xs font-semibold hover:bg-white/5 transition-colors"
              >
                {t.active ? "השבתה" : "הפעלה"}
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="flex-1 border border-red-500/30 text-red-300 rounded-full py-2 text-xs font-semibold hover:bg-red-950/30 transition-colors"
              >
                מחיקה
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="w-full max-w-md bg-[#121212] border-t border-white/10 rounded-t-[2.5rem] p-6 max-h-[85vh] overflow-y-auto" style={{ paddingBottom: "calc(24px + var(--sab))" }}>
            <div className="w-12 h-1.5 bg-gray-600/60 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-serif font-bold text-white mb-5">
              {editingId ? "עריכת טיפול" : "טיפול חדש"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">שם הטיפול</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-rose"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">משך (דקות)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white tabular-nums focus:outline-none focus:border-brand-rose"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">מחיר (₪)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white tabular-nums focus:outline-none focus:border-brand-rose"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">קישור לתמונה (אופציונלי)</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-right focus:outline-none focus:border-brand-rose"
                />
              </div>
              <label className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 accent-brand-rose"
                />
                <span className="text-sm text-white">להציג בקרוסלה בעמוד הבית</span>
              </label>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-full py-3.5 text-sm font-bold disabled:opacity-60"
                >
                  {saving ? "שומרת..." : editingId ? "שמירת שינויים" : "הוספת טיפול"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-white/15 text-gray-300 rounded-full py-3.5 text-sm font-semibold"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
