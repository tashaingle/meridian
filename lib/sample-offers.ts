import { distanceKm } from "@/lib/airports";
import { parseSearchQuery } from "@/lib/query";
import type {
  Cabin,
  FareBrand,
  FareOption,
  Itinerary,
  Offer,
  SearchQuery,
  Segment,
  Slice,
} from "@/lib/types";

const AIRLINES = [
  { code: "NL", name: "Northline" },
  { code: "VB", name: "Vesper" },
  { code: "CW", name: "Copperbird" },
  { code: "RA", name: "Rowan Air" },
  { code: "HX", name: "Halcyon" },
  { code: "SB", name: "Sable" },
  { code: "OR", name: "Orchard" },
  { code: "KF", name: "Kinfield" },
];

const HUBS = ["AMS", "CDG", "FRA", "IST", "DOH", "DXB", "LHR", "JFK", "SIN", "AUH"];

const SLOTS = [6 * 60 + 35, 9 * 60 + 10, 12 * 60 + 45, 15 * 60 + 20, 18 * 60 + 5, 21 * 60 + 15];

const BRANDS: FareBrand[] = ["light", "standard", "flex"];

type SampleKey = {
  q: SearchQuery;
  v: number;
  b?: FareBrand;
};

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function atMinutes(date: string, minutes: number): string {
  const dayShift = Math.floor(minutes / 1440);
  const within = ((minutes % 1440) + 1440) % 1440;
  const [year, month, day] = date.split("-").map(Number);
  const stamp = new Date(Date.UTC(year, month - 1, day + dayShift, Math.floor(within / 60), within % 60));
  return `${stamp.getUTCFullYear()}-${pad(stamp.getUTCMonth() + 1)}-${pad(stamp.getUTCDate())}T${pad(stamp.getUTCHours())}:${pad(stamp.getUTCMinutes())}:00`;
}

function addMinutes(iso: string, minutes: number): string {
  const [date, time] = iso.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const stamp = new Date(Date.UTC(year, month - 1, day, hour, minute + minutes));
  return `${stamp.getUTCFullYear()}-${pad(stamp.getUTCMonth() + 1)}-${pad(stamp.getUTCDate())}T${pad(stamp.getUTCHours())}:${pad(stamp.getUTCMinutes())}:00`;
}

function flightMinutes(km: number): number {
  return Math.max(55, Math.round((km / 800) * 60) + 50);
}

function aircraftFor(km: number, salt: number): string {
  if (km < 1800) return salt % 2 ? "Airbus A320neo" : "Boeing 737-8";
  if (km < 4500) return salt % 2 ? "Airbus A321neo" : "Boeing 737-8";
  if (km < 9000) return salt % 2 ? "Boeing 787-9" : "Airbus A330-900";
  return "Airbus A350-900";
}

function pickHub(origin: string, destination: string, salt: number): string | null {
  const direct = distanceKm(origin, destination);
  const candidates = HUBS.filter((hub) => hub !== origin && hub !== destination)
    .map((hub) => ({
      hub,
      via: distanceKm(origin, hub) + distanceKm(hub, destination),
    }))
    .filter((candidate) => candidate.via > direct * 1.02 && candidate.via < direct * 1.7)
    .sort((a, b) => a.via - b.via);
  if (!candidates.length) return null;
  return candidates[salt % Math.min(3, candidates.length)].hub;
}

function encodeKey(key: SampleKey): string {
  return `smp_${Buffer.from(JSON.stringify(key)).toString("base64url")}`;
}

function decodeKey(id: string): SampleKey | null {
  if (!id.startsWith("smp_")) return null;
  try {
    const parsed = JSON.parse(Buffer.from(id.slice(4), "base64url").toString("utf8")) as SampleKey;
    if (!parsed?.q || typeof parsed.v !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function buildSlice(
  origin: string,
  destination: string,
  date: string,
  slot: number,
  salt: number,
  airline: { code: string; name: string },
  hub: string | null,
): Slice {
  const departAt = atMinutes(date, SLOTS[slot % SLOTS.length] + (hash(`${origin}${destination}${salt}`) % 18) - 6);
  const segments: Segment[] = [];
  const legs = hub ? [origin, hub, destination] : [origin, destination];

  let cursor = departAt;
  for (let index = 0; index < legs.length - 1; index += 1) {
    const from = legs[index];
    const to = legs[index + 1];
    const km = distanceKm(from, to);
    const duration = flightMinutes(km) + (hash(`${from}${to}${salt}${index}`) % 15);
    const arriveAt = addMinutes(cursor, duration);
    const flightNo = 100 + (hash(`${airline.code}${from}${to}${salt}`) % 800);
    segments.push({
      origin: from,
      destination: to,
      departAt: cursor,
      arriveAt,
      durationMinutes: duration,
      flightNumber: `${airline.code} ${flightNo}`,
      airlineCode: airline.code,
      airlineName: airline.name,
      aircraft: aircraftFor(km, salt + index),
    });
    if (index < legs.length - 2) {
      const layover = 75 + (hash(`${hub}${salt}`) % 55);
      cursor = addMinutes(arriveAt, layover);
    }
  }

  const arriveAt = segments[segments.length - 1].arriveAt;
  const start = Date.parse(departAt + "Z");
  const end = Date.parse(arriveAt + "Z");
  return {
    origin,
    destination,
    departAt,
    arriveAt,
    durationMinutes: Math.round((end - start) / 60000),
    segments,
  };
}

function seasonFactor(date: string): number {
  const month = Number(date.slice(5, 7));
  let factor = 1;
  if (month === 7 || month === 8 || month === 12) factor = 1.16;
  else if (month === 6 || month === 9) factor = 1.08;
  else if (month === 1 || month === 2 || month === 11) factor = 0.92;
  return factor * (0.97 + (hash(date) % 7) / 100);
}

function cabinFactor(cabin: Cabin): number {
  switch (cabin) {
    case "premium_economy":
      return 1.62;
    case "business":
      return 3.15;
    case "first":
      return 4.9;
    default:
      return 1;
  }
}

function brandFactor(brand: FareBrand): number {
  if (brand === "standard") return 1.16;
  if (brand === "flex") return 1.42;
  return 1;
}

function priceFare(query: SearchQuery, slices: Slice[], brand: FareBrand): { base: number; tax: number; total: number } {
  const km = slices.reduce((sum, slice) => {
    return (
      sum +
      slice.segments.reduce((legSum, segment) => legSum + distanceKm(segment.origin, segment.destination), 0)
    );
  }, 0);
  const longHaul = km / slices.length > 3700;
  const nonstop = slices.every((slice) => slice.segments.length === 1);
  const pax = query.adults + query.children * 0.75 + query.infants * 0.12;
  const yieldPerKm = longHaul ? 0.068 : 0.105;
  let basePounds =
    km *
    yieldPerKm *
    cabinFactor(query.cabin) *
    brandFactor(brand) *
    pax *
    seasonFactor(query.departDate);
  basePounds *= nonstop ? 1.1 : 0.9;
  const apdAdult = (longHaul ? 184 : 28) * (query.cabin === "business" || query.cabin === "first" ? 2 : 1);
  const apdChild = longHaul ? 92 : 14;
  const taxPounds = apdAdult * query.adults + apdChild * query.children + basePounds * 0.12;
  const base = Math.max(39 * Math.max(1, query.adults), Math.round(basePounds)) * 100;
  const tax = Math.round(taxPounds) * 100;
  return { base, tax, total: base + tax };
}

function fareCopy(brand: FareBrand, currencyPenalty = "£"): {
  brandName: string;
  cabinBag: string;
  checkedBag: string;
  changeRule: string;
  refundRule: string;
} {
  if (brand === "flex") {
    return {
      brandName: "Flex",
      cabinBag: "Cabin bag, 10kg",
      checkedBag: "2 checked bags, 23kg",
      changeRule: `Changes are free before departure. A fare difference may apply.`,
      refundRule: `Refundable before departure, minus a ${currencyPenalty}50 fee.`,
    };
  }
  if (brand === "standard") {
    return {
      brandName: "Standard",
      cabinBag: "Cabin bag, 10kg",
      checkedBag: "1 checked bag, 23kg",
      changeRule: `Changes cost ${currencyPenalty}60 plus any fare difference.`,
      refundRule: "Non-refundable. Some taxes may be recoverable on request.",
    };
  }
  return {
    brandName: "Light",
    cabinBag: "Cabin bag, 8kg",
    checkedBag: "No checked bag",
    changeRule: "Changes are not included.",
    refundRule: "Non-refundable.",
  };
}

function buildItinerary(query: SearchQuery, variant: number): Itinerary | null {
  const patterns = [
    { slot: 0, hubSalt: null as number | null },
    { slot: 2, hubSalt: null },
    { slot: 4, hubSalt: null },
    { slot: 1, hubSalt: 0 },
    { slot: 3, hubSalt: 1 },
    { slot: 5, hubSalt: 2 },
  ];
  const pattern = patterns[variant];
  if (!pattern) return null;
  const hub = pattern.hubSalt === null ? null : pickHub(query.origin, query.destination, pattern.hubSalt);
  if (pattern.hubSalt !== null && !hub) return null;

  const airline = AIRLINES[hash(`${query.origin}${query.destination}${variant}`) % AIRLINES.length];
  const outbound = buildSlice(query.origin, query.destination, query.departDate, pattern.slot, variant, airline, hub);
  const slices = [outbound];
  if (query.tripType === "return" && query.returnDate) {
    const returnHub = hub;
    slices.push(
      buildSlice(
        query.destination,
        query.origin,
        query.returnDate,
        (pattern.slot + 1) % SLOTS.length,
        variant + 11,
        airline,
        returnHub,
      ),
    );
  }

  const fares: FareOption[] = BRANDS.map((brand) => {
    const money = priceFare(query, slices, brand);
    const copy = fareCopy(brand);
    return {
      id: encodeKey({ q: query, v: variant, b: brand }),
      brand,
      ...copy,
      totalMinor: money.total,
      baseMinor: money.base,
      taxMinor: money.tax,
      currency: "GBP",
    };
  });

  const stops = Math.max(...slices.map((slice) => slice.segments.length - 1));
  return {
    id: encodeKey({ q: query, v: variant }),
    supplier: "sample",
    slices,
    stops,
    durationMinutes: slices.reduce((sum, slice) => sum + slice.durationMinutes, 0),
    airlines: [airline],
    cabin: query.cabin,
    travellers: {
      adults: query.adults,
      children: query.children,
      infants: query.infants,
    },
    fares,
  };
}

export function searchSample(query: SearchQuery): Itinerary[] {
  return [0, 1, 2, 3, 4, 5]
    .map((variant) => buildItinerary(query, variant))
    .filter((itinerary): itinerary is Itinerary => Boolean(itinerary))
    .sort((a, b) => a.fares[0].totalMinor - b.fares[0].totalMinor);
}

export function getSampleItinerary(id: string): Itinerary | null {
  const key = decodeKey(id);
  if (!key) return null;
  const parsed = parseSearchQuery(
    {
      origin: key.q.origin,
      destination: key.q.destination,
      tripType: key.q.tripType,
      departDate: key.q.departDate,
      returnDate: key.q.returnDate,
      adults: String(key.q.adults),
      children: String(key.q.children),
      infants: String(key.q.infants),
      cabin: key.q.cabin,
    },
    "1970-01-01",
  );
  if ("error" in parsed) return null;
  return buildItinerary(parsed.query, key.v);
}

export function getSampleOffer(id: string): Offer | null {
  const key = decodeKey(id);
  if (!key?.b) return null;
  const itinerary = getSampleItinerary(id);
  const selectedFare = itinerary?.fares.find((fare) => fare.brand === key.b);
  if (!itinerary || !selectedFare) return null;
  return { ...itinerary, selectedFare };
}
