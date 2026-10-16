import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ItineraryDetail } from "@/components/itinerary";
import { cabinLabel, formatMoney, travellerLabel } from "@/lib/format";
import { getItinerary } from "@/lib/supplier";

export const metadata = { title: "Fare details" };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function FlightPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-muted">Loading this fare…</div>}>
      <Fare params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Fare({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const rechecked = query.recheck === "1";
  const itinerary = await getItinerary(decodeURIComponent(id));
  if (!itinerary) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        <p className="text-sm text-muted">
          {cabinLabel(itinerary.cabin)} · {travellerLabel(itinerary.travellers)}
        </p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight">
          {itinerary.slices[0]?.origin} to {itinerary.slices[0]?.destination}
        </h1>
        <div className="mt-6">
          <ItineraryDetail itinerary={itinerary} />
        </div>
      </div>
      <aside className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Choose a fare</h2>
          <Link href={`/flights/${encodeURIComponent(itinerary.id)}?recheck=1`} className="text-sm font-medium text-sea">
            Recheck
          </Link>
        </div>
        {rechecked && (
          <p className="rounded-xl bg-sand px-3 py-2 text-sm">
            {itinerary.supplier === "sample"
              ? "Fare rechecked. This sample price is unchanged."
              : "Fare rechecked with Duffel just now. No airline order has been created."}
          </p>
        )}
        {itinerary.fares.map((fare) => (
          <article key={fare.id} className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-medium">{fare.brandName}</h3>
              <p className="font-serif text-2xl">{formatMoney(fare.totalMinor, fare.currency)}</p>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              <li>{fare.cabinBag}</li>
              <li>{fare.checkedBag}</li>
              <li>{fare.changeRule}</li>
              <li>{fare.refundRule}</li>
              <li>
                Fare {formatMoney(fare.baseMinor, fare.currency)} · taxes and charges{" "}
                {formatMoney(fare.taxMinor, fare.currency)}
              </li>
            </ul>
            <Link
              href={`/checkout/${encodeURIComponent(fare.id)}`}
              className="mt-4 inline-flex h-11 items-center rounded-full bg-sea px-5 text-sm font-semibold text-white"
            >
              Continue
            </Link>
          </article>
        ))}
      </aside>
    </div>
  );
}
