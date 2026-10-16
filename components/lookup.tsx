"use client";

import { useState } from "react";
import { BookingView } from "@/components/booking-view";
import { lookupBookingAction } from "@/lib/actions";
import { readLocalBooking } from "@/lib/local-bookings";
import type { Booking } from "@/lib/types";

export function LookupForm() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const reference = String(form.get("reference") ?? "");
    const email = String(form.get("email") ?? "");
    setPending(true);
    setMessage("");
    const server = await lookupBookingAction(null, form);
    if (server.booking) {
      setBooking(server.booking);
      setPending(false);
      return;
    }
    const local = readLocalBooking(reference, email);
    setBooking(local);
    setMessage(
      local
        ? "Found in this browser. It is not on the server."
        : server.error ?? "No booking matched those details.",
    );
    setPending(false);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Reference</span>
          <input name="reference" required placeholder="MRD-AB12CD" className="h-11 w-full rounded-xl border border-line px-3 uppercase" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Contact email</span>
          <input name="email" type="email" required className="h-11 w-full rounded-xl border border-line px-3" />
        </label>
        <button type="submit" disabled={pending} className="h-11 rounded-full bg-sea px-5 font-semibold text-white disabled:opacity-60">
          {pending ? "Looking…" : "Find booking"}
        </button>
      </form>
      {message && <p className="text-sm text-muted">{message}</p>}
      {booking && <BookingView booking={booking} />}
    </div>
  );
}
