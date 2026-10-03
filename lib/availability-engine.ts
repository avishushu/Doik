export const CELL_MINUTES = 15;

export type TimeWindow = { start: string; end: string };

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// אורך הבלוק שהטיפול בפועל תופס ביומן, מעוגל למעלה ל-15 דק' הקרובות
export function totalBlockMinutes(duration: number, buffer: number): number {
  const raw = duration + buffer;
  return Math.ceil(raw / CELL_MINUTES) * CELL_MINUTES;
}

// כל תאי ה-15 דק' שבלוק בגודל נתון תופס, החל משעת התחלה נתונה
export function cellsForStart(start: string, totalMinutes: number): string[] {
  const startMin = toMinutes(start);
  const cells: string[] = [];
  for (let m = startMin; m < startMin + totalMinutes; m += CELL_MINUTES) {
    cells.push(toHHMM(m));
  }
  return cells;
}

// כל שעות ההתחלה האפשריות בפועל, בהינתן חלונות הזמן הפתוחים של היום,
// אורך הבלוק הנדרש, והתאים שכבר תפוסים
export function computeAvailableStarts(
  windows: TimeWindow[],
  totalMinutes: number,
  takenCells: Set<string>,
  // אופציונלי: שעות התחלה לפני הדקה הזו (מחצות) נפסלות - לשימוש ביום הנוכחי כדי לא להציע שעות שכבר עברו
  minStartMinutes: number = 0
): string[] {
  const results: string[] = [];
  for (const w of windows) {
    const startMin = toMinutes(w.start);
    const endMin = toMinutes(w.end);
    for (let m = startMin; m + totalMinutes <= endMin; m += CELL_MINUTES) {
      if (m < minStartMinutes) continue;
      const start = toHHMM(m);
      const cells = cellsForStart(start, totalMinutes);
      const conflict = cells.some((c) => takenCells.has(c));
      if (!conflict) results.push(start);
    }
  }
  return results;
}

export function groupSlotsByPeriod(times: string[]) {
  const morning = times.filter((t) => parseInt(t.slice(0, 2), 10) < 12);
  const afternoon = times.filter((t) => {
    const h = parseInt(t.slice(0, 2), 10);
    return h >= 12 && h < 17;
  });
  const evening = times.filter((t) => parseInt(t.slice(0, 2), 10) >= 17);
  return { morning, afternoon, evening };
}

// כמה תורים באורך הבלוק אפשר לשבץ בפועל ברצף (בלי חפיפה) מתוך שעות ההתחלה הפנויות -
// מספר שעות ההתחלה לבדו מטעה כי הן חופפות וזזות ב-15 דק'
export function countNonOverlapping(starts: string[], totalMinutes: number): number {
  const sorted = starts.map(toMinutes).sort((a, b) => a - b);
  let count = 0;
  let nextFree = -1;
  for (const m of sorted) {
    if (m >= nextFree) {
      count++;
      nextFree = m + totalMinutes;
    }
  }
  return count;
}
