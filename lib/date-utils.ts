// עזרי תאריך לפי שעון ישראל - בלי תלות באזור הזמן של המכשיר ובלי toISOString (שמחזיר UTC)

const TZ = "Asia/Jerusalem";

const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

type IsraelParts = { date: string; minutes: number };

function israelParts(now: Date): IsraelParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10),
  };
}

// התאריך של היום בישראל, בפורמט YYYY-MM-DD
export function todayIL(now: Date = new Date()): string {
  return israelParts(now).date;
}

// כמה דקות עברו מחצות בישראל
export function nowMinutesIL(now: Date = new Date()): number {
  return israelParts(now).minutes;
}

function dateToUTCMs(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

// כמה ימים מהיום `from` עד היום `to` (שניהם YYYY-MM-DD)
export function daysBetween(from: string, to: string): number {
  return Math.round((dateToUTCMs(to) - dateToUTCMs(from)) / 86400000);
}

function weekdayName(date: string): string {
  return WEEKDAYS[new Date(dateToUTCMs(date)).getUTCDay()];
}

// 2026-10-25 -> "25.10"
export function shortDate(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${d}.${m}`;
}

// ניסוח ידידותי ליום: היום / מחר / ביום רביעי הקרוב / ביום חמישי בשבוע הבא, 25.10
export function friendlyDay(date: string, today: string): string {
  const diff = daysBetween(today, date);
  if (diff <= 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff <= 6) return `ביום ${weekdayName(date)} הקרוב`;
  if (diff <= 13) return `ביום ${weekdayName(date)} בשבוע הבא, ${shortDate(date)}`;
  return `ביום ${weekdayName(date)}, ${shortDate(date)}`;
}

// כמה דקות מהרגע הנוכחי (בישראל) עד תחילת תור. שלילי = כבר עבר
export function minutesUntil(date: string, time: string, now: Date = new Date()): number {
  const { date: today, minutes: nowMin } = israelParts(now);
  const [h, m] = time.split(":").map(Number);
  return daysBetween(today, date) * 1440 + (h * 60 + m) - nowMin;
}
