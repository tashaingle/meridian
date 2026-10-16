"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createBookingAction, type BookingResult } from "@/lib/actions";
import { COUNTRIES } from "@/lib/countries";
import { saveLocalBooking } from "@/lib/local-bookings";
import type { Offer, PaxType } from "@/lib/types";

const inputClass = "h-11 w-full rounded-xl border border-line bg-white px-3";

export function CheckoutForm({ offer, idempotencyKey }: { offer: Offer; idempotencyKey: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createBookingAction, null as BookingResult | null);
  const slots = useMemo(() => {
    const list: { type: PaxType; label: string }[] = [];
    for (let index = 0; index < offer.travellers.adults; index += 1) {
      list.push({ type: "adult", label: `Adult ${index + 1}` });
    }
    for (let index = 0; index < offer.travellers.children; index += 1) {
      list.push({ type: "child", label: `Child ${index + 1}` });
    }
    for (let index = 0; index < offer.travellers.infants; index += 1) {
      list.push({ type: "infant", label: `Infant ${index + 1}` });
    }
    return list;
  }, [offer.travellers]);

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state?.ok) {
      saveLocalBooking(state.booking);
      router.push(`/confirmation/${state.booking.reference}`);
    }
  }, [router, state]);

  function setField(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function fillSample() {
    const next: Record<string, string> = {
      email: "demo@example.com",
      phone: "+44 7700 900123",
      cardName: "A Sample",
      cardNumber: "4242 4242 4242 4242",
      cardExpiry: "12/30",
      cardCvc: "123",
      terms: "yes",
    };
    slots.forEach((slot, index) => {
      const year = slot.type === "adult" ? "1991" : slot.type === "child" ? "2018" : "2025";
      next[`pax${index}title`] = "mx";
      next[`pax${index}given`] = index === 0 ? "Alex" : "Sam";
      next[`pax${index}family`] = "Sample";
      next[`pax${index}dob`] = `${year}-04-12`;
      next[`pax${index}gender`] = "f";
      next[`pax${index}nationality`] = "GB";
      next[`pax${index}document`] = `SAMPLE${1000 + index}`;
      next[`pax${index}expiry`] = "2030-06-01";
      next[`pax${index}issuing`] = "GB";
    });
    setValues(next);
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="fareId" value={offer.selectedFare.id} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="expectedTotal" value={offer.selectedFare.totalMinor} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">Travellers</h2>
        <button type="button" onClick={fillSample} className="text-sm font-medium text-sea">
          Fill sample traveller
        </button>
      </div>
      <p className="text-sm text-muted">
        Use made-up details. The full document number is checked, then only the last four characters are kept.
      </p>
      {slots.map((slot, index) => (
        <fieldset key={slot.label} className="rounded-2xl border border-line bg-card p-4">
          <legend className="px-1 font-medium">{slot.label}</legend>
          {slot.type === "infant" && (
            <p className="mb-3 text-sm text-muted">Infants travel on an adult&apos;s lap in this demonstration.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Select name={`pax${index}title`} label="Title" value={values[`pax${index}title`] ?? ""} onChange={setField}>
              <option value="">Choose</option>
              <option value="mr">Mr</option>
              <option value="ms">Ms</option>
              <option value="mx">Mx</option>
            </Select>
            <Select name={`pax${index}gender`} label="Gender" value={values[`pax${index}gender`] ?? ""} onChange={setField}>
              <option value="">Choose</option>
              <option value="f">Female</option>
              <option value="m">Male</option>
            </Select>
            <Field name={`pax${index}given`} label="Given name" value={values[`pax${index}given`] ?? ""} onChange={setField} />
            <Field name={`pax${index}family`} label="Family name" value={values[`pax${index}family`] ?? ""} onChange={setField} />
            <Field name={`pax${index}dob`} label="Date of birth" type="date" value={values[`pax${index}dob`] ?? ""} onChange={setField} />
            <CountrySelect name={`pax${index}nationality`} label="Nationality" value={values[`pax${index}nationality`] ?? ""} onChange={setField} />
            <Field name={`pax${index}document`} label="Document number" value={values[`pax${index}document`] ?? ""} onChange={setField} />
            <Field name={`pax${index}expiry`} label="Document expiry" type="date" value={values[`pax${index}expiry`] ?? ""} onChange={setField} />
            <CountrySelect name={`pax${index}issuing`} label="Issuing country" value={values[`pax${index}issuing`] ?? ""} onChange={setField} />
          </div>
        </fieldset>
      ))}

      <section className="rounded-2xl border border-line bg-card p-4">
        <h2 className="font-serif text-2xl">Contact</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field name="email" label="Email" type="email" value={values.email ?? ""} onChange={setField} />
          <Field name="phone" label="Phone" type="tel" value={values.phone ?? ""} onChange={setField} />
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card p-4">
        <h2 className="font-serif text-2xl">Payment</h2>
        <p className="mt-1 text-sm text-muted">
          No charge is made. Try 4242 4242 4242 4242, any future expiry and any 3-digit code. The card number is not stored.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field name="cardName" label="Name on card" value={values.cardName ?? ""} onChange={setField} />
          <Field name="cardNumber" label="Card number" inputMode="numeric" autoComplete="off" value={values.cardNumber ?? ""} onChange={setField} />
          <Field name="cardExpiry" label="Expiry" placeholder="MM/YY" value={values.cardExpiry ?? ""} onChange={setField} />
          <Field name="cardCvc" label="Security code" inputMode="numeric" autoComplete="off" value={values.cardCvc ?? ""} onChange={setField} />
        </div>
      </section>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="terms"
          value="yes"
          checked={values.terms === "yes"}
          onChange={(event) => setField("terms", event.target.checked ? "yes" : "")}
          className="mt-1"
        />
        <span>
          I accept the <a className="text-sea underline" href="/terms">terms</a> and{" "}
          <a className="text-sea underline" href="/privacy">privacy note</a>, and I understand this is a demonstration.
        </span>
      </label>

      {state && !state.ok && (
        <div className="rounded-xl bg-sand px-4 py-3 text-sm text-ink">
          <ul className="list-disc space-y-1 pl-4">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit" disabled={pending} className="h-12 rounded-full bg-copper px-8 font-semibold text-white disabled:opacity-60">
        {pending ? "Checking…" : "Confirm demonstration booking"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function Select({
  name,
  label,
  value,
  onChange,
  children,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <select name={name} required value={value} onChange={(event) => onChange(name, event.target.value)} className={inputClass}>
        {children}
      </select>
    </label>
  );
}

function CountrySelect({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <Select name={name} label={label} value={value} onChange={onChange}>
      <option value="">Choose</option>
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </Select>
  );
}
