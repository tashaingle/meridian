import { ItineraryDetail } from "@/components/itinerary";
import { countryName } from "@/lib/countries";
import { formatMoney, formatWhen, travellerLabel } from "@/lib/format";
import type { Booking } from "@/lib/types";

export function BookingView({ booking }: { booking: Booking }) {
  const fare = booking.offer.selectedFare;
  const stored =
    booking.storage === "browser"
      ? "Saved in this browser only."
      : booking.storage === "supabase"
        ? "Saved to the project database."
        : "Saved on this server's local file store.";

  return (
    <article className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          {booking.status === "demo_confirmed" ? "Demonstration confirmed" : "Airline order not created"}
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">{booking.reference}</h1>
        <p className="mt-2 text-muted">
          {formatWhen(booking.createdAt)} · {stored} No ticket has been issued and no card has been charged.
        </p>
      </header>
      <ItineraryDetail itinerary={booking.offer} />
      <section className="grid gap-4 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2">
        <div>
          <h2 className="font-medium">Travellers</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {booking.passengers.map((passenger) => (
              <li key={`${passenger.familyName}${passenger.documentLast4}${passenger.dateOfBirth}`}>
                <span className="text-ink">
                  {passenger.givenName} {passenger.familyName}
                </span>
                <span>
                  {" "}
                  · {passenger.type} · {countryName(passenger.nationality)} · document ···{passenger.documentLast4}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">{travellerLabel(booking.offer.travellers)}</p>
        </div>
        <div>
          <h2 className="font-medium">Payment</h2>
          <p className="mt-2 text-sm text-muted">
            {booking.payment.brand} ending {booking.payment.last4}. Authorisation was simulated.
          </p>
          <p className="mt-3 font-serif text-3xl">{formatMoney(fare.totalMinor, fare.currency)}</p>
          <p className="text-sm text-muted">{fare.brandName}</p>
          <p className="mt-3 text-sm text-muted">
            Contact {booking.email}
            <br />
            {booking.phone}
          </p>
        </div>
      </section>
      <p className="text-sm text-muted">
        Questions about a live booking will go to the support address once the selling business is confirmed. For this
        demonstration, nothing further happens.
      </p>
    </article>
  );
}
