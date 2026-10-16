"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AirlineMark, SliceView } from "@/components/itinerary";
import { formatMoney, stopsLabel } from "@/lib/format";
import type { Itinerary } from "@/lib/types";

type SortKey = "price" | "duration" | "departure" | "stops";

export function OfferExplorer({ itineraries }: { itineraries: Itinerary[] }) {
  const [sort, setSort] = useState<SortKey>("price");
  const [stops, setStops] = useState<"any" | "0" | "1">("any");
  const [airlines, setAirlines] = useState<string[]>([]);
  const [part, setPart] = useState<"any" | "morning" | "afternoon" | "evening">("any");

  const airlineOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const itinerary of itineraries) {
      for (const airline of itinerary.airlines) map.set(airline.code, airline.name);
    }
    return [...map.entries()].map(([code, name]) => ({ code, name }));
  }, [itineraries]);

  const visible = useMemo(() => {
    const filtered = itineraries.filter((itinerary) => {
      if (stops !== "any" && itinerary.stops !== Number(stops)) return false;
      if (airlines.length && !itinerary.airlines.some((airline) => airlines.includes(airline.code))) return false;
      if (part !== "any") {
        const hour = Number(itinerary.slices[0]?.departAt.slice(11, 13));
        if (part === "morning" && (hour < 5 || hour >= 12)) return false;
        if (part === "afternoon" && (hour < 12 || hour >= 17)) return false;
        if (part === "evening" && hour < 17) return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "duration") return a.durationMinutes - b.durationMinutes;
      if (sort === "departure") return a.slices[0].departAt.localeCompare(b.slices[0].departAt);
      if (sort === "stops") return a.stops - b.stops || a.fares[0].totalMinor - b.fares[0].totalMinor;
      return a.fares[0].totalMinor - b.fares[0].totalMinor;
    });
  }, [airlines, itineraries, part, sort, stops]);

  function toggleAirline(code: string) {
    setAirlines((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border border-line bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Filters</h2>
          <button
            type="button"
            className="text-sm text-sea"
            onClick={() => {
              setStops("any");
              setAirlines([]);
              setPart("any");
            }}
          >
            Reset
          </button>
        </div>
        <fieldset className="mt-4">
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Stops</legend>
          {[
            ["any", "Any"],
            ["0", "Nonstop"],
            ["1", "1 stop"],
          ].map(([value, label]) => (
            <label key={value} className="mt-2 flex items-center gap-2 text-sm">
              <input type="radio" name="stops" checked={stops === value} onChange={() => setStops(value as typeof stops)} />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset className="mt-4">
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Depart</legend>
          {[
            ["any", "Any time"],
            ["morning", "Morning"],
            ["afternoon", "Afternoon"],
            ["evening", "Evening"],
          ].map(([value, label]) => (
            <label key={value} className="mt-2 flex items-center gap-2 text-sm">
              <input type="radio" name="part" checked={part === value} onChange={() => setPart(value as typeof part)} />
              {label}
            </label>
          ))}
        </fieldset>
        {airlineOptions.length > 0 && (
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Airline</legend>
            {airlineOptions.map((airline) => (
              <label key={airline.code} className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={airlines.includes(airline.code)}
                  onChange={() => toggleAirline(airline.code)}
                />
                {airline.name}
              </label>
            ))}
          </fieldset>
        )}
      </aside>
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {visible.length} fare{visible.length === 1 ? "" : "s"}
          </p>
          <label className="text-sm text-muted">
            Sort
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="ml-2 h-10 rounded-full border border-line bg-white px-3 text-ink"
            >
              <option value="price">Lowest price</option>
              <option value="duration">Shortest</option>
              <option value="departure">Departure time</option>
              <option value="stops">Fewest stops</option>
            </select>
          </label>
        </div>
        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-card p-8 text-center text-muted">
            Nothing matches those filters.
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((itinerary) => {
              const fare = itinerary.fares[0];
              const airline = itinerary.airlines[0];
              return (
                <li key={itinerary.id}>
                  <Link
                    href={`/flights/${encodeURIComponent(itinerary.id)}`}
                    className="block rounded-2xl border border-line bg-card p-4 transition hover:border-sea"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <AirlineMark code={airline?.code ?? "—"} />
                        <span>
                          <span className="block font-medium">{airline?.name}</span>
                          <span className="text-sm text-muted">
                            {stopsLabel(itinerary.stops)} · {fare.cabinBag}
                          </span>
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-serif text-2xl tracking-tight">
                          {formatMoney(fare.totalMinor, fare.currency)}
                        </span>
                        <span className="text-xs text-muted">
                          {itinerary.fares.length > 1 ? "from, total" : "total"}
                        </span>
                      </span>
                    </div>
                    <div className="space-y-3">
                      {itinerary.slices.map((slice) => (
                        <SliceView key={`${slice.origin}${slice.departAt}`} slice={slice} />
                      ))}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
