import { useSyncExternalStore } from "react";
import type { Booking } from "@/lib/types";

const KEY = "meridian.bookings.v1";

const snapshots = new Map<string, { raw: string; booking: Booking | null }>();

function readAll(): Record<string, Booking> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, Booking>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLocalBooking(booking: Booking): void {
  const all = readAll();
  all[booking.reference] = booking;
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function readLocalBooking(reference: string, email?: string): Booking | null {
  const booking = readAll()[reference.trim().toUpperCase()];
  if (!booking) return null;
  if (email && booking.email !== email.trim().toLowerCase()) return null;
  return booking;
}

function snapshotFor(reference: string): Booking | null {
  const code = reference.trim().toUpperCase();
  const raw = window.localStorage.getItem(KEY) ?? "";
  const cached = snapshots.get(code);
  if (cached && cached.raw === raw) return cached.booking;
  let booking: Booking | null = null;
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, Booking>;
    booking = parsed[code] ?? null;
  } catch {
    booking = null;
  }
  snapshots.set(code, { raw, booking });
  return booking;
}

export function useLocalBooking(reference: string): Booking | null | undefined {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => snapshotFor(reference),
    () => undefined,
  );
}
