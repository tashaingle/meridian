"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { airportLabel, getAirport, searchAirports } from "@/lib/airports";

export function AirportField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (iata: string) => void;
}) {
  const id = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = getAirport(value);
  const [text, setText] = useState(selected ? airportLabel(selected) : "");
  const [syncedValue, setSyncedValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  if (value !== syncedValue) {
    setSyncedValue(value);
    if (selected) setText(airportLabel(selected));
  }

  const matches = useMemo(() => searchAirports(open && text === (selected ? airportLabel(selected) : "") ? "" : text), [open, selected, text]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  function choose(iata: string) {
    const airport = getAirport(iata);
    onChange(iata);
    setText(airport ? airportLabel(airport) : iata);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        className="h-12 w-full rounded-xl border border-line bg-white px-3 text-ink outline-none placeholder:text-muted/70 focus:border-sea"
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onChange={(event) => {
          setText(event.target.value);
          onChange("");
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((current) => Math.min(current + 1, matches.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((current) => Math.max(current - 1, 0));
          } else if (event.key === "Enter" && open && matches[active]) {
            event.preventDefault();
            choose(matches[active].iata);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-line bg-white py-1 shadow-lg">
          {matches.map((airport, index) => (
            <li key={airport.iata} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left ${index === active ? "bg-sand" : "hover:bg-sand/70"}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(airport.iata)}
              >
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {airport.city}
                    <span className="font-normal text-muted"> · {airport.name}</span>
                  </span>
                  <span className="text-xs text-muted">{airport.country}</span>
                </span>
                <span className="font-semibold tracking-wide text-sea">{airport.iata}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
