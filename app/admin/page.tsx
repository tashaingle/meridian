import { Suspense } from "react";
import { connection } from "next/server";
import { AdminLogin } from "@/components/admin-login";
import { adminSession, logoutAdminAction } from "@/lib/actions";
import { getAirport } from "@/lib/airports";
import { formatMoney, formatWhen } from "@/lib/format";
import { listBookings } from "@/lib/store";

export const metadata = { title: "Staff" };

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-muted">Opening the desk…</div>}>
      <Desk />
    </Suspense>
  );
}

async function Desk() {
  await connection();
  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-serif text-4xl">Staff desk</h1>
        <p className="mt-3 text-muted">
          Set <code>ADMIN_PASSWORD</code> in the environment, then restart the server. There is no default password.
        </p>
      </div>
    );
  }

  const signedIn = await adminSession();
  if (!signedIn) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-serif text-4xl">Staff desk</h1>
        <p className="mt-2 mb-6 text-muted">Bookings saved on this server. Browser-only demonstrations stay on the traveller&apos;s device.</p>
        <AdminLogin />
      </div>
    );
  }

  const bookings = await listBookings();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Bookings</h1>
        <form action={logoutAdminAction}>
          <button className="text-sm font-medium text-sea">Sign out</button>
        </form>
      </div>
      {bookings.length === 0 ? (
        <p className="mt-6 text-muted">No bookings stored on this server yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-sand text-ink">
              <tr>
                <th className="px-3 py-2 font-medium">Reference</th>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Route</th>
                <th className="px-3 py-2 font-medium">Contact</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const slice = booking.offer.slices[0];
                const from = getAirport(slice?.origin)?.city ?? slice?.origin;
                const to = getAirport(slice?.destination)?.city ?? slice?.destination;
                return (
                  <tr key={booking.reference} className="border-t border-line bg-card">
                    <td className="px-3 py-3 font-medium">{booking.reference}</td>
                    <td className="px-3 py-3">{formatWhen(booking.createdAt)}</td>
                    <td className="px-3 py-3">
                      {from} to {to}
                    </td>
                    <td className="px-3 py-3">{booking.email}</td>
                    <td className="px-3 py-3">{booking.status === "demo_confirmed" ? "Demo" : "Not ticketed"}</td>
                    <td className="px-3 py-3">
                      {formatMoney(booking.offer.selectedFare.totalMinor, booking.offer.selectedFare.currency)}
                      <span className="block text-xs text-muted">
                        {booking.payment.brand} ··{booking.payment.last4}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
