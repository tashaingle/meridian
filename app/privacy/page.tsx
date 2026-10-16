import { LegalPage } from "@/components/legal";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        This demonstration stores the name, date of birth, contact email, phone number and the last four characters of
        a travel document number that you submit. The full document number and the card number are not kept. The card
        security code is not kept.
      </p>
      <p>
        Where the server can write a file, the booking is saved on that machine. Where a Supabase project is configured,
        the same record is saved there. A copy is also kept in this browser so you can open the confirmation again.
      </p>
      <p>
        There is no marketing list, no advertising profile and no sale of personal information. A live service will
        need its own privacy notice, a lawful basis, and a way to request deletion. Do not use real identity documents
        until that notice is in place.
      </p>
    </LegalPage>
  );
}
