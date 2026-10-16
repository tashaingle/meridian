import Image from "next/image";
import { LookupForm } from "@/components/lookup";

export const metadata = { title: "Manage booking" };

export default function BookingsPage() {
  return (
    <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-10 lg:grid-cols-[1fr_280px]">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Find a booking</h1>
        <p className="mt-2 max-w-xl text-muted">
          Use the reference from the confirmation and the contact email. Bookings made in this browser can still be
          opened here if the server has not stored them.
        </p>
        <div className="mt-6">
          <LookupForm />
        </div>
      </div>
      <div className="relative hidden aspect-[16/9] overflow-hidden rounded-3xl lg:block">
        <Image
          src="/photos/jet-dusk.jpg"
          alt="A white passenger jet above the ocean at dusk."
          fill
          className="object-cover"
          sizes="280px"
        />
      </div>
    </div>
  );
}
