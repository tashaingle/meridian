import { Suspense } from "react";
import { connection } from "next/server";
import { BookingView } from "@/components/booking-view";
import { LocalConfirmation } from "@/components/local-confirmation";
import { findBooking } from "@/lib/store";

export const metadata = { title: "Booking" };

type PageProps = { params: Promise<{ reference: string }> };

export default function ConfirmationPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-muted">Opening the booking…</div>}>
      <Confirmed params={params} />
    </Suspense>
  );
}

async function Confirmed({ params }: PageProps) {
  await connection();
  const { reference } = await params;
  const code = decodeURIComponent(reference).toUpperCase();
  const booking = await findBooking(code);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {booking ? <BookingView booking={booking} /> : <LocalConfirmation reference={code} />}
    </div>
  );
}
