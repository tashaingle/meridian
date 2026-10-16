import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { CheckoutForm } from "@/components/checkout-form";
import { SliceView } from "@/components/itinerary";
import { formatMoney } from "@/lib/format";
import { getOffer } from "@/lib/supplier";

export const metadata = { title: "Checkout" };

type PageProps = { params: Promise<{ id: string }> };

export default function CheckoutPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-muted">Preparing checkout…</div>}>
      <Checkout params={params} />
    </Suspense>
  );
}

async function Checkout({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const offer = await getOffer(decodeURIComponent(id));
  if (!offer) notFound();
  const idempotencyKey = crypto.randomUUID();
  const fare = offer.selectedFare;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <CheckoutForm offer={offer} idempotencyKey={idempotencyKey} />
      <aside className="h-fit rounded-2xl border border-line bg-card p-4 lg:sticky lg:top-4">
        <h2 className="font-serif text-2xl">Your fare</h2>
        <p className="text-sm text-muted">{fare.brandName}</p>
        <div className="mt-4 space-y-4">
          {offer.slices.map((slice) => (
            <SliceView key={`${slice.origin}${slice.departAt}`} slice={slice} />
          ))}
        </div>
        <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Fare</dt>
            <dd>{formatMoney(fare.baseMinor, fare.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Taxes and charges</dt>
            <dd>{formatMoney(fare.taxMinor, fare.currency)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatMoney(fare.totalMinor, fare.currency)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-muted">
          {offer.supplier === "duffel"
            ? "This price came from Duffel. Confirming here does not create an airline order."
            : "Sample total for the whole party. Nothing is held."}
        </p>
        <Link href={`/flights/${encodeURIComponent(offer.id)}`} className="mt-3 inline-block text-sm text-sea">
          Back to fares
        </Link>
      </aside>
    </div>
  );
}
