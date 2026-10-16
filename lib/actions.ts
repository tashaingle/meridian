"use server";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";
import { ageOn } from "@/lib/format";
import { cardBrand, digitsOnly, luhnOk, validExpiry } from "@/lib/payment";
import { findBooking, findByIdempotency, saveBooking } from "@/lib/store";
import { getOffer } from "@/lib/supplier";
import type { Booking, Passenger, PaxType } from "@/lib/types";

export type BookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; errors: string[] };

const hits = new Map<string, number[]>();

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= 8) return true;
  recent.push(now);
  hits.set(key, recent);
  return false;
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function makeReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let reference = "MRD-";
  for (const byte of bytes) reference += alphabet[byte % alphabet.length];
  return reference;
}

function nameOk(value: string): boolean {
  return /^[A-Za-z][A-Za-z' -]{0,39}$/.test(value);
}

const COUNTRY_CODES = new Set(COUNTRIES.map((country) => country.code));

function passengerFromForm(
  formData: FormData,
  index: number,
  type: PaxType,
  ordinal: number,
  departDate: string,
): { passenger?: Passenger; errors: string[] } {
  const prefix = `pax${index}`;
  const label = `${type === "adult" ? "Adult" : type === "child" ? "Child" : "Infant"} ${ordinal}`;
  const errors: string[] = [];
  const title = field(formData, `${prefix}title`);
  const givenName = field(formData, `${prefix}given`);
  const familyName = field(formData, `${prefix}family`);
  const dateOfBirth = field(formData, `${prefix}dob`);
  const gender = field(formData, `${prefix}gender`);
  const nationality = field(formData, `${prefix}nationality`);
  const documentNumber = field(formData, `${prefix}document`).toUpperCase();
  const documentExpiry = field(formData, `${prefix}expiry`);
  const issuingCountry = field(formData, `${prefix}issuing`);

  if (!["mr", "ms", "mx"].includes(title)) errors.push(`${label}: choose a title.`);
  if (!nameOk(givenName) || !nameOk(familyName)) {
    errors.push(`${label}: enter a given name and family name in Latin letters.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    errors.push(`${label}: enter a date of birth.`);
  } else {
    const age = ageOn(dateOfBirth, departDate);
    if (type === "adult" && age < 12) errors.push(`${label}: an adult is 12 or over on departure.`);
    if (type === "child" && (age < 2 || age > 11)) errors.push(`${label}: a child is aged 2 to 11 on departure.`);
    if (type === "infant" && (age < 0 || age > 1)) errors.push(`${label}: an infant is under 2 on departure.`);
  }
  if (gender !== "m" && gender !== "f") errors.push(`${label}: choose a gender.`);
  if (!COUNTRY_CODES.has(nationality)) errors.push(`${label}: choose a nationality.`);
  if (!/^[A-Z0-9]{6,12}$/.test(documentNumber)) {
    errors.push(`${label}: enter a travel document number of 6 to 12 letters or numbers.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(documentExpiry) || documentExpiry <= departDate) {
    errors.push(`${label}: the travel document must expire after departure.`);
  }
  if (!COUNTRY_CODES.has(issuingCountry)) errors.push(`${label}: choose the document's issuing country.`);

  if (errors.length) return { errors };
  return {
    errors,
    passenger: {
      type,
      title,
      givenName,
      familyName,
      dateOfBirth,
      gender: gender as "m" | "f",
      nationality,
      documentLast4: documentNumber.slice(-4),
      documentExpiry,
      issuingCountry,
    },
  };
}

export async function createBookingAction(
  _previous: BookingResult | null,
  formData: FormData,
): Promise<BookingResult> {
  const email = field(formData, "email").toLowerCase();
  if (limited(email || "anonymous")) {
    return { ok: false, errors: ["Too many attempts. Wait a minute and try again."] };
  }

  const fareId = field(formData, "fareId");
  const idempotencyKey = field(formData, "idempotencyKey");
  const expectedTotal = Number(field(formData, "expectedTotal"));
  const offer = await getOffer(fareId);
  if (!offer) return { ok: false, errors: ["That fare is no longer available. Search again."] };

  const existing = idempotencyKey ? await findByIdempotency(idempotencyKey) : null;
  if (existing) return { ok: true, booking: existing };

  if (offer.selectedFare.totalMinor !== expectedTotal) {
    return {
      ok: false,
      errors: ["The fare changed before checkout. Go back and review the new price."],
    };
  }

  const errors: string[] = [];
  const phone = field(formData, "phone");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Enter a contact email address.");
  if (digitsOnly(phone).length < 8) errors.push("Enter a contact phone number.");
  if (field(formData, "terms") !== "yes") errors.push("Accept the terms to continue.");

  const departDate = offer.slices[0]?.departAt.slice(0, 10) ?? "";
  const slots: PaxType[] = [
    ...Array.from({ length: offer.travellers.adults }, () => "adult" as const),
    ...Array.from({ length: offer.travellers.children }, () => "child" as const),
    ...Array.from({ length: offer.travellers.infants }, () => "infant" as const),
  ];
  const passengers: Passenger[] = [];
  slots.forEach((type, index) => {
    const ordinal = slots.slice(0, index + 1).filter((item) => item === type).length;
    const parsed = passengerFromForm(formData, index, type, ordinal, departDate);
    errors.push(...parsed.errors);
    if (parsed.passenger) passengers.push(parsed.passenger);
  });

  const cardNumber = field(formData, "cardNumber");
  const cardName = field(formData, "cardName");
  const cardExpiry = field(formData, "cardExpiry");
  const cardCvc = digitsOnly(field(formData, "cardCvc"));
  if (!nameOk(cardName)) errors.push("Enter the name on the card.");
  if (!luhnOk(cardNumber)) errors.push("Enter a valid card number. The demonstration card is 4242 4242 4242 4242.");
  if (!validExpiry(cardExpiry)) errors.push("Enter a future expiry as MM/YY.");
  const brand = cardBrand(cardNumber);
  const expectedCvc = brand === "American Express" ? 4 : 3;
  if (cardCvc.length !== expectedCvc) errors.push(`Enter the ${expectedCvc}-digit security code.`);

  if (errors.length || passengers.length !== slots.length) {
    return { ok: false, errors };
  }

  const booking: Booking = {
    reference: makeReference(),
    idempotencyKey: idempotencyKey || makeReference(),
    createdAt: new Date().toISOString(),
    status: offer.supplier === "duffel" ? "supplier_not_ticketed" : "demo_confirmed",
    email,
    phone,
    passengers,
    offer,
    payment: { brand, last4: digitsOnly(cardNumber).slice(-4) },
    supplierOrderId: null,
    storage: "browser",
  };

  try {
    const saved = await saveBooking(booking);
    return { ok: true, booking: saved };
  } catch {
    return { ok: true, booking: { ...booking, storage: "browser" } };
  }
}

export async function lookupBookingAction(
  _previous: { booking: Booking | null; error?: string } | null,
  formData: FormData,
): Promise<{ booking: Booking | null; error?: string }> {
  const reference = field(formData, "reference").toUpperCase();
  const email = field(formData, "email").toLowerCase();
  if (!/^MRD-[A-Z0-9]{6}$/.test(reference) || !email) {
    return { booking: null, error: "Enter the booking reference and the contact email." };
  }
  const booking = await findBooking(reference);
  if (!booking || booking.email !== email) {
    return { booking: null, error: "No booking matched those details on this server." };
  }
  return { booking };
}

function adminToken(expiry: string): string {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  const signature = createHmac("sha256", secret).update(expiry).digest("base64url");
  return `${expiry}.${signature}`;
}

export async function loginAdminAction(
  _previous: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return { error: "Set ADMIN_PASSWORD before signing in." };
  const password = field(formData, "password");
  const left = Buffer.from(password);
  const right = Buffer.from(configured);
  const match = left.length === right.length && timingSafeEqual(left, right);
  if (!match) return { error: "That password was not recognised." };
  const expiry = String(Date.now() + 12 * 60 * 60 * 1000);
  const jar = await cookies();
  jar.set("meridian_admin", adminToken(expiry), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return {};
}

export async function logoutAdminAction(): Promise<void> {
  const jar = await cookies();
  jar.delete("meridian_admin");
  redirect("/admin");
}

export async function adminSession(): Promise<boolean> {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return false;
  const token = (await cookies()).get("meridian_admin")?.value ?? "";
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;
  if (Number(expiry) < Date.now()) return false;
  const expected = adminToken(expiry).split(".")[1];
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
