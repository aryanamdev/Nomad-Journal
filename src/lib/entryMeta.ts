import type { Mood, Weather } from "@/types/entry";

export const MOOD_META: Record<Mood, { emoji: string; label: string }> = {
  happy: { emoji: "😊", label: "Happy" },
  excited: { emoji: "🤩", label: "Excited" },
  calm: { emoji: "😌", label: "Calm" },
  grateful: { emoji: "🙏", label: "Grateful" },
  tired: { emoji: "😴", label: "Tired" },
  sad: { emoji: "😔", label: "Sad" },
};

export const WEATHER_META: Record<Weather, { emoji: string; label: string }> = {
  sunny: { emoji: "☀️", label: "Sunny" },
  cloudy: { emoji: "☁️", label: "Cloudy" },
  rainy: { emoji: "🌧️", label: "Rainy" },
  snowy: { emoji: "❄️", label: "Snowy" },
  windy: { emoji: "💨", label: "Windy" },
  stormy: { emoji: "⛈️", label: "Stormy" },
};

export const JOURNAL_COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#a855f7", "#ec4899", "#eab308", "#14b8a6", "#64748b"];

export function formatDate(value: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(value).toLocaleDateString(undefined, opts);
}

/** yyyy-mm-dd in local time, for <input type="date"> */
export function toDateInput(value: string | Date) {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Noon local time on the chosen day, so the date never shifts across time zones. */
export function fromDateInput(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12).toISOString();
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
