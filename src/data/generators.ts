import type { TimeSeriesPoint } from "@/types/common";

export function generateId(): string {
  return Math.random().toString(16).slice(2, 10);
}

export function generateTimeSeries(
  days: number,
  min: number,
  max: number,
  trend?: "up" | "down" | "flat"
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = new Date();
  let value = randomBetween(min, max);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const trendFactor =
      trend === "up" ? 0.02 : trend === "down" ? -0.02 : 0;
    value = value * (1 + trendFactor) + randomBetween(-2, 2);
    value = Math.max(min, Math.min(max, value));

    points.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(value * 100) / 100,
    });
  }

  return points;
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function jitter(value: number, percent: number): number {
  const delta = value * (percent / 100);
  return value + randomBetween(-delta, delta);
}

export function relativeTimestamp(minutesAgo: number): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
}
