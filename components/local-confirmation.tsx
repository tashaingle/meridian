"use client";

import { BookingView } from "@/components/booking-view";
import { useLocalBooking } from "@/lib/local-bookings";

export function LocalConfirmation({ reference }: { reference: string }) {
  const booking = useLocalBooking(reference);

  if (booking === undefined) return <p className="text-muted">Checking this browser…</p>;
  if (!booking) {
    return (
      <div>
        <h1 className="font-serif text-4xl">Booking not on this device</h1>
        <p className="mt-3 max-w-xl text-muted">
          {reference} is not in this browser or on the server. If you booked on another device, connect the database so
          lookups work everywhere.
        </p>
      </div>
    );
  }
  return <BookingView booking={booking} />;
}
