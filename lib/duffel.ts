import { toMinor } from "@/lib/format";
import type { Cabin, FareOption, Itinerary, Offer, SearchQuery, Segment, Slice } from "@/lib/types";

const DUFFEL_URL = "https://api.duffel.com";

type DuffelPlace = { iata_code?: string; name?: string };
type DuffelCarrier = { iata_code?: string; name?: string };
type DuffelSegment = {
  origin?: DuffelPlace;
  destination?: DuffelPlace;
  departing_at?: string;
  arriving_at?: string;
  duration?: string;
  marketing_carrier?: DuffelCarrier;
  marketing_carrier_flight_number?: string;
  aircraft?: { name?: string } | null;
  passengers?: { baggages?: { type?: string; quantity?: number }[] }[];
};
type DuffelSlice = {
  origin?: DuffelPlace;
  destination?: DuffelPlace;
  duration?: string;
  segments?: DuffelSegment[];
};
type DuffelCondition = {
  allowed?: boolean;
  penalty_amount?: string | null;
  penalty_currency?: string | null;
} | null;
type DuffelOffer = {
  id: string;
  total_amount: string;
  total_currency: string;
  tax_amount?: string | null;
  base_amount?: string | null;
  owner?: DuffelCarrier;
  slices?: DuffelSlice[];
  passengers?: { type?: string }[];
  conditions?: {
    change_before_departure?: DuffelCondition;
    refund_before_departure?: DuffelCondition;
  };
};

function parseDuration(value?: string | null): number {
  if (!value) return 0;
  const match = value.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return Number(match[1] || 0) * 1440 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

function conditionText(
  condition: DuffelCondition | undefined,
  allowedLabel: string,
  blockedLabel: string,
): string {
  if (!condition) return "The airline has not published this condition.";
  if (!condition.allowed) return blockedLabel;
  if (condition.penalty_amount && Number(condition.penalty_amount) > 0) {
    return `${allowedLabel} A penalty of ${condition.penalty_amount} ${condition.penalty_currency ?? ""} may apply.`.trim();
  }
  return allowedLabel;
}

function mapSegment(segment: DuffelSegment): Segment {
  return {
    origin: segment.origin?.iata_code ?? "",
    destination: segment.destination?.iata_code ?? "",
    departAt: segment.departing_at ?? "",
    arriveAt: segment.arriving_at ?? "",
    durationMinutes: parseDuration(segment.duration),
    flightNumber: `${segment.marketing_carrier?.iata_code ?? ""} ${segment.marketing_carrier_flight_number ?? ""}`.trim(),
    airlineCode: segment.marketing_carrier?.iata_code ?? segment.marketing_carrier?.name?.slice(0, 2).toUpperCase() ?? "—",
    airlineName: segment.marketing_carrier?.name ?? "Airline",
    aircraft: segment.aircraft?.name ?? "Aircraft to be confirmed",
  };
}

function baggageSummary(slices: DuffelSlice[]): { cabinBag: string; checkedBag: string } {
  const bags = slices[0]?.segments?.[0]?.passengers?.[0]?.baggages ?? [];
  const checked = bags.find((bag) => bag.type === "checked");
  const carry = bags.find((bag) => bag.type === "carry_on");
  return {
    cabinBag: carry?.quantity ? `${carry.quantity} cabin bag${carry.quantity > 1 ? "s" : ""}` : "Cabin bag as shown by the airline",
    checkedBag: checked?.quantity
      ? `${checked.quantity} checked bag${checked.quantity > 1 ? "s" : ""}`
      : "No checked bag shown",
  };
}

function mapOffer(offer: DuffelOffer, query: SearchQuery): Itinerary | null {
  const slices: Slice[] = (offer.slices ?? []).map((slice) => {
    const segments = (slice.segments ?? []).map(mapSegment);
    const first = segments[0];
    const last = segments[segments.length - 1];
    return {
      origin: slice.origin?.iata_code || first?.origin || "",
      destination: slice.destination?.iata_code || last?.destination || "",
      departAt: first?.departAt ?? "",
      arriveAt: last?.arriveAt ?? "",
      durationMinutes: parseDuration(slice.duration) || segments.reduce((sum, segment) => sum + segment.durationMinutes, 0),
      segments,
    };
  });
  if (!slices.length || slices.some((slice) => slice.segments.length === 0)) return null;

  const currency = offer.total_currency || "GBP";
  const totalMinor = toMinor(offer.total_amount, currency);
  const taxMinor = offer.tax_amount ? toMinor(offer.tax_amount, currency) : 0;
  const baseMinor = offer.base_amount ? toMinor(offer.base_amount, currency) : Math.max(0, totalMinor - taxMinor);
  const bags = baggageSummary(offer.slices ?? []);
  const fare: FareOption = {
    id: offer.id,
    brand: "standard",
    brandName: "Airline fare",
    totalMinor,
    baseMinor,
    taxMinor,
    currency,
    ...bags,
    changeRule: conditionText(
      offer.conditions?.change_before_departure,
      "Changes are allowed before departure.",
      "Changes are not allowed before departure.",
    ),
    refundRule: conditionText(
      offer.conditions?.refund_before_departure,
      "Refunds are allowed before departure.",
      "This fare is non-refundable before departure.",
    ),
  };

  const airlines = new Map<string, string>();
  for (const slice of slices) {
    for (const segment of slice.segments) {
      airlines.set(segment.airlineCode, segment.airlineName);
    }
  }
  if (offer.owner?.iata_code && offer.owner.name) {
    airlines.set(offer.owner.iata_code, offer.owner.name);
  }

  const passengerTypes = offer.passengers ?? [];
  const adults = passengerTypes.filter((person) => person.type === "adult").length || query.adults;
  const children = passengerTypes.filter((person) => person.type === "child").length || query.children;
  const infants =
    passengerTypes.filter((person) => person.type === "infant_without_seat").length || query.infants;

  return {
    id: offer.id,
    supplier: "duffel",
    slices,
    stops: Math.max(...slices.map((slice) => Math.max(0, slice.segments.length - 1))),
    durationMinutes: slices.reduce((sum, slice) => sum + slice.durationMinutes, 0),
    airlines: [...airlines.entries()].map(([code, name]) => ({ code, name })),
    cabin: query.cabin,
    travellers: { adults, children, infants },
    fares: [fare],
  };
}

async function duffel<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) throw new Error("Duffel token is not configured.");
  const response = await fetch(`${DUFFEL_URL}${path}`, {
    ...init,
    signal: AbortSignal.timeout(25_000),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip",
      "Duffel-Version": "v2",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Duffel returned ${response.status}. ${text.slice(0, 240)}`);
  }
  return JSON.parse(text) as T;
}

function passengerBody(query: SearchQuery): { type: string }[] {
  return [
    ...Array.from({ length: query.adults }, () => ({ type: "adult" })),
    ...Array.from({ length: query.children }, () => ({ type: "child" })),
    ...Array.from({ length: query.infants }, () => ({ type: "infant_without_seat" })),
  ];
}

export function duffelMode(): "off" | "test" | "live" {
  const token = process.env.DUFFEL_ACCESS_TOKEN?.trim() ?? "";
  if (!token) return "off";
  if (token.startsWith("duffel_test_")) return "test";
  return "live";
}

export function duffelEnabled(): boolean {
  return duffelMode() !== "off";
}

export async function searchDuffel(query: SearchQuery): Promise<Itinerary[]> {
  const slices = [
    {
      origin: query.origin,
      destination: query.destination,
      departure_date: query.departDate,
    },
  ];
  if (query.tripType === "return" && query.returnDate) {
    slices.push({
      origin: query.destination,
      destination: query.origin,
      departure_date: query.returnDate,
    });
  }

  const payload = await duffel<{ data: { offers?: DuffelOffer[] } }>(
    "/air/offer_requests?return_offers=true",
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          cabin_class: query.cabin satisfies Cabin,
          passengers: passengerBody(query),
          slices,
        },
      }),
    },
  );

  return (payload.data.offers ?? [])
    .map((offer) => mapOffer(offer, query))
    .filter((offer): offer is Itinerary => Boolean(offer))
    .sort((a, b) => a.fares[0].totalMinor - b.fares[0].totalMinor)
    .slice(0, 30);
}

export async function getDuffelOffer(id: string, cabin: Cabin = "economy"): Promise<Offer | null> {
  const payload = await duffel<{ data: DuffelOffer }>(`/air/offers/${encodeURIComponent(id)}`);
  const fallbackQuery: SearchQuery = {
    origin: payload.data.slices?.[0]?.origin?.iata_code ?? "",
    destination: payload.data.slices?.[0]?.destination?.iata_code ?? "",
    tripType: (payload.data.slices?.length ?? 0) > 1 ? "return" : "oneway",
    departDate: payload.data.slices?.[0]?.segments?.[0]?.departing_at?.slice(0, 10) ?? "",
    adults: 1,
    children: 0,
    infants: 0,
    cabin,
  };
  const itinerary = mapOffer(payload.data, fallbackQuery);
  if (!itinerary) return null;
  return { ...itinerary, selectedFare: itinerary.fares[0] };
}
