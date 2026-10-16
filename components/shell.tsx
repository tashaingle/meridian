import Link from "next/link";
import { duffelMode } from "@/lib/duffel";

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_LIVE_BOOKING === "true") return null;
  const mode = duffelMode();
  const copy =
    mode === "test"
      ? "Duffel test fares. These are not real airline prices. No payment is taken, and no ticket is issued."
      : mode === "live"
        ? "Live Duffel fares. No payment is taken, and no ticket is issued."
        : "Demonstration for Umrah flight search. Sample fares, no payment taken, and no ticket issued.";
  return <p className="bg-sea-deep px-4 py-2 text-center text-sm text-sand">{copy}</p>;
}

export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1b6b66" />
      <path d="M6 21c5.2-.6 7.2-7 10-7s4.6 6.2 10 7" fill="none" stroke="#f6f1e7" strokeWidth="1.6" />
      <circle cx="16" cy="13.2" r="1.5" fill="#f6f1e7" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <Mark />
          <span className="font-serif text-xl tracking-tight">Meridian</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/" className="hover:text-ink">
            Fares
          </Link>
          <Link href="/bookings" className="hover:text-ink">
            Manage booking
          </Link>
          <Link href="/admin" className="hover:text-ink">
            Staff
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-sea-deep text-sand">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl text-white">Meridian</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-sand/80">
            Umrah flight search for travel agents in the UK, the US and Canada. Hotels and visas come later. The trading name is still to be confirmed.
          </p>
        </div>
        <div className="text-sm leading-7">
          <p className="font-medium text-white">Travellers</p>
          <Link href="/bookings" className="block hover:text-white">
            Find a booking
          </Link>
          <Link href="/refunds" className="block hover:text-white">
            Refunds
          </Link>
          <a href="mailto:support@example.com" className="block hover:text-white">
            support@example.com
          </a>
        </div>
        <div className="text-sm leading-7">
          <p className="font-medium text-white">Legal drafts</p>
          <Link href="/terms" className="block hover:text-white">
            Terms
          </Link>
          <Link href="/privacy" className="block hover:text-white">
            Privacy
          </Link>
          <Link href="/cookies" className="block hover:text-white">
            Cookies
          </Link>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-sand/70">
        Not a live travel agency. No consumer-protection registration, payment or airline contract is in place on this demonstration.
      </p>
    </footer>
  );
}
