import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Booking } from "@/lib/types";

const FILE = path.join(process.cwd(), ".data", "bookings.json");

let chain: Promise<unknown> = Promise.resolve();

function locked<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function supabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseHeaders(): HeadersInit {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function readFileStore(): Promise<Booking[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileStore(bookings: Booking[]): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(bookings, null, 2));
}

export async function findBooking(reference: string): Promise<Booking | null> {
  const code = reference.trim().toUpperCase();
  if (supabaseConfigured()) {
    const url = new URL("/rest/v1/bookings", process.env.SUPABASE_URL);
    url.searchParams.set("reference", `eq.${code}`);
    url.searchParams.set("select", "*");
    const response = await fetch(url, { headers: supabaseHeaders(), cache: "no-store" });
    if (!response.ok) return null;
    const rows = (await response.json()) as { payload: Booking }[];
    return rows[0]?.payload ?? null;
  }
  const bookings = await readFileStore();
  return bookings.find((booking) => booking.reference === code) ?? null;
}

export async function findByIdempotency(key: string): Promise<Booking | null> {
  if (!key) return null;
  if (supabaseConfigured()) {
    const url = new URL("/rest/v1/bookings", process.env.SUPABASE_URL);
    url.searchParams.set("idempotency_key", `eq.${key}`);
    url.searchParams.set("select", "payload");
    const response = await fetch(url, { headers: supabaseHeaders(), cache: "no-store" });
    if (!response.ok) return null;
    const rows = (await response.json()) as { payload: Booking }[];
    return rows[0]?.payload ?? null;
  }
  const bookings = await readFileStore();
  return bookings.find((booking) => booking.idempotencyKey === key) ?? null;
}

export async function saveBooking(booking: Booking): Promise<Booking> {
  const existing = await findByIdempotency(booking.idempotencyKey);
  if (existing) return existing;

  if (supabaseConfigured()) {
    const response = await fetch(new URL("/rest/v1/bookings", process.env.SUPABASE_URL), {
      method: "POST",
      headers: {
        ...supabaseHeaders(),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        reference: booking.reference,
        idempotency_key: booking.idempotencyKey,
        email: booking.email,
        payload: { ...booking, storage: "supabase" },
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail.slice(0, 180));
    }
    return { ...booking, storage: "supabase" };
  }

  return locked(async () => {
    const bookings = await readFileStore();
    const already = bookings.find((item) => item.idempotencyKey === booking.idempotencyKey);
    if (already) return already;
    const next = { ...booking, storage: "file" as const };
    bookings.unshift(next);
    await writeFileStore(bookings);
    return next;
  });
}

export async function listBookings(): Promise<Booking[]> {
  if (supabaseConfigured()) {
    const url = new URL("/rest/v1/bookings", process.env.SUPABASE_URL);
    url.searchParams.set("select", "payload");
    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("limit", "100");
    const response = await fetch(url, { headers: supabaseHeaders(), cache: "no-store" });
    if (!response.ok) return [];
    const rows = (await response.json()) as { payload: Booking }[];
    return rows.map((row) => row.payload);
  }
  return readFileStore();
}
