import { getAirport } from "@/lib/airports";
import { addDays } from "@/lib/format";
import type { Cabin, SearchQuery, TripType } from "@/lib/types";

const CABINS = new Set<Cabin>(["economy", "premium_economy", "business", "first"]);

export type QueryInput = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function count(value: string, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return Number.NaN;
  return parsed;
}

export function parseSearchQuery(
  input: QueryInput,
  today: string,
): { query: SearchQuery } | { error: string } {
  const origin = one(input.origin).toUpperCase();
  const destination = one(input.destination).toUpperCase();
  const tripRaw = one(input.tripType);
  const tripType: TripType = tripRaw === "oneway" ? "oneway" : "return";
  const departDate = one(input.departDate) || addDays(today, 21);
  const returnDate =
    tripType === "return" ? one(input.returnDate) || addDays(departDate, 7) : undefined;
  const adults = count(one(input.adults), 1);
  const children = count(one(input.children), 0);
  const infants = count(one(input.infants), 0);
  const cabinRaw = one(input.cabin) as Cabin;
  const cabin: Cabin = CABINS.has(cabinRaw) ? cabinRaw : "economy";

  if (!getAirport(origin) || !getAirport(destination)) {
    return { error: "Choose a departure and destination airport from the list." };
  }
  if (origin === destination) {
    return { error: "Choose two different airports." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(departDate) || departDate < today) {
    return { error: "Choose a departure date that is today or later." };
  }
  if (returnDate && (!/^\d{4}-\d{2}-\d{2}$/.test(returnDate) || returnDate < departDate)) {
    return { error: "The return date needs to be on or after the departure date." };
  }
  if ([adults, children, infants].some((value) => !Number.isInteger(value) || value < 0)) {
    return { error: "Check the traveller counts." };
  }
  if (adults < 1) return { error: "At least one adult is required." };
  if (adults + children + infants > 9) {
    return { error: "Meridian can quote up to 9 travellers in one search." };
  }
  if (infants > adults) {
    return { error: "Each infant needs to travel with an adult." };
  }

  return {
    query: {
      origin,
      destination,
      tripType,
      departDate,
      returnDate,
      adults,
      children,
      infants,
      cabin,
    },
  };
}

export function queryToParams(query: SearchQuery): string {
  const params = new URLSearchParams({
    origin: query.origin,
    destination: query.destination,
    tripType: query.tripType,
    departDate: query.departDate,
    adults: String(query.adults),
    children: String(query.children),
    infants: String(query.infants),
    cabin: query.cabin,
  });
  if (query.returnDate) params.set("returnDate", query.returnDate);
  return params.toString();
}
