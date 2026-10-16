import { Suspense } from "react";
import { connection } from "next/server";
import { OfferExplorer } from "@/components/offer-explorer";
import { SearchForm } from "@/components/search-form";
import { getAirport } from "@/lib/airports";
import { addDays, todayIso } from "@/lib/format";
import { parseSearchQuery } from "@/lib/query";
import { searchFlights } from "@/lib/supplier";
import type { SearchQuery } from "@/lib/types";

export const metadata = { title: "Search flights" };

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function SearchPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 text-muted">Searching fares…</div>}>
      <Results searchParams={searchParams} />
    </Suspense>
  );
}

async function Results({ searchParams }: PageProps) {
  await connection();
  const today = todayIso();
  const raw = await searchParams;
  const parsed = parseSearchQuery(raw, today);

  if ("error" in parsed) {
    const fallback: SearchQuery = {
      origin: "LHR",
      destination: "",
      tripType: "return",
      departDate: addDays(today, 21),
      returnDate: addDays(today, 28),
      adults: 1,
      children: 0,
      infants: 0,
      cabin: "economy",
    };
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <SearchForm today={today} initial={fallback} compact />
        <p className="mt-6 text-copper">{parsed.error}</p>
      </div>
    );
  }

  const result = await searchFlights(parsed.query);
  const from = getAirport(parsed.query.origin);
  const to = getAirport(parsed.query.destination);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SearchForm today={today} initial={{ ...parsed.query, returnDate: parsed.query.returnDate ?? parsed.query.departDate, destination: parsed.query.destination }} compact />
      <header className="mt-8 mb-4">
        <h1 className="font-serif text-4xl tracking-tight">
          {from?.city} to {to?.city}
        </h1>
        <p className="mt-2 text-sm text-muted">{result.notice}</p>
      </header>
      <OfferExplorer itineraries={result.itineraries} />
    </div>
  );
}
