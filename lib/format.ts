import type { Cabin } from "@/lib/types";

const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND"]);

export function toMinor(amount: string | number, currency: string): number {
  const value = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(value)) return 0;
  if (ZERO_DECIMAL.has(currency)) return Math.round(value);
  return Math.round(value * 100);
}

export function formatMoney(minor: number, currency = "GBP"): string {
  const digits = ZERO_DECIMAL.has(currency) ? 0 : minor % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(ZERO_DECIMAL.has(currency) ? minor : minor / 100);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function timeLabel(iso: string): string {
  return iso.slice(11, 16);
}

export function dateLabel(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function dayOffset(startIso: string, endIso: string): number {
  const start = Date.parse(`${startIso.slice(0, 10)}T00:00:00Z`);
  const end = Date.parse(`${endIso.slice(0, 10)}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

export function formatWhen(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  const [hour, minute] = iso.slice(11, 16).split(":").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, hour, minute)));
}

export function cabinLabel(cabin: Cabin): string {
  switch (cabin) {
    case "premium_economy":
      return "Premium economy";
    case "business":
      return "Business";
    case "first":
      return "First";
    default:
      return "Economy";
  }
}

export function travellerCount(travellers: {
  adults: number;
  children: number;
  infants: number;
}): number {
  return travellers.adults + travellers.children + travellers.infants;
}

export function travellerLabel(travellers: {
  adults: number;
  children: number;
  infants: number;
}): string {
  const parts: string[] = [];
  if (travellers.adults) {
    parts.push(`${travellers.adults} adult${travellers.adults === 1 ? "" : "s"}`);
  }
  if (travellers.children) {
    parts.push(
      `${travellers.children} child${travellers.children === 1 ? "" : "ren"}`,
    );
  }
  if (travellers.infants) {
    parts.push(`${travellers.infants} infant${travellers.infants === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}

export function stopsLabel(stops: number): string {
  if (stops <= 0) return "Nonstop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function todayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ageOn(dob: string, on: string): number {
  const [year, month, day] = dob.split("-").map(Number);
  const [onYear, onMonth, onDay] = on.split("-").map(Number);
  let age = onYear - year;
  if (onMonth < month || (onMonth === month && onDay < day)) age -= 1;
  return age;
}
