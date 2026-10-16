import { duffelEnabled, duffelMode, getDuffelOffer, searchDuffel } from "@/lib/duffel";
import { getSampleItinerary, getSampleOffer, searchSample } from "@/lib/sample-offers";
import type { Itinerary, Offer, SearchQuery, SupplierMode } from "@/lib/types";

export type SearchResult = {
  mode: SupplierMode;
  itineraries: Itinerary[];
  notice?: string;
};

export async function searchFlights(query: SearchQuery): Promise<SearchResult> {
  if (!duffelEnabled()) {
    return {
      mode: "sample",
      itineraries: searchSample(query),
      notice: "Sample fares for this demonstration. Nothing is held with an airline.",
    };
  }

  try {
    const itineraries = await searchDuffel(query);
    const test = duffelMode() === "test";
    return {
      mode: "duffel",
      itineraries,
      notice: test
        ? itineraries.length
          ? "Duffel test fares. Schedules and prices are not real airline quotes, and nothing is held."
          : "Duffel test mode returned no offers for that search."
        : itineraries.length
          ? "Live offers from Duffel. Meridian will not ticket them until payments are approved."
          : "Duffel returned no offers for that search.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Duffel search failed.";
    return { mode: "duffel", itineraries: [], notice: message };
  }
}

export async function getItinerary(id: string): Promise<Itinerary | null> {
  if (id.startsWith("smp_")) return getSampleItinerary(id);
  if (!duffelEnabled()) return null;
  try {
    const offer = await getDuffelOffer(id);
    return offer;
  } catch {
    return null;
  }
}

export async function getOffer(id: string): Promise<Offer | null> {
  if (id.startsWith("smp_")) return getSampleOffer(id);
  if (!duffelEnabled()) return null;
  try {
    return await getDuffelOffer(id);
  } catch {
    return null;
  }
}
