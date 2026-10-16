import { getAirport } from "@/lib/airports";
import { dateLabel, dayOffset, formatDuration, stopsLabel, timeLabel } from "@/lib/format";
import type { Itinerary, Slice } from "@/lib/types";

export function AirlineMark({ code }: { code: string }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand text-sm font-semibold text-sea-deep">
      {code.slice(0, 2)}
    </span>
  );
}

export function SliceView({ slice }: { slice: Slice }) {
  const from = getAirport(slice.origin);
  const to = getAirport(slice.destination);
  const offset = dayOffset(slice.departAt, slice.arriveAt);
  const stops = slice.segments.length - 1;
  const layover = slice.segments.slice(0, -1).map((segment, index) => {
    const next = slice.segments[index + 1];
    const minutes = Math.round(
      (Date.parse(`${next.departAt}Z`) - Date.parse(`${segment.arriveAt}Z`)) / 60000,
    );
    const place = getAirport(segment.destination);
    return `${place?.city ?? segment.destination} ${formatDuration(minutes)}`;
  });

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div>
        <p className="font-serif text-2xl tracking-tight">{timeLabel(slice.departAt)}</p>
        <p className="text-sm text-muted">
          {slice.origin}
          {from ? ` · ${from.city}` : ""}
        </p>
        <p className="text-xs text-muted">{dateLabel(slice.departAt)}</p>
      </div>
      <div className="text-sm text-muted sm:text-center">
        <p>{formatDuration(slice.durationMinutes)}</p>
        <p className="font-medium text-ink">{stopsLabel(stops)}</p>
        {layover.length > 0 && <p>{layover.join(", ")}</p>}
      </div>
      <div className="sm:text-right">
        <p className="font-serif text-2xl tracking-tight">
          {timeLabel(slice.arriveAt)}
          {offset > 0 && <span className="ml-1 text-sm text-copper">+{offset}</span>}
        </p>
        <p className="text-sm text-muted">
          {slice.destination}
          {to ? ` · ${to.city}` : ""}
        </p>
        <p className="text-xs text-muted">{dateLabel(slice.arriveAt)}</p>
      </div>
    </div>
  );
}

export function ItineraryDetail({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="space-y-6">
      {itinerary.slices.map((slice) => (
        <section key={`${slice.origin}${slice.departAt}`} className="rounded-2xl border border-line bg-card p-4 sm:p-5">
          <SliceView slice={slice} />
          <ol className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
            {slice.segments.map((segment, index) => {
              const from = getAirport(segment.origin);
              const to = getAirport(segment.destination);
              return (
                <li key={`${segment.flightNumber}${segment.departAt}`}>
                  <p className="font-medium text-ink">
                    {segment.airlineName} {segment.flightNumber}
                    <span className="font-normal text-muted"> · {segment.aircraft}</span>
                  </p>
                  <p className="text-muted">
                    {timeLabel(segment.departAt)} {from?.city ?? segment.origin} to {timeLabel(segment.arriveAt)}{" "}
                    {to?.city ?? segment.destination}
                    <span> · {formatDuration(segment.durationMinutes)}</span>
                  </p>
                  {index < slice.segments.length - 1 && (
                    <p className="mt-2 text-xs uppercase tracking-wide text-sea">Connection</p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
