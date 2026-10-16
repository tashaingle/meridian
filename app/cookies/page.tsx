import { LegalPage } from "@/components/legal";

export const metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies">
      <p>
        Meridian uses a cookie only for the staff sign-in, and only after a password is entered. It is an httpOnly
        cookie that lasts twelve hours.
      </p>
      <p>
        Demonstration bookings are stored in the browser&apos;s local storage under the key meridian.bookings.v1, on the
        device where the booking was made. That is not an advertising cookie. You can clear it in the browser.
      </p>
      <p>There is no analytics or advertising tag in this start of the project.</p>
    </LegalPage>
  );
}
