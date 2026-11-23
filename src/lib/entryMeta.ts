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

// Map-ink colours: readable on map paper and as route lines.
export const JOURNAL_COLORS = ["#b4532a", "#2f7fa3", "#3f7d5a", "#c08a1e", "#7a4a8c", "#b84a6a", "#7f8f3a", "#4f6470"];

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
