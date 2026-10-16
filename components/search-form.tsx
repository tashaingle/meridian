"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AirportField } from "@/components/airport-field";
import { cabinLabel } from "@/lib/format";
import { queryToParams } from "@/lib/query";
import type { Cabin, SearchQuery, TripType } from "@/lib/types";

const CABINS: Cabin[] = ["economy", "premium_economy", "business", "first"];

export function SearchForm({
  today,
  initial,
  compact = false,
}: {
  today: string;
  initial: SearchQuery;
  compact?: boolean;
}) {
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>(initial.tripType);
  const [origin, setOrigin] = useState(initial.origin);
  const [destination, setDestination] = useState(initial.destination);
  const [departDate, setDepartDate] = useState(initial.departDate);
  const [returnDate, setReturnDate] = useState(initial.returnDate ?? initial.departDate);
  const [adults, setAdults] = useState(initial.adults);
  const [children, setChildren] = useState(initial.children);
  const [infants, setInfants] = useState(initial.infants);
  const [cabin, setCabin] = useState<Cabin>(initial.cabin);
  const [openPax, setOpenPax] = useState(false);
  const [error, setError] = useState("");

  const travellers = adults + children + infants;

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!origin || !destination) {
      setError("Choose both airports from the suggestions.");
      return;
    }
    if (origin === destination) {
      setError("Choose two different airports.");
      return;
    }
    if (departDate < today) {
      setError("Departure needs to be today or later.");
      return;
    }
    if (tripType === "return" && returnDate < departDate) {
      setError("Return needs to be on or after departure.");
      return;
    }
    if (infants > adults) {
      setError("Each infant needs an adult.");
      return;
    }
    setError("");
    const query: SearchQuery = {
      origin,
      destination,
      tripType,
      departDate,
      returnDate: tripType === "return" ? returnDate : undefined,
      adults,
      children,
      infants,
      cabin,
    };
    router.push(`/search?${queryToParams(query)}`);
  }

  return (
    <form onSubmit={submit} className={`rounded-3xl bg-card p-4 shadow-[0_20px_60px_rgba(28,36,48,0.12)] ${compact ? "" : "sm:p-5"}`}>
      <div className="mb-3 flex gap-2">
        {(["return", "oneway"] as TripType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTripType(type)}
            className={`rounded-full px-3 py-1.5 text-sm ${tripType === type ? "bg-sea text-white" : "bg-sand text-ink"}`}
          >
            {type === "return" ? "Return" : "One way"}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <AirportField label="From" value={origin} placeholder="City or airport" onChange={setOrigin} />
          <button
            type="button"
            onClick={swap}
            aria-label="Swap airports"
            className="mx-auto mb-1.5 grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-sea"
          >
            <span aria-hidden="true">⇄</span>
          </button>
          <AirportField label="To" value={destination} placeholder="City or airport" onChange={setDestination} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">Depart</span>
          <input
            type="date"
            required
            min={today}
            value={departDate}
            onChange={(event) => setDepartDate(event.target.value)}
            className="h-12 w-full rounded-xl border border-line bg-white px-3"
          />
        </label>
        {tripType === "return" && (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">Return</span>
            <input
              type="date"
              required
              min={departDate}
              value={returnDate}
              onChange={(event) => setReturnDate(event.target.value)}
              className="h-12 w-full rounded-xl border border-line bg-white px-3"
            />
          </label>
        )}
        <div className="relative">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">Travellers</span>
          <button
            type="button"
            onClick={() => setOpenPax((open) => !open)}
            className="h-12 w-full rounded-xl border border-line bg-white px-3 text-left"
            aria-expanded={openPax}
          >
            {travellers} traveller{travellers === 1 ? "" : "s"}
          </button>
          {openPax && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-line bg-white p-3 shadow-lg">
              <Stepper
                label="Adults"
                hint="12+"
                value={adults}
                min={1}
                max={9}
                onChange={(next) => {
                  setAdults(next);
                  if (infants > next) setInfants(next);
                }}
              />
              <Stepper label="Children" hint="2–11" value={children} min={0} max={8} onChange={setChildren} />
              <Stepper label="Infants" hint="On a lap" value={infants} min={0} max={adults} onChange={setInfants} />
              <button type="button" className="mt-2 text-sm font-medium text-sea" onClick={() => setOpenPax(false)}>
                Done
              </button>
            </div>
          )}
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">Cabin</span>
          <select
            value={cabin}
            onChange={(event) => setCabin(event.target.value as Cabin)}
            className="h-12 w-full rounded-xl border border-line bg-white px-3"
          >
            {CABINS.map((item) => (
              <option key={item} value={item}>
                {cabinLabel(item)}
              </option>
            ))}
          </select>
        </label>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-copper">{error}</p>}
      <button type="submit" className="mt-4 h-12 w-full rounded-full bg-sea text-base font-semibold text-white hover:bg-sea-deep md:w-auto md:px-10">
        Search flights
      </button>
    </form>
  );
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="text-xs text-muted">{hint}</span>
      </span>
      <span className="flex items-center gap-2">
        <button type="button" aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="h-8 w-8 rounded-full border border-line disabled:opacity-40">
          −
        </button>
        <span className="w-4 text-center text-sm">{value}</span>
        <button type="button" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="h-8 w-8 rounded-full border border-line disabled:opacity-40">
          +
        </button>
      </span>
    </div>
  );
}
