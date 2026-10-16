import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { SearchForm } from "@/components/search-form";
import { addDays, todayIso } from "@/lib/format";
import type { SearchQuery } from "@/lib/types";

const ROUTES = [
  { from: "London", fromCode: "LHR", to: "Jeddah", toCode: "JED", note: "Gateway for Makkah", country: "United Kingdom" },
  { from: "Manchester", fromCode: "MAN", to: "Jeddah", toCode: "JED", note: "Gateway for Makkah", country: "United Kingdom" },
  { from: "Birmingham", fromCode: "BHX", to: "Medina", toCode: "MED", note: "Medina airport", country: "United Kingdom" },
  { from: "New York", fromCode: "JFK", to: "Jeddah", toCode: "JED", note: "Gateway for Makkah", country: "United States" },
  { from: "Chicago", fromCode: "ORD", to: "Jeddah", toCode: "JED", note: "Gateway for Makkah", country: "United States" },
  { from: "Toronto", fromCode: "YYZ", to: "Medina", toCode: "MED", note: "Medina airport", country: "Canada" },
];

const DESKS = [
  { name: "Harbour Lane", city: "London", country: "United Kingdom" },
  { name: "Cedar Route", city: "Manchester", country: "United Kingdom" },
  { name: "Severn Desk", city: "Birmingham", country: "United Kingdom" },
  { name: "Hudson Gate", city: "New York", country: "United States" },
  { name: "Lakeshore Travel", city: "Chicago", country: "United States" },
  { name: "Maple Court", city: "Toronto", country: "Canada" },
  { name: "St Lawrence Desk", city: "Montreal", country: "Canada" },
];

export default function HomePage() {
  return (
    <>
      <section className="relative">
        <div className="relative min-h-[52vh] md:min-h-[78vh]">
          <HeroSlideshow />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-ink/10" />
          <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-28 md:pb-48">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-sand">Umrah flights</p>
            <h1 className="mt-2 max-w-xl font-serif text-5xl leading-none tracking-tight text-white sm:text-6xl">
              Compare the fare into Jeddah or Medina.
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/85">
              For travel agents in the UK, the US and Canada. One way or return, with the stops, bags and total in the
              open. Hotels and visas come later.
            </p>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 md:-mt-36">
          <Suspense fallback={<div className="h-64 rounded-3xl bg-card shadow-lg" />}>
            <LiveSearch />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl tracking-tight">Routes agents ask for</h2>
          <p className="hidden text-sm text-muted sm:block">Sample fares, ready to search.</p>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((route) => (
            <li key={`${route.fromCode}-${route.toCode}`}>
              <Link
                href={`/search?origin=${route.fromCode}&destination=${route.toCode}&tripType=return&adults=1&children=0&infants=0&cabin=economy`}
                className="block rounded-2xl border border-line bg-card p-4 transition hover:border-sea"
              >
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-sea">{route.country}</p>
                <p className="mt-2 font-serif text-2xl">
                  {route.from} to {route.to}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {route.fromCode} · {route.toCode} · {route.note}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-serif text-3xl tracking-tight">Desks in three countries</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Placeholder names for the demonstration. Appointed agencies in the UK, the US and Canada can be listed here.
          None of these desks is real, and none can issue a ticket.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DESKS.map((desk) => (
            <li key={desk.name} className="rounded-2xl border border-line px-4 py-3">
              <p className="font-medium">{desk.name}</p>
              <p className="text-sm text-muted">
                {desk.city}, {desk.country}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 md:grid-cols-3">
        {[
          ["Search", "Departure from the UK, US or Canada. Jeddah for Makkah, or Medina. Dates, travellers and cabin."],
          ["Compare", "Time, stops, bags and the total. Sample prices use pounds, dollars or Canadian dollars by departure."],
          ["Recheck", "The price is confirmed again before a demonstration booking is saved for the client."],
        ].map(([title, copy]) => (
          <article key={title}>
            <h3 className="font-serif text-2xl">{title}</h3>
            <p className="mt-2 text-muted">{copy}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-20 md:grid-cols-2">
        <div className="relative aspect-[3/2] overflow-hidden rounded-3xl">
          <Image
            src="/photos/hero-wing.jpg"
            alt="A desert coast and blue water, seen from an airplane window at sunrise."
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div>
          <h2 className="font-serif text-4xl tracking-tight">The fare you see is the fare we recheck.</h2>
          <p className="mt-4 text-muted leading-7">
            Meridian is the comparison screen an agent can put in front of a client. A supplier such as Duffel can sit
            behind it once the account exists. Until a payment provider is approved, every price is a labelled sample
            and every booking stops before an airline order.
          </p>
        </div>
      </section>
    </>
  );
}

async function LiveSearch() {
  await connection();
  const today = todayIso();
  const initial: SearchQuery = {
    origin: "LHR",
    destination: "JED",
    tripType: "return",
    departDate: addDays(today, 21),
    returnDate: addDays(today, 28),
    adults: 1,
    children: 0,
    infants: 0,
    cabin: "economy",
  };
  return <SearchForm today={today} initial={initial} />;
}
