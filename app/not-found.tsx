import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <h1 className="font-serif text-4xl">That page is not on the route</h1>
      <p className="mt-3 text-muted">The fare may have expired, or the address is incomplete.</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-sea px-5 font-semibold text-white">
        Search flights
      </Link>
    </div>
  );
}
