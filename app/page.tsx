import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { SearchForm } from "@/components/search-form";
import { addDays, todayIso } from "@/lib/format";
import type { SearchQuery } from "@/lib/types";

const PLACES = [
  { city: "Lisbon", code: "LIS", image: "/photos/lisbon.jpg", alt: "A steep cobbled street of pastel houses above the sea." },
  { city: "Rome", code: "FCO", image: "/photos/rome.jpg", alt: "A warm ochre lane with a stone pine and parked scooters." },
  { city: "New York", code: "JFK", image: "/photos/new-york.jpg", alt: "A wooden pier facing a city skyline at blue hour." },
  { city: "Reykjavík", code: "KEF", image: "/photos/iceland.jpg", alt: "Black sand and basalt sea stacks under a pale sky." },
  { city: "Cape Town", code: "CPT", image: "/photos/cape-town.jpg", alt: "A curved beach in front of a flat-topped mountain." },
  { city: "Tokyo", code: "HND", image: "/photos/tokyo.jpg", alt: "A wet lane of wooden buildings and glowing lanterns at dusk." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative">
        <div className="relative min-h-[52vh] md:min-h-[78vh]">
          <Image
            src="/photos/hero-harbour.jpg"
            alt="Fishing boats in a sunlit harbour below hillside houses."
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-ink/10" />
          <div className="relative mx-auto flex min-h-[52vh] max-w-6xl flex-col justify-end px-4 pb-8 md:min-h-[78vh] md:pb-28">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-sand">International flights</p>
            <h1 className="mt-2 max-w-xl font-serif text-5xl leading-none tracking-tight text-white sm:text-6xl">
              Compare the fare before you pack.
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/85">
              One way or return, with the stops, bags and total in the open. Hotels can wait for a later phase.
            </p>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-6 max-w-6xl px-4 md:-mt-16">
          <Suspense fallback={<div className="h-64 rounded-3xl bg-card shadow-lg" />}>
            <LiveSearch />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl tracking-tight">From London this month</h2>
          <p className="hidden text-sm text-muted sm:block">Sample routes to try the search.</p>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLACES.map((place) => (
            <li key={place.code}>
              <Link
                href={`/search?origin=LHR&destination=${place.code}&tripType=return&adults=1&children=0&infants=0&cabin=economy`}
                className="group block"
              >
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
                  <Image
                    src={place.image}
                    alt={place.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <p className="mt-3 font-serif text-2xl">{place.city}</p>
                <p className="text-sm text-muted">London to {place.code}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 md:grid-cols-3">
        {[
          ["Search", "Airports, dates, travellers and cabin. One way or return."],
          ["Compare", "Time, stops, bags and the total fare, sorted the way you want."],
          ["Recheck", "The price is confirmed again before a demonstration booking is saved."],
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
            src="/photos/window-sunrise.jpg"
            alt="Sunrise above the clouds, seen through an airplane window."
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div>
          <h2 className="font-serif text-4xl tracking-tight">The fare you see is the fare we recheck.</h2>
          <p className="mt-4 text-muted leading-7">
            Meridian is built so a supplier such as Duffel can sit behind the same screens. Until that account and a
            payment provider are approved, every price is a clearly labelled sample and every booking stops before an
            airline order.
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
    destination: "",
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
