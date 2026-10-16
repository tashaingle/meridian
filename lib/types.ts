export type Cabin = "economy" | "premium_economy" | "business" | "first";
export type TripType = "return" | "oneway";
export type PaxType = "adult" | "child" | "infant";
export type FareBrand = "light" | "standard" | "flex";
export type SupplierMode = "sample" | "duffel";

export type SearchQuery = {
  origin: string;
  destination: string;
  tripType: TripType;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
};

export type Travellers = {
  adults: number;
  children: number;
  infants: number;
};

export type Segment = {
  origin: string;
  destination: string;
  departAt: string;
  arriveAt: string;
  durationMinutes: number;
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  aircraft: string;
};

export type Slice = {
  origin: string;
  destination: string;
  departAt: string;
  arriveAt: string;
  durationMinutes: number;
  segments: Segment[];
};

export type FareOption = {
  id: string;
  brand: FareBrand;
  brandName: string;
  totalMinor: number;
  baseMinor: number;
  taxMinor: number;
  currency: string;
  cabinBag: string;
  checkedBag: string;
  changeRule: string;
  refundRule: string;
};

export type Itinerary = {
  id: string;
  supplier: SupplierMode;
  slices: Slice[];
  stops: number;
  durationMinutes: number;
  airlines: { code: string; name: string }[];
  cabin: Cabin;
  travellers: Travellers;
  fares: FareOption[];
};

export type Offer = Itinerary & {
  selectedFare: FareOption;
};

export type Passenger = {
  type: PaxType;
  title: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  gender: "m" | "f";
  nationality: string;
  documentLast4: string;
  documentExpiry: string;
  issuingCountry: string;
};

export type BookingStorage = "supabase" | "file" | "browser";

export type Booking = {
  reference: string;
  idempotencyKey: string;
  createdAt: string;
  status: "demo_confirmed" | "supplier_not_ticketed";
  email: string;
  phone: string;
  passengers: Passenger[];
  offer: Offer;
  payment: { brand: string; last4: string };
  supplierOrderId: null;
  storage: BookingStorage;
};
